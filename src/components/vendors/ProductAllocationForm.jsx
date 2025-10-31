// components/vendors/ProductAllocationForm.jsx
"use client";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package, IndianRupee, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { vendorService } from '@/services/vendorService';
import { productService } from '@/services/productService';

export function ProductAllocationForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([{ id: 1 }]);
  const [productVariants, setProductVariants] = useState({});
  const [loadingVariants, setLoadingVariants] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorService.getAll();
      setVendors(response.data?.vendors || []);
    } catch (error) {
      console.error('Failed to load vendors:', error);
      toast.error('Failed to load vendors');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ 
        status: 'Active', 
        limit: 1000 
      });
      const productsData = response.data?.products || [];
      setProducts(productsData);
      
      // ✅ PRELOAD VARIANTS FOR ALL PRODUCTS
      await loadAllProductVariants(productsData);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    }
  };

  // ✅ LOAD ALL PRODUCT VARIANTS
  const loadAllProductVariants = async (productsData) => {
    setLoadingVariants(true);
    try {
      const productIds = productsData.map(p => p._id);
      const response = await productService.getBatchVariants(productIds);
      
      if (response.success) {
        setProductVariants(response.data);
      }
    } catch (error) {
      console.error('Failed to load variants:', error);
      toast.error('Failed to load product variants');
    } finally {
      setLoadingVariants(false);
    }
  };

  // ✅ LOAD VARIANTS FOR SINGLE PRODUCT
  const loadProductVariants = async (productId) => {
    try {
      const response = await productService.getVariants(productId);
      if (response.success) {
        setProductVariants(prev => ({
          ...prev,
          [productId]: response.data
        }));
      }
      return response.data;
    } catch (error) {
      console.error('Failed to load product variants:', error);
      toast.error('Failed to load product variants');
      return null;
    }
  };

  const addProductField = () => {
    setSelectedProducts(prev => [...prev, { id: Date.now() }]);
  };

  const removeProductField = (id) => {
    if (selectedProducts.length > 1) {
      setSelectedProducts(prev => prev.filter(item => item.id !== id));
    }
  };

  // ✅ GET PRODUCT VARIANTS FROM STATE
  const getProductVariants = (productId) => {
    return productVariants[productId]?.variants || [];
  };

  // ✅ GET PRODUCT INFO
  const getProductInfo = (productId) => {
    return products.find(p => p._id === productId) || null;
  };

  // ✅ GET AVAILABLE SIZES FOR PRODUCT
  const getAvailableSizes = (productId) => {
    return productVariants[productId]?.sizes || ['Standard'];
  };

  // ✅ GET AVAILABLE COLORS FOR SIZE
  const getAvailableColors = (productId, size) => {
    const variantsData = productVariants[productId];
    if (!variantsData) return [];
    
    if (variantsData.variantsBySize && variantsData.variantsBySize[size]) {
      return variantsData.variantsBySize[size];
    }
    
    // Fallback to filtering from variants
    const variants = variantsData.variants || [];
    return variants
      .filter(v => v.size === size)
      .map(v => ({ color: v.color, stock: v.stock }));
  };

  // ✅ GET SELECTED VARIANT STOCK
  const getSelectedVariantStock = (productId, size, color) => {
    const variants = getProductVariants(productId);
    const variant = variants.find(v => v.size === size && v.color === color);
    return variant ? variant.stock : getProductInfo(productId)?.totalStock || 0;
  };

  // ✅ CALCULATE PROFIT
  const calculateProfit = (costPrice, vendorPrice) => {
    return vendorPrice - costPrice;
  };

  // ✅ WHEN PRODUCT CHANGES, RESET VARIANT FIELDS AND LOAD VARIANTS
  const handleProductChange = async (productId, itemId) => {
    setValue(`size_${itemId}`, '');
    setValue(`color_${itemId}`, '');
    setValue(`vendorPrice_${itemId}`, '');
    setValue(`availableStock_${itemId}`, '');
    
    // Load variants if not already loaded
    if (!productVariants[productId]) {
      await loadProductVariants(productId);
    }
    
    const product = getProductInfo(productId);
    if (product) {
      // Set default vendor price as cost price + 10%
      const defaultVendorPrice = product.costPrice * 1.1;
      setValue(`vendorPrice_${itemId}`, defaultVendorPrice.toFixed(2));
    }
  };

  // ✅ WHEN SIZE CHANGES, UPDATE COLORS
  const handleSizeChange = (productId, size, itemId) => {
    setValue(`size_${itemId}`, size);
    setValue(`color_${itemId}`, '');
    
    const colors = getAvailableColors(productId, size);
    if (colors.length === 1) {
      setValue(`color_${itemId}`, colors[0].color);
      updateVariantStock(productId, size, colors[0].color, itemId);
    } else {
      setValue(`availableStock_${itemId}`, '');
    }
  };

  // ✅ WHEN COLOR CHANGES, UPDATE STOCK
  const handleColorChange = (productId, size, color, itemId) => {
    setValue(`color_${itemId}`, color);
    updateVariantStock(productId, size, color, itemId);
  };

  // ✅ UPDATE VARIANT STOCK DISPLAY
  const updateVariantStock = (productId, size, color, itemId) => {
    const stock = getSelectedVariantStock(productId, size, color);
    setValue(`availableStock_${itemId}`, stock);
    
    // Auto-adjust quantity if it exceeds available stock
    const currentQuantity = parseInt(watch(`quantity_${item.id}`)) || 0;
    if (currentQuantity > stock) {
      setValue(`quantity_${itemId}`, stock);
      toast.info(`Quantity adjusted to available stock: ${stock}`);
    }
  };

  // const onSubmit = async (data) => {
  //   setLoading(true);
  //   try {
  //     // ✅ FORMAT PRODUCTS DATA WITH PROFIT CALCULATION
  //     const productsData = selectedProducts
  //       .map((item) => {
  //         const productId = data[`product_${item.id}`];
  //         const quantity = parseInt(data[`quantity_${item.id}`]) || 0;
  //         const size = data[`size_${item.id}`] || 'Standard';
  //         const color = data[`color_${item.id}`] || 'Standard';
  //         const vendorPrice = parseFloat(data[`vendorPrice_${item.id}`]) || 0;

  //         // Validate required fields
  //         if (!productId || quantity <= 0 || vendorPrice <= 0) {
  //           return null;
  //         }

  //         const product = getProductInfo(productId);
  //         if (!product) {
  //           toast.error(`Product not found`);
  //           return null;
  //         }

  //         // Validate variant stock
  //         const availableStock = getSelectedVariantStock(productId, size, color);
  //         if (quantity > availableStock) {
  //           toast.error(`Insufficient stock for ${product.name} - ${size}/${color}. Available: ${availableStock}`);
  //           return null;
  //         }

  //         // Calculate profit
  //         const profitPerPiece = calculateProfit(product.costPrice, vendorPrice);
  //         if (profitPerPiece < 0) {
  //           toast.error(`Vendor price should be greater than cost price (₹${product.costPrice}) for ${product.name}`);
  //           return null;
  //         }

  //         return {
  //           productId: productId,
  //           quantity: quantity,
  //           size: size,
  //           color: color,
  //           fabric: product.variants?.find(v => v.size === size)?.fabric || '',
  //           costPrice: product.costPrice,
  //           salePrice: product.salePrice,
  //           vendorPrice: vendorPrice,
  //           profitPerPiece: profitPerPiece
  //         };
  //       })
  //       .filter(item => item !== null);

  //     if (productsData.length === 0) {
  //       toast.error('Please add at least one product with valid data');
  //       return;
  //     }

  //     if (!data.vendorId) {
  //       toast.error('Please select a vendor');
  //       return;
  //     }

  //     const result = await vendorService.allocateProducts(data.vendorId, productsData);
      
  //     if (result.success) {
  //       toast.success('Products allocated successfully with profit tracking!');
  //       reset();
  //       setSelectedProducts([{ id: 1 }]);
  //       onSuccess?.();
  //     } else {
  //       toast.error(result.error || 'Failed to allocate products');
  //     }
  //   } catch (error) {
  //     console.error('Allocation error:', error);
  //     toast.error(error.response?.data?.error || 'Failed to allocate products');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // components/vendors/ProductAllocationForm.jsx - UPDATED onSubmit function
