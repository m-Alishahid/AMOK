"use client";

import { useState, useEffect } from "react";
import { discountService } from '@/services/discountService';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/DataTable";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calendar,
  Package,
  Tag,
  AlertTriangle,
  Percent,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Play,
  Pause,
  RefreshCw,
  Users,
  TrendingUp
} from "lucide-react";

export default function DiscountManager() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    scope: "all",
    category: "",
    products: [],
    applicationMethod: "best_price",
    startDate: "",
    endDate: "",
    status: "Scheduled",
    autoRemove: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [discountsRes, productsRes, categoriesRes] = await Promise.all([
        discountService.getAll({ status: 'all' }),
        productService.getAll({ limit: 1000 }),
        categoryService.getAll()
      ]);

      if (discountsRes.success) setDiscounts(discountsRes.data);
      if (productsRes.success) setProducts(productsRes.data?.products || []);
      if (categoriesRes.success) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDiscountStatuses = async () => {
    try {
      setLoading(true);
      const result = await discountService.updateStatuses();
      
      if (result.success) {
        toast.success(`Auto-expiry check completed: ${result.message}`);
        loadData();
      } else {
        toast.error(result.error || 'Failed to check expiry');
      }
    } catch (error) {
      console.error('Failed to check expired discounts:', error);
      toast.error('Failed to check expired discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleProductSelection = (productId, isSelected) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId]);
      setFormData(prev => ({ ...prev, products: [...prev.products, productId] }));
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      setFormData(prev => ({ ...prev, products: prev.products.filter(id => id !== productId) }));
    }
  };

  const handleSelectAllProducts = () => {
    const allProductIds = products.map(product => product._id);
    setSelectedProducts(allProductIds);
    setFormData(prev => ({ ...prev, products: allProductIds }));
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
    setFormData(prev => ({ ...prev, products: [] }));
  };

  const calculateNewPrice = (product) => {
    if (!formData.discountValue) return product.salePrice;

    const discountValue = parseFloat(formData.discountValue);
    
    if (formData.discountType === 'percentage') {
      const discountAmount = product.salePrice * (discountValue / 100);
      return Math.max(0, product.salePrice - discountAmount);
    } else {
      return Math.max(0, product.salePrice - discountValue);
    }
  };

  const getAffectedProducts = () => {
    switch (formData.scope) {
      case 'all':
        return products;
      case 'category':
        return products.filter(product => product.category?._id === formData.category);
      case 'selected':
        return products.filter(product => selectedProducts.includes(product._id));
      default:
        return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { 
        ...formData,
        discountValue: parseFloat(formData.discountValue)
      };
      
      if (submitData.scope !== 'category') {
        submitData.category = undefined;
      }
      
      if (submitData.scope !== 'selected') {
        submitData.products = [];
      }

      let result;
      if (editingDiscount) {
        result = await discountService.update(editingDiscount._id, submitData);
      } else {
        result = await discountService.create(submitData);
      }

      if (result.success) {
        toast.success('Discount created successfully!');
        setShowForm(false);
        resetForm();
        loadData();
      } else {
        toast.error(result.error || 'Failed to create discount');
      }
    } catch (error) {
      console.error('Create discount error:', error);
      toast.error('Failed to create discount. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      description: discount.description || "",
      discountType: discount.discountType,
      discountValue: discount.discountValue.toString(),
      scope: discount.scope,
      category: discount.category?._id || "",
      products: discount.products?.map(p => p._id) || [],
      applicationMethod: discount.applicationMethod || "best_price",
      startDate: new Date(discount.startDate).toISOString().slice(0, 16),
      endDate: new Date(discount.endDate).toISOString().slice(0, 16),
      status: discount.status,
      autoRemove: discount.autoRemove !== undefined ? discount.autoRemove : true
    });
    setSelectedProducts(discount.products?.map(p => p._id) || []);
    setShowForm(true);
  };

  const handleRemoveDiscount = async (discountId) => {
    if (!confirm('Are you sure you want to remove this discount? This will restore original product prices.')) return;

    try {
      setLoading(true);
      const result = await discountService.removeDiscount(discountId);
      
      if (result.success) {
        toast.success('Discount removed successfully!');
        loadData();
      } else {
        toast.error(result.error || 'Failed to remove discount');
      }
    } catch (error) {
      console.error('Remove discount error:', error);
      toast.error('Failed to remove discount');
    }
  };

    const handleToggleStatus = async (discountId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const result = await discountService.update(discountId, { status: newStatus });
      
      if (result.success) {
        toast.success(`Discount ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
        loadData();
      } else {
        toast.error(result.error || 'Failed to update discount status');
      }
    } catch (error) {
      console.error('Toggle discount status error:', error);
      toast.error('Failed to remove discount');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      scope: "all",
      category: "",
      products: [],
      applicationMethod: "best_price",
      startDate: "",
      endDate: "",
      status: "Scheduled",
      autoRemove: true
    });
    setSelectedProducts([]);
    setEditingDiscount(null);
  };

  const isExpiringSoon = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const hoursUntilExpiry = (end - now) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const getStatusBadge = (discount) => {
    const statusConfig = {
      Active: { class: "bg-green-100 text-green-800 border-green-200", label: 'Active', icon: CheckCircle },
      Inactive: { class: "bg-gray-100 text-gray-800 border-gray-200", label: 'Inactive', icon: Pause },
      Expired: { class: "bg-red-100 hover-red-200 text-red-800 border-red-200", label: 'Expired', icon: Clock },
      Scheduled: { class: "bg-blue-100 text-blue-800 border-blue-200", label: 'Scheduled', icon: Calendar }
    };

    let status = discount.status;
    
    // Override status based on dates
    if (status === 'Active' && isExpiringSoon(discount.endDate)) {
      return { 
        class: "bg-orange-100 text-orange-800 border-orange-200", 
        label: 'Expiring Soon', 
        icon: AlertTriangle 
      };
    }
    
    if ((status === 'Active' || status === 'Scheduled') && isExpired(discount.endDate)) {
      return { 
        class: "bg-red-100 text-red-800 border-red-200", 
        label: 'Expired', 
        icon: Clock 
      };
    }

    return statusConfig[status] || statusConfig.Inactive;
  };

  const affectedProducts = getAffectedProducts();

  // Calculate statistics
  const stats = {
    total: discounts.length,
    active: discounts.filter(d => d.status === 'Active' && !isExpired(d.endDate)).length,
    scheduled: discounts.filter(d => d.status === 'Scheduled' && !isExpired(d.endDate)).length,
    expired: discounts.filter(d => d.status === 'Expired' || isExpired(d.endDate)).length,
    totalProductsAffected: discounts.reduce((sum, discount) => sum + (discount.totalProducts || 0), 0),
    totalDiscountAmount: discounts.reduce((sum, discount) => sum + (discount.totalDiscountAmount || 0), 0)
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            variant="outline"
            size="icon"
            className="border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
            </h2>
            <p className="text-blue-700">
              {editingDiscount ? 'Update your discount details' : 'Set up a new discount for your products'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Discount Details Card */}
            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader className="bg-blue-100/50 rounded-t-lg">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Discount Details
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Basic information about the discount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-blue-900 font-medium">Discount Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Summer Sale 2024"
                    required
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-blue-900 font-medium">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the discount..."
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType" className="text-blue-900 font-medium">Discount Type *</Label>
                    <Select
                      name="discountType"
                      value={formData.discountType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value }))}
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage" className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Percentage
                        </SelectItem>
                        <SelectItem value="fixed" className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Fixed Amount
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountValue" className="text-blue-900 font-medium">
                      {formData.discountType === 'percentage' ? 'Percentage (%) *' : 'Amount ($) *'}
                    </Label>
                    <Input
                      id="discountValue"
                      name="discountValue"
                      type="number"
                      step={formData.discountType === 'percentage' ? '0.1' : '0.01'}
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                      required
                      min="0"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicationMethod" className="text-blue-900 font-medium">Application Method</Label>
                    <Select
                      name="applicationMethod"
                      value={formData.applicationMethod}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, applicationMethod: value }))}
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="best_price">Best Price</SelectItem>
                        <SelectItem value="replace">Replace Existing</SelectItem>
                        <SelectItem value="additive">Additive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scope" className="text-blue-900 font-medium">Apply To *</Label>
                    <Select
                      name="scope"
                      value={formData.scope}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, scope: value }))}
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          All Products
                        </SelectItem>
                        <SelectItem value="category" className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Specific Category
                        </SelectItem>
                        <SelectItem value="selected" className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Selected Products
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.scope === 'category' && (
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-blue-900 font-medium">Category *</Label>
                    <Select
                      name="category"
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-blue-900 font-medium">Start Date *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-blue-900 font-medium">End Date *</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-blue-100 rounded-lg">
                  <Switch
                    id="autoRemove"
                    name="autoRemove"
                    checked={formData.autoRemove}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRemove: checked }))}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="autoRemove" className="text-blue-900 font-medium cursor-pointer">
                    Auto-remove when expired
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="border-green-100 bg-green-50/30">
              <CardHeader className="bg-green-100/50 rounded-t-lg">
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Discount Preview
                </CardTitle>
                <CardDescription className="text-green-700">
                  See how the discount will apply to your products
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {formData.scope === 'selected' && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-green-900 font-medium">Select Products *</Label>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="default" 
                          size="sm" 
                          onClick={handleSelectAllProducts}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Select All
                        </Button>
                        <Button 
                          type="button" 
                          variant="default" 
                          size="sm" 
                          onClick={handleClearSelection}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 border border-green-200 rounded-lg p-3 bg-white">
                      {products.map((product) => (
                        <div key={product._id} className="flex items-center space-x-2 p-2 hover:bg-green-50 rounded">
                          <Checkbox
                            checked={selectedProducts.includes(product._id)}
                            onCheckedChange={(checked) => handleProductSelection(product._id, checked)}
                            className="border-green-300 data-[state=checked]:bg-green-600"
                          />
                          <Label className="flex-1 text-green-900 cursor-pointer">{product.name}</Label>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            ${product.salePrice}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-green-900">Affected Products</h4>
                    <Badge className="bg-green-600 text-white">
                      {affectedProducts.length} products
                    </Badge>
                  </div>
                  {affectedProducts.slice(0, 5).map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-white">
                      <div>
                        <p className="font-medium text-green-900">{product.name}</p>
                        <p className="text-sm text-green-700">
                          Original: ${product.salePrice}
                          {product.discountedPrice > 0 && (
                            <span className="text-orange-600 ml-2">
                              (Current: ${product.discountedPrice})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600 text-lg">
                          ${calculateNewPrice(product).toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          Save {formData.discountType === 'percentage' ? `${formData.discountValue}%` : `$${formData.discountValue}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {affectedProducts.length > 5 && (
                    <p className="text-sm text-green-700 text-center font-medium">
                      +{affectedProducts.length - 5} more products will be affected
                    </p>
                  )}
                  {affectedProducts.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-green-200 rounded-lg bg-green-50/50">
                      <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-green-700 font-medium">No products will be affected</p>
                      <p className="text-sm text-green-600">Adjust your discount scope to see affected products</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 justify-end pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || affectedProducts.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  {editingDiscount ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {editingDiscount ? 'Update Discount' : 'Create Discount'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Discount Management</h1>
          <p className="text-blue-700 mt-1 text-sm sm:text-base">Create and manage product discounts and promotions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create Discount
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[
          {
            label: "Total Discounts",
            value: stats.total,
            icon: Tag,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active",
            value: stats.active,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Scheduled",
            value: stats.scheduled,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Expired/Inactive",
            value: stats.expired,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Products Affected",
            value: stats.totalProductsAffected,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Total Discount",
            value: `$${stats.totalDiscountAmount.toFixed(2)}`,
            icon: DollarSign,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className={`text-xl sm:text-3xl font-bold ${stat.color} mt-1 sm:mt-2`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">All Discounts</h2>
              <p className="text-gray-600 mt-1 text-sm">Manage your discount campaigns</p>
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: "name",
                label: "Name",
                sortable: true,
                render: (value, discount) => (
                  <div>
                    <p className="font-semibold">{value}</p>
                    {discount.description && (
                      <p className="text-sm text-gray-600">{discount.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {discount.applicationMethod || 'best_price'}
                      </Badge>
                      {discount.autoRemove && (
                        <Badge variant="outline" className="text-xs bg-green-50">
                          Auto-remove
                        </Badge>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "discountType",
                label: "Type",
                sortable: true,
                render: (value, discount) => (
                  <Badge className={
                    value === 'percentage'
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-green-100 text-green-800 border-green-200"
                  }>
                    {value === 'percentage' ? (
                      <Percent className="h-3 w-3 mr-1" />
                    ) : (
                      <DollarSign className="h-3 w-3 mr-1" />
                    )}
                    {value === 'percentage' ? 'Percentage' : 'Fixed'}
                  </Badge>
                ),
              },
              {
                key: "discountValue",
                label: "Value",
                sortable: true,
                render: (value, discount) => (
                  <span className="font-semibold">
                    {discount.discountType === 'percentage'
                      ? `${value}%`
                      : `$${value}`
                    }
                  </span>
                ),
              },
              {
                key: "scope",
                label: "Scope",
                sortable: true,
                render: (value, discount) => (
                  <div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                      {value}
                    </Badge>
                    {value === 'category' && discount.category && (
                      <p className="text-xs text-purple-600 mt-1">
                        {discount.category.name}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: "totalProducts",
                label: "Products",
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{value || 0}</span>
                  </div>
                ),
              },
              {
                key: "status",
                label: "Status",
                sortable: true,
                render: (value, discount) => {
                  const statusBadge = getStatusBadge(discount);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <Badge className={statusBadge.class}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusBadge.label}
                    </Badge>
                  );
                },
              },
              {
                key: "endDate",
                label: "Expires",
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="font-medium block">
                        {new Date(value).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(value).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ),
              },
            ]}
            data={discounts}
            actions={[
              {
                label: "Edit",
                icon: Edit,
                variant: "secondary",
                onClick: handleEditDiscount,
              },
              {
                label: "Toggle Status",
                icon: (discount) => discount.status === 'Active' ? Pause : Play,
                onClick: (discount) => handleToggleStatus(discount._id, discount.status),
                disabled: (discount) => !((discount.status === 'Active' || discount.status === 'Scheduled') && !isExpired(discount.endDate)),
                variant: "secondary",
              },
              {
                label: "Remove",
                icon: Trash2,
                variant: "secondary",
                onClick: handleRemoveDiscount,
              },
            ]}
            searchable={true}
            paginated={true}
            pageSize={10}
            loading={loading}
            emptyMessage="No discounts found. Create your first discount to boost sales."
            searchPlaceholder="Search discounts by name, type, or scope..."
          />
        </div>
      </div>
    </div>
  );
}
