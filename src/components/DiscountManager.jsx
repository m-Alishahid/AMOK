"use client";

import { useState, useEffect } from "react";
import { discountService } from '@/services/discountService';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  Eye
} from "lucide-react";

export default function DiscountManager() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
    status: "Active",
    autoRemove: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [discountsRes, productsRes, categoriesRes] = await Promise.all([
        discountService.getAll(),
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

  const checkExpiredDiscounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/discounts/expire', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check expiry');
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Auto-expiry check completed: ${result.message}`);
        loadData();
      } else {
        alert(result.error || 'Failed to check expiry');
      }
    } catch (error) {
      console.error('Failed to check expired discounts:', error);
      alert('Failed to check expired discounts');
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
      const submitData = { ...formData };
      submitData.discountValue = parseFloat(submitData.discountValue);
      
      if (submitData.scope !== 'category') {
        submitData.category = undefined;
      }
      
      if (submitData.scope !== 'selected') {
        submitData.products = [];
      }

      const result = await discountService.create(submitData);
      if (result.success) {
        alert('Discount created successfully!');
        setShowForm(false);
        resetForm();
        loadData();
      } else {
        alert(result.error || 'Failed to create discount');
      }
    } catch (error) {
      console.error('Create discount error:', error);
      alert('Failed to create discount. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async (discountId) => {
    if (!confirm('Are you sure you want to remove this discount?')) return;

    try {
      const result = await discountService.delete(discountId);
      if (result.success) {
        alert('Discount removed successfully!');
        loadData();
      } else {
        alert(result.error || 'Failed to remove discount');
      }
    } catch (error) {
      console.error('Remove discount error:', error);
      alert('Failed to remove discount');
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
      status: "Active",
      autoRemove: true
    });
    setSelectedProducts([]);
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

  const affectedProducts = getAffectedProducts();

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowForm(false)}
            variant="outline"
            size="icon"
            className="border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Create New Discount</h2>
            <p className="text-blue-700">Set up a new discount for your products</p>
          </div>
        </div>

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
                <Label htmlFor="name" className="text-blue-900 font-medium">Discount Name</Label>
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
                  <Label htmlFor="discountType" className="text-blue-900 font-medium">Discount Type</Label>
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
                    {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                  </Label>
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                    required
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope" className="text-blue-900 font-medium">Apply To</Label>
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

              {formData.scope === 'category' && (
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-blue-900 font-medium">Category</Label>
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
                  <Label htmlFor="startDate" className="text-blue-900 font-medium">Start Date</Label>
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
                  <Label htmlFor="endDate" className="text-blue-900 font-medium">End Date</Label>
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
                <Checkbox
                  id="autoRemove"
                  name="autoRemove"
                  checked={formData.autoRemove}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRemove: checked }))}
                  className="border-blue-300 data-[state=checked]:bg-blue-600"
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
                    <Label className="text-green-900 font-medium">Select Products</Label>
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

        <div className="flex gap-4 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || affectedProducts.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Discount
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Discount Management</h1>
          <p className="text-blue-700 mt-1">Create and manage product discounts and promotions</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={checkExpiredDiscounts}
            disabled={loading}
            variant="default"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <AlertTriangle className="h-4 w-4" />
            {loading ? 'Checking...' : 'Check Expiry'}
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Discount
          </Button>
        </div>
      </div>

      {/* Discounts Table */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader className="bg-blue-100/50 rounded-t-lg">
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Active Discounts
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage all your current discounts and promotions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-blue-700 mt-4">Loading discounts...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100/50 hover:bg-blue-100/50">
                    <TableHead className="text-blue-900 font-bold">Name</TableHead>
                    <TableHead className="text-blue-900 font-bold">Type</TableHead>
                    <TableHead className="text-blue-900 font-bold">Value</TableHead>
                    <TableHead className="text-blue-900 font-bold">Scope</TableHead>
                    <TableHead className="text-blue-900 font-bold">Status</TableHead>
                    <TableHead className="text-blue-900 font-bold">Expires</TableHead>
                    <TableHead className="text-blue-900 font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount._id} className="border-blue-100 hover:bg-blue-50/50">
                      <TableCell className="font-medium text-blue-900">
                        <div>
                          <p className="font-semibold">{discount.name}</p>
                          {discount.description && (
                            <p className="text-sm text-blue-700">{discount.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          discount.discountType === 'percentage' 
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }>
                          {discount.discountType === 'percentage' ? (
                            <Percent className="h-3 w-3 mr-1" />
                          ) : (
                            <DollarSign className="h-3 w-3 mr-1" />
                          )}
                          {discount.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-900">
                          {discount.discountType === 'percentage' 
                            ? `${discount.discountValue}%`
                            : `$${discount.discountValue}`
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                          {discount.scope}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            isExpired(discount.endDate) 
                              ? "bg-red-100 text-red-800 border-red-200" 
                              : isExpiringSoon(discount.endDate)
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          {isExpired(discount.endDate) ? 'Expired' :
                          isExpiringSoon(discount.endDate) ? 'Expiring Soon' :
                          'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-900 font-medium">
                            {new Date(discount.endDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-blue-600">
                            {new Date(discount.endDate).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDiscount(discount._id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {discounts.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold text-lg mb-2 text-blue-900">No Discounts Found</h3>
                  <p className="text-blue-700 mb-4">
                    Get started by creating your first discount to boost sales
                  </p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Discount
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Discounts</p>
                <p className="text-2xl font-bold text-blue-600">{discounts.length}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {discounts.filter(d => !isExpired(d.endDate)).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-orange-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {discounts.filter(d => isExpiringSoon(d.endDate)).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {discounts.filter(d => isExpired(d.endDate)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}