const onSubmit = async (data) => {
  setLoading(true);
  try {
    // ✅ FORMAT PRODUCTS DATA WITH PROPER VALIDATION
    const productsData = selectedProducts
      .map((item) => {
        const productId = data[`product_${item.id}`];
        const quantity = parseInt(data[`quantity_${item.id}`]) || 0;
        const size = data[`size_${item.id}`] || '';
        const color = data[`color_${item.id}`] || '';
        const vendorPrice = parseFloat(data[`vendorPrice_${item.id}`]) || 0;

        console.log('🔄 Processing item:', { productId, quantity, size, color, vendorPrice });

        // Validate required fields
        if (!productId || quantity <= 0 || vendorPrice <= 0) {
          console.log('❌ Validation failed for item:', item.id);
          return null;
        }

        const product = getProductInfo(productId);
        if (!product) {
          toast.error(`Product not found`);
          return null;
        }

        // Validate variant stock
        const variants = getProductVariants(productId);
        if (size || color) {
          const selectedVariant = variants.find(v => v.size === size && v.color === color);
          if (!selectedVariant) {
            toast.error(`Selected variant not available for ${product.name}`);
            return null;
          }
          if (selectedVariant.stock < quantity) {
            toast.error(`Insufficient stock for ${product.name} - ${size}/${color}. Available: ${selectedVariant.stock}`);
            return null;
          }
        } else {
          // Check general stock
          if (product.totalStock < quantity) {
            toast.error(`Insufficient stock for ${product.name}. Available: ${product.totalStock}`);
            return null;
          }
        }

        // Calculate profit
        const profitPerPiece = calculateProfit(product.costPrice, vendorPrice);
        if (profitPerPiece < 0) {
          toast.error(`Vendor price should be greater than cost price (₹${product.costPrice}) for ${product.name}`);
          return null;
        }

        const productData = {
          productId: productId,
          quantity: quantity,
          size: size,
          color: color,
          fabric: variants.find(v => v.size === size && v.color === color)?.fabric || '',
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          vendorPrice: vendorPrice,
          profitPerPiece: profitPerPiece
        };

        console.log('✅ Product data prepared:', productData);
        return productData;
      })
      .filter(item => item !== null);

    console.log('📦 Final products data:', productsData);

    if (productsData.length === 0) {
      toast.error('Please add at least one product with valid data');
      return;
    }

    if (!data.vendorId) {
      toast.error('Please select a vendor');
      return;
    }

    const result = await vendorService.allocateProducts(data.vendorId, productsData);
    
    if (result.success) {
      toast.success('Products allocated successfully with profit tracking!');
      reset();
      setSelectedProducts([{ id: 1 }]);
      onSuccess?.();
    } else {
      toast.error(result.error || 'Failed to allocate products');
    }
  } catch (error) {
    console.error('❌ Allocation error:', error);
    toast.error(error.response?.data?.error || 'Failed to allocate products');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            Allocate Products to Vendor
            {loadingVariants && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Vendor Selection */}
            <div className="space-y-4">
              <Label htmlFor="vendorId">Select Vendor *</Label>
              <Select 
                onValueChange={(value) => setValue('vendorId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor._id} value={vendor._id}>
                      {vendor.companyName} - {vendor.contactPerson}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Allocation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Products Allocation *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProductField}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Product
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                {selectedProducts.map((item) => (
                  <Card key={item.id} className="relative border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="absolute top-3 right-3">
                        {selectedProducts.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProductField(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* Product Selection */}
                        <div className="space-y-2">
                          <Label>Product *</Label>
                          <Select
                            onValueChange={async (value) => {
                              setValue(`product_${item.id}`, value);
                              await handleProductChange(value, item.id);
                            }}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product._id} value={product._id}>
                                  <div className="flex items-center space-x-2">
                                    <Package className="w-4 h-4" />
                                    <span className="truncate">{product.name}</span>
                                    <Badge variant="secondary" className="ml-2">
                                      Stock: {product.totalStock}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <Select
                            onValueChange={(value) => {
                              const productId = watch(`product_${item.id}`);
                              handleSizeChange(productId, value, item.id);
                            }}
                            value={watch(`size_${item.id}`) || ''}
                            disabled={!watch(`product_${item.id}`)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={
                                watch(`product_${item.id}`) ? "Select size" : "Select product first"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {watch(`product_${item.id}`) && 
                                getAvailableSizes(watch(`product_${item.id}`)).map(size => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Select
                            onValueChange={(value) => {
                              const productId = watch(`product_${item.id}`);
                              const size = watch(`size_${item.id}`);
                              handleColorChange(productId, size, value, item.id);
                            }}
                            value={watch(`color_${item.id}`) || ''}
                            disabled={!watch(`size_${item.id}`)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={
                                watch(`size_${item.id}`) ? "Select color" : "Select size first"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {watch(`product_${item.id}`) && watch(`size_${item.id}`) && 
                                getAvailableColors(watch(`product_${item.id}`), watch(`size_${item.id}`)).map(colorObj => (
                                  <SelectItem key={colorObj.color} value={colorObj.color}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-4 h-4 rounded-full border"
                                        style={{ 
                                          backgroundColor: colorObj.color.toLowerCase() === 'standard' ? '#6b7280' : colorObj.color.toLowerCase(),
                                          borderColor: '#ccc'
                                        }}
                                      />
                                      {colorObj.color}
                                      <Badge variant="outline" className="ml-2">
                                        {colorObj.stock}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              {...register(`quantity_${item.id}`, {
                                required: "Quantity is required",
                                min: { value: 1, message: "Minimum quantity is 1" },
                                validate: {
                                  maxStock: (value) => {
                                    const productId = watch(`product_${item.id}`);
                                    const size = watch(`size_${item.id}`) || 'Standard';
                                    const color = watch(`color_${item.id}`) || 'Standard';
                                    const availableStock = getSelectedVariantStock(productId, size, color);
                                    return value <= availableStock || `Max available: ${availableStock}`;
                                  }
                                }
                              })}
                              placeholder="Qty"
                              min="1"
                              max={watch(`availableStock_${item.id}`) || 9999}
                            />
                            {watch(`availableStock_${item.id}`) && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <AlertCircle className="w-3 h-3" />
                                <span>Available: {watch(`availableStock_${item.id}`)}</span>
                              </div>
                            )}
                            {errors[`quantity_${item.id}`] && (
                              <p className="text-red-500 text-xs">{errors[`quantity_${item.id}`].message}</p>
                            )}
                          </div>
                        </div>

                        {/* Vendor Price */}
                        <div className="space-y-2">
                          <Label>Vendor Price *</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              className="pl-10"
                              {...register(`vendorPrice_${item.id}`, {
                                required: "Vendor price is required",
                                min: { value: 0.01, message: "Price must be greater than 0" }
                              })}
                              placeholder="0.00"
                              step="0.01"
                            />
                          </div>
                          {watch(`product_${item.id}`) && (
                            <p className="text-xs text-gray-500">
                              Cost: ₹{getProductInfo(watch(`product_${item.id}`))?.costPrice}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Profit Calculation Display */}
                      {watch(`product_${item.id}`) && watch(`vendorPrice_${item.id}`) && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-green-700">Cost Price:</span>
                              <p className="text-green-600">₹{getProductInfo(watch(`product_${item.id}`))?.costPrice}</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-700">Vendor Price:</span>
                              <p className="text-green-600">₹{parseFloat(watch(`vendorPrice_${item.id}`)).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-700">Profit/Piece:</span>
                              <p className="text-green-600 font-bold">
                                ₹{calculateProfit(
                                  getProductInfo(watch(`product_${item.id}`))?.costPrice || 0,
                                  parseFloat(watch(`vendorPrice_${item.id}`)) || 0
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || loadingVariants}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Allocating...
                  </>
                ) : (
                  'Allocate Products'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}