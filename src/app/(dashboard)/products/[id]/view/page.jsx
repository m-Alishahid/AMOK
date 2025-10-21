"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { productService } from '@/services/productService';

export default function ViewProduct() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productService.getById(id);
      if (response.success) {
        setProduct(response.data);
      } else {
        alert("Product not found");
        router.push('/products');
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      alert("Failed to load product");
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        const response = await productService.delete(id);
        if (response.success) {
          alert("Product deleted successfully!");
          router.push('/products');
        }
      } catch (error) {
        alert("Failed to delete product.");
        console.error("Delete error:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <Link href="/products" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600 mt-2">Product details and complete information</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/products/${id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Product
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-200 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Product
              </button>
              <Link
                href="/products"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition duration-200 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Products
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Product Images */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Images</h2>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className={`relative border-2 rounded-lg overflow-hidden ${
                      product.thumbnail === image ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200'
                    }`}>
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      {product.thumbnail === image && (
                        <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-br-lg">
                          Thumbnail
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-lg">No images available</p>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{product.description}</p>
              </div>
            </div>

            {/* Product Properties */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    product.requiresSize ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 font-medium text-gray-900">Size Required</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.requiresSize ? 'Yes' : 'No'}
                  </p>
                </div>

                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    product.requiresColor ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h3 className="mt-2 font-medium text-gray-900">Color Required</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.requiresColor ? 'Yes' : 'No'}
                  </p>
                </div>

                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    product.hasVariants ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="mt-2 font-medium text-gray-900">Has Variants</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.hasVariants ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Variants</h2>
                <div className="space-y-6">
                  {product.variants.map((variant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Variant {index + 1}
                        {variant.size && (
                          <span className="ml-2 text-blue-600 font-medium">(Size: {variant.size})</span>
                        )}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Variant Details */}
                        <div className="space-y-4">
                          {variant.fabric && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Type:</label>
                              <p className="text-gray-900 font-medium">{variant.fabric}</p>
                            </div>
                          )}
                          
                          {variant.size && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Size:</label>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {variant.size}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Colors & Stock */}
                        {product.requiresColor && variant.colors && variant.colors.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Colors & Stock:</label>
                            <div className="space-y-3">
                              {variant.colors.map((color, colorIndex) => (
                                <div key={colorIndex} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center space-x-3">
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ 
                                        backgroundColor: color.color.toLowerCase() === 'red' ? '#ef4444' :
                                                       color.color.toLowerCase() === 'blue' ? '#3b82f6' :
                                                       color.color.toLowerCase() === 'green' ? '#10b981' :
                                                       color.color.toLowerCase() === 'black' ? '#000000' :
                                                       color.color.toLowerCase() === 'white' ? '#ffffff' :
                                                       color.color.toLowerCase() === 'yellow' ? '#f59e0b' : '#6b7280'
                                      }}
                                    ></div>
                                    <span className="font-medium text-gray-900">{color.color}</span>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    color.stock > 10 ? 'bg-green-100 text-green-800' :
                                    color.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {color.stock} in stock
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Product Summary */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded border">{product._id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900 font-medium">{product.category?.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    product.status === 'Active' 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : product.status === 'Draft'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {product.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock</label>
                  <p className="text-2xl font-bold text-gray-900">{product.totalStock || 0}</p>
                  <p className="text-sm text-gray-500">units available</p>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Cost Price:</span>
                  <span className="text-gray-900 font-medium">${product.costPrice?.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Sale Price:</span>
                  <span className="text-gray-900 font-medium">${product.salePrice?.toFixed(2)}</span>
                </div>
                
                {product.discountedPrice > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Discounted Price:</span>
                      <span className="text-green-600 font-bold">${product.discountedPrice?.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Discount:</span>
                      <span className="text-green-600 font-medium">
                        {product.discountPercentage}% OFF
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">You Save:</span>
                      <span className="text-green-600 font-medium">
                        ${(product.salePrice - product.discountedPrice)?.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-semibold">Profit:</span>
                    <span className={`text-lg font-bold ${
                      product.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${product.profit?.toFixed(2)}
                    </span>
                  </div>
                  
                  {product.profit > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Profit Margin:</span>
                      <span className="text-green-600 font-medium">
                        {Math.round((product.profit / product.costPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics & Statistics */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Analytics & Statistics</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{product.views || 0}</div>
                    <div className="text-sm text-blue-700 font-medium">Views</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{product.sales || 0}</div>
                    <div className="text-sm text-green-700 font-medium">Sales</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(product.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(product.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  href={`/products/${id}/edit`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Product
                </Link>
                
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Product
                </button>
                
                <Link
                  href="/products"
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


