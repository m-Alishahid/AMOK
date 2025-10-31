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
import { 
  Package, 
  Tag, 
  Percent, 
  TrendingUp, 
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
  const [chartView, setChartView] = useState("monthly");
  const [showDiscountManager, setShowDiscountManager] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        dataPoints.push({
          period: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          orders: Math.floor(Math.random() * 10) + 1,
          revenue: Math.floor(Math.random() * 500) + 100,
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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
            Welcome back, Admin • {new Date().toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={() => setShowDiscountManager(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 sm:py-3 text-sm"
        >
          <Percent className="h-4 w-4" />
          Manage Discounts
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{loadingStats ? "..." : totalProducts}</div>
            <p className="text-xs text-blue-700">
              {discountedProducts} on discount
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Active Discounts</CardTitle>
            <Percent className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{loadingStats ? "..." : activeDiscounts}</div>
            <p className="text-xs text-green-700">
              Running promotions
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Total Categories</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{loadingStats ? "..." : totalCategories}</div>
            <p className="text-xs text-purple-700">
              Product categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{loadingStats ? "..." : totalOrders}</div>
            <p className="text-xs text-orange-700">
              All time orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Actions</CardTitle>
          <CardDescription className="text-blue-700">Manage your store quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <Button
              onClick={() => router.push('/products/add')}
              className="h-auto flex-col items-center justify-center p-3 sm:p-4 space-y-2 bg-white hover:bg-blue-50 border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-semibold text-center">Add Product</span>
              <span className="text-xs text-blue-600 text-center hidden sm:block">Create new product</span>
            </Button>

            <Button
              onClick={() => setShowDiscountManager(true)}
              className="h-auto flex-col items-center justify-center p-3 sm:p-4 space-y-2 bg-white hover:bg-blue-50 border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
            >
              <Percent className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-semibold text-center">Create Discount</span>
              <span className="text-xs text-blue-600 text-center hidden sm:block">Add special offer</span>
            </Button>

            <Button
              onClick={() => router.push('/categories')}
              className="h-auto flex-col items-center justify-center p-3 sm:p-4 space-y-2 bg-white hover:bg-blue-50 border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
            >
              <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-semibold text-center">Manage Categories</span>
              <span className="text-xs text-blue-600 text-center hidden sm:block">View all categories</span>
            </Button>

            <Button
              onClick={() => router.push('/products')}
              className="h-auto flex-col items-center justify-center p-3 sm:p-4 space-y-2 bg-white hover:bg-blue-50 border-blue-600 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
            >
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-semibold text-center">View Products</span>
              <span className="text-xs text-blue-600 text-center hidden sm:block">All products list</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card className="border-blue-100 bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-blue-900">Sales Analytics</CardTitle>
              <CardDescription className="text-blue-700">Track your sales performance</CardDescription>
            </div>
            <Tabs value={chartView} onValueChange={setChartView} className="w-auto">
              <TabsList className="bg-blue-100">
                <TabsTrigger 
                  value="daily" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Daily
                </TabsTrigger>
                <TabsTrigger 
                  value="weekly" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Weekly
                </TabsTrigger>
                <TabsTrigger 
                  value="monthly" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`$${value}`, 'Revenue'];
                    return [value, 'Orders'];
                  }}
                  contentStyle={{ 
                    backgroundColor: '#1e40af', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="2"
                  stroke="#1e40af" 
                  fill="#1e40af" 
                  fillOpacity={0.4} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-blue-100 bg-white">
          <CardHeader>
            <CardTitle className="text-blue-900">Recent Activity</CardTitle>
            <CardDescription className="text-blue-700">Latest activities in your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 sm:space-x-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className={`rounded-full p-2 ${
                    activity.color === 'blue' ? 'bg-blue-100' :
                    activity.color === 'green' ? 'bg-green-100' :
                    activity.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none text-blue-900 truncate">{activity.action}</p>
                    <p className="text-sm text-blue-700 truncate">{activity.details}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 whitespace-nowrap">{activity.timestamp}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Discounts Overview */}
        <Card className="border-blue-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">Active Discounts</CardTitle>
              <CardDescription className="text-blue-700">Currently running promotions</CardDescription>
            </div>
            <Button
              onClick={() => setShowDiscountManager(true)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse p-4 bg-blue-100 rounded-lg">
                    <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-blue-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : activeDiscounts > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">Summer Sale</h3>
                      <p className="text-sm text-blue-700">20% off on all products</p>
                    </div>
                    <Badge className="bg-blue-600 text-white">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Ends: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-900">Clearance</h3>
                      <p className="text-sm text-green-700">Up to 50% off selected items</p>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    Ends: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>

                <Button
                  onClick={() => setShowDiscountManager(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Discount
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                <Percent className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold text-lg mb-2 text-blue-900">No Active Discounts</h3>
                <p className="text-blue-700 mb-4">Create your first discount to boost sales</p>
                <Button 
                  onClick={() => setShowDiscountManager(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
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