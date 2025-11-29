"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { discountService } from "@/services/discountService";
import DiscountManager from "@/components/DiscountManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  Tag, 
  Percent, 
  // TrendingUp, 
  Plus, 
  ArrowLeft,
  Activity,
  ShoppingCart,
  Users,
  FolderOpen
} from "lucide-react";

export default function Dashboard() {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [activeDiscounts, setActiveDiscounts] = useState(0);
  const [discountedProducts, setDiscountedProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [chartView, setChartView] = useState("daily");
  const [showDiscountManager, setShowDiscountManager] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {
      user: { view: false, create: false, edit: false, delete: false, change_role: false },
      category: { view: false, create: false, edit: false, delete: false },
      product: { view: false, create: false, edit: false, delete: false },
      order: { view: false, create: false, edit: false, delete: false, update_status: false },
      inventory: { view: false, create: false, edit: false, delete: false },
      analytics: { view: false, export: false },
      settings: { view: false, edit: false }
    }
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-blue-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchStats = async () => {
      if (isAuthenticated) {
        try {
          const [productsResponse, categoriesResponse, discountsResponse] = await Promise.all([
            productService.getAll(),
            categoryService.getAll(),
            discountService.getAll({ status: 'Active' })
          ]);

          const products = productsResponse.data?.products || productsResponse.products || [];
          const categories = categoriesResponse.data || [];
          const discounts = discountsResponse.data || [];

          setTotalProducts(products.length);
          setTotalCategories(categories.length);
          setActiveDiscounts(discounts.length);

          const discountedCount = products.filter(product => product.discountedPrice > 0).length;
          setDiscountedProducts(discountedCount);

          setTrendingProducts(products.slice(0, 4));

          // Fetch dashboard stats from API
          try {
            const dashboardResponse = await fetch('/api/dashboard');
            if (dashboardResponse.ok) {
              const dashboardData = await dashboardResponse.json();
              if (dashboardData.success) {
                setTotalOrders(dashboardData.data.stats.totalOrders);
              }
            }
          } catch (error) {
            console.error("Error fetching dashboard stats:", error);
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  const [recentActivities] = useState([
    {
      id: 1,
      type: "product",
      action: "New product added",
      details: '"Wireless Headphones"',
      timestamp: "2 hours ago",
      icon: "📦",
      color: "blue",
    },
    {
      id: 2,
      type: "order",
      action: "Order completed",
      details: "Order #1234",
      timestamp: "4 hours ago",
      icon: "✅",
      color: "green",
    },
    {
      id: 3,
      type: "user",
      action: "New user registered",
      details: "john@example.com",
      timestamp: "1 day ago",
      icon: "👤",
      color: "purple",
    },
    {
      id: 4,
      type: "category",
      action: "New category added",
      details: '"Electronics"',
      timestamp: "3 hours ago",
      icon: "🏷️",
      color: "orange",
    },
  ]);

  const getChartData = () => {
    const now = new Date();

    if (chartView === "daily") {
      const dataPoints = [];
      // Start from 9 AM today
      const startDate = new Date(now);
      startDate.setHours(9, 0, 0, 0);

      for (let i = 0; i < 24; i++) {
        const date = new Date(startDate);
        date.setHours(startDate.getHours() + i);
        dataPoints.push({
          period: date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
          orders: Math.floor(Math.random() * 10) + 1,
          revenue: Math.floor(Math.random() * 5000) + 5000,
        });
      }
      return dataPoints;
    } else if (chartView === "weekly") {
      const dataPoints = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i * 7);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dataPoints.push({
          period: `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          orders: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 2500) + 500,
        });
      }
      return dataPoints;
    } else {
      const dataPoints = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        dataPoints.push({
          period: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          orders: Math.floor(Math.random() * 200) + 50,
          revenue: Math.floor(Math.random() * 10000) + 2000,
        });
      }
      return dataPoints;
    }
  };

  const chartData = getChartData();

  // Role form handlers
  const handleRoleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('permissions.')) {
      const [, module, action] = name.split('.');
      setRoleForm(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: {
            ...prev.permissions[module],
            [action]: type === 'checkbox' ? checked : value
          }
        }
      }));
    } else {
      setRoleForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setLoadingRole(true);

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleForm),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Role created successfully' });
        setRoleForm({
          name: '',
          description: '',
          permissions: {
            user: { view: false, create: false, edit: false, delete: false, change_role: false },
            category: { view: false, create: false, edit: false, delete: false },
            product: { view: false, create: false, edit: false, delete: false },
            order: { view: false, create: false, edit: false, delete: false, update_status: false },
            inventory: { view: false, create: false, edit: false, delete: false },
            analytics: { view: false, export: false },
            settings: { view: false, edit: false }
          }
        });
        setIsCreateRoleDialogOpen(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create role' });
    } finally {
      setLoadingRole(false);
    }
  };

  if (showDiscountManager) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowDiscountManager(false)}
            variant="default"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
        </div>
        <DiscountManager />
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight truncate">Dashboard</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground truncate mt-1">
            Welcome back, Admin • {new Date().toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={() => setShowDiscountManager(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-lg touch-manipulation transition-all duration-150 shadow-sm flex-shrink-0"
        >
          <Percent className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">Manage Discounts</span>
        </Button>
      </div>



      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[
          {
            label: "Total Products",
            value: loadingStats ? "..." : totalProducts,
            subtext: `${discountedProducts} on discount`,
            icon: Package,
            color: "text-blue-600",
            bg: "bg-gradient-to-br from-blue-50 to-blue-100",
            border: "border-blue-200",
            // trend: "+12%",
            // trendColor: "text-green-600",
          },
          {
            label: "Active Discounts",
            value: loadingStats ? "..." : activeDiscounts,
            subtext: "Running promotions",
            icon: Percent,
            color: "text-green-600",
            bg: "bg-gradient-to-br from-green-50 to-green-100",
            border: "border-green-200",
            // trend: "+5%",
            // trendColor: "text-green-600",
          },
          {
            label: "Total Categories",
            value: loadingStats ? "..." : totalCategories,
            subtext: "Product categories",
            icon: Tag,
            color: "text-purple-600",
            bg: "bg-gradient-to-br from-purple-50 to-purple-100",
            border: "border-purple-200",
            // trend: "0%",
            // trendColor: "text-gray-500",
          },
          {
            label: "Total Orders",
            value: loadingStats ? "..." : totalOrders,
            subtext: "All time orders",
            icon: ShoppingCart,
            color: "text-orange-600",
            bg: "bg-gradient-to-br from-orange-50 to-orange-100",
            border: "border-orange-200",
            // trend: "+18%",
            // trendColor: "text-green-600",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} ${stat.border} rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bg} group-hover:bg-white/50 transition-colors duration-300`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <div className={`text-xs font-medium ${stat.trendColor} flex items-center gap-1`}>
                {/* <TrendingUp className="h-3 w-3" /> */}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className={`text-xl sm:text-3xl font-bold ${stat.color} mt-1 sm:mt-2`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Quick Actions */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-sm sm:text-base text-blue-900">Quick Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-blue-700">Manage your store quickly</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-4">
            <Button
              onClick={() => router.push('/products/add')}
              className="h-auto flex-col items-center justify-center p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2 bg-white hover:bg-blue-50 border border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm active:bg-blue-100 transition-colors duration-150 touch-manipulation rounded-lg"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span className="font-semibold text-center text-xs">Add Product</span>
              <span className="text-xs text-blue-600 text-center hidden sm:block">Create</span>
            </Button>

            <Button
              onClick={() => setShowDiscountManager(true)}
              className="h-auto flex-col items-center justify-center p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2 bg-white hover:bg-blue-50 border border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm active:bg-blue-100 transition-colors duration-150 touch-manipulation rounded-lg"
            >
              <Percent className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span className="font-semibold text-center text-xs">Discount</span>
              <span className="text-xs text-blue-600 text-center hidden sm:block">Create</span>
            </Button>

            <Button
              onClick={() => router.push('/categories')}
              className="h-auto flex-col items-center justify-center p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2 bg-white hover:bg-blue-50 border border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm active:bg-blue-100 transition-colors duration-150 touch-manipulation rounded-lg"
            >
              <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span className="font-semibold text-center text-xs">Categories</span>
              <span className="text-xs text-blue-600 text-center hidden sm:block">Manage</span>
            </Button>

            <Button
              onClick={() => router.push('/products')}
              className="h-auto flex-col items-center justify-center p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2 bg-white hover:bg-blue-50 border border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm active:bg-blue-100 transition-colors duration-150 touch-manipulation rounded-lg"
            >
              <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span className="font-semibold text-center text-xs">Products</span>
              <span className="text-xs text-blue-600 text-center hidden sm:block">View All</span>
            </Button>

            <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="h-auto flex-col items-center justify-center p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2 bg-white hover:bg-blue-50 border border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm active:bg-blue-100 transition-colors duration-150 touch-manipulation rounded-lg"
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <span className="font-semibold text-center text-xs">Create Role</span>
                  <span className="text-xs text-blue-600 text-center hidden sm:block">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific permissions for your system.
                  </DialogDescription>
                </DialogHeader>

                {message.text && (
                  <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                    <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleRoleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={roleForm.name}
                      onChange={handleRoleFormChange}
                      placeholder="Enter role name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={roleForm.description}
                      onChange={handleRoleFormChange}
                      placeholder="Enter role description"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Permissions</Label>

                    {/* User Permissions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">User Management</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.user.view"
                            checked={roleForm.permissions.user.view}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">View</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.user.create"
                            checked={roleForm.permissions.user.create}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Create</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.user.edit"
                            checked={roleForm.permissions.user.edit}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Edit</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.user.delete"
                            checked={roleForm.permissions.user.delete}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Delete</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.user.change_role"
                            checked={roleForm.permissions.user.change_role}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Change Role</span>
                        </label>
                      </div>
                    </div>

                    {/* Category Permissions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Category Management</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.category.view"
                            checked={roleForm.permissions.category.view}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">View</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.category.create"
                            checked={roleForm.permissions.category.create}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Create</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.category.edit"
                            checked={roleForm.permissions.category.edit}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Edit</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.category.delete"
                            checked={roleForm.permissions.category.delete}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Delete</span>
                        </label>
                      </div>
                    </div>

                    {/* Product Permissions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Product Management</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.product.view"
                            checked={roleForm.permissions.product.view}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">View</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.product.create"
                            checked={roleForm.permissions.product.create}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Create</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.product.edit"
                            checked={roleForm.permissions.product.edit}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Edit</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.product.delete"
                            checked={roleForm.permissions.product.delete}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Delete</span>
                        </label>
                      </div>
                    </div>

                    {/* Order Permissions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Order Management</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.order.view"
                            checked={roleForm.permissions.order.view}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">View</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.order.create"
                            checked={roleForm.permissions.order.create}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Create</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.order.edit"
                            checked={roleForm.permissions.order.edit}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Edit</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.order.delete"
                            checked={roleForm.permissions.order.delete}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Delete</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.order.update_status"
                            checked={roleForm.permissions.order.update_status}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Update Status</span>
                        </label>
                      </div>
                    </div>

                    {/* Inventory Permissions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Inventory Management</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.inventory.view"
                            checked={roleForm.permissions.inventory.view}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">View</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.inventory.create"
                            checked={roleForm.permissions.inventory.create}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Create</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.inventory.edit"
                            checked={roleForm.permissions.inventory.edit}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Edit</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.inventory.delete"
                            checked={roleForm.permissions.inventory.delete}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Delete</span>
                        </label>
                      </div>
                    </div>

                    {/* Analytics Permissions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Analytics</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.analytics.view"
                            checked={roleForm.permissions.analytics.view}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">View</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.analytics.export"
                            checked={roleForm.permissions.analytics.export}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Export</span>
                        </label>
                      </div>
                    </div>

                    {/* Settings Permissions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Settings</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.settings.view"
                            checked={roleForm.permissions.settings.view}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">View</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="permissions.settings.edit"
                            checked={roleForm.permissions.settings.edit}
                            onChange={handleRoleFormChange}
                            className="rounded"
                          />
                          <span className="text-sm">Edit</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateRoleDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loadingRole}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loadingRole ? 'Creating...' : 'Create Role'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-sm sm:text-base text-blue-900 font-semibold">Sales Analytics</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-blue-700">Track your sales performance</CardDescription>
            </div>
            <Tabs value={chartView} onValueChange={setChartView} className="w-full sm:w-auto">
              <TabsList className="bg-blue-100 h-8 text-xs w-full sm:w-auto grid grid-cols-3 sm:flex">
                <TabsTrigger
                  value="daily"
                  className="px-2 py-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 hover:bg-blue-200"
                >
                  Daily
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="px-2 py-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 hover:bg-blue-200"
                >
                  Weekly
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="px-2 py-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 hover:bg-blue-200"
                >
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 md:px-6 pb-4">
          <div className="h-56 sm:h-64 md:h-80 lg:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="opacity-30 stroke-blue-200"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  className="text-xs"
                />
                <YAxis
                  domain={[5000, 'dataMax']}
                  ticks={[5000, 10000, 15000, 20000, 25000]}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                    return [value.toLocaleString(), 'Orders'];
                  }}
                  labelStyle={{ color: '#1f2937', fontWeight: '600' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    color: '#1f2937',
                    fontSize: '13px',
                    fontWeight: '500',
                    backdropFilter: 'blur(8px)'
                  }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stackId="1"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#ordersGradient)"
                  fillOpacity={1}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="2"
                  stroke="#1e40af"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  fillOpacity={1}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-blue-100 bg-white">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base text-blue-900">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-blue-700">Latest activities in your store</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
            <div className="space-y-2 sm:space-y-3 md:space-y-4 max-h-72 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors duration-150">
                  <div className={`rounded-full p-1 sm:p-2 flex-shrink-0 ${
                    activity.color === 'blue' ? 'bg-blue-100' :
                    activity.color === 'green' ? 'bg-green-100' :
                    activity.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <span className="text-xs sm:text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium leading-tight text-blue-900 truncate">{activity.action}</p>
                    <p className="text-xs text-blue-700 truncate">{activity.details}</p>
                  </div>
                  <div className="text-xs text-blue-600 whitespace-nowrap flex-shrink-0">{activity.timestamp}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Discounts Overview */}
        <Card className="border-blue-100 bg-white">
          <CardHeader className="pb-3 sm:pb-4 flex flex-row items-start sm:items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base text-blue-900">Active Discounts</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-blue-700">Currently running promotions</CardDescription>
            </div>
            <Button
              onClick={() => setShowDiscountManager(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg flex-shrink-0"
              size="sm"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
            {loadingStats ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse p-3 bg-blue-100 rounded-lg">
                    <div className="h-3 bg-blue-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-blue-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : activeDiscounts > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-blue-900">Summer Sale</h3>
                      <p className="text-xs text-blue-700">20% off on all products</p>
                    </div>
                    <Badge className="bg-blue-600 text-white text-xs flex-shrink-0">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Ends: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-green-900">Clearance</h3>
                      <p className="text-xs text-green-700">Up to 50% off selected items</p>
                    </div>
                    <Badge className="bg-green-600 text-white text-xs flex-shrink-0">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    Ends: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>

                <Button
                  onClick={() => setShowDiscountManager(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg"
                >
                  <Plus className="h-3 w-3 mr-1.5" />
                  Create New Discount
                </Button>
              </div>
            ) : (
              <div className="text-center p-6 sm:p-8 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                <Percent className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-sm sm:text-base mb-1 text-blue-900">No Active Discounts</h3>
                <p className="text-xs sm:text-sm text-blue-700 mb-4">Create your first discount to boost sales</p>
                <Button 
                  onClick={() => setShowDiscountManager(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 rounded-lg"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Create Discount
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}