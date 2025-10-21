"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';

export default function EditProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    costPrice: "",
    salePrice: "",
    discountedPrice: "",
    category: "",
    // NAYE FIELDS ADD KIYE
    requiresSize: false,
    requiresColor: false,
    hasVariants: false,
    variants: [{ size: "", colors: [{ color: "", stock: "" }], fabric: "" }],
    images: [],
    thumbnailIndex: 0,
    status: "Active"
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (id) {
      fetchProduct();
      loadCategories();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await productService.getById(id);
      if (response.success) {
        const product = response.data;
        
        // Store existing images separately
        setExistingImages(product.images || []);
        
        // Find thumbnail index
        const thumbnailIndex = product.thumbnail ? 
          product.images.indexOf(product.thumbnail) : 0;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          costPrice: product.costPrice?.toString() || "",
          salePrice: product.salePrice?.toString() || "",
          discountedPrice: product.discountedPrice?.toString() || "",
          category: product.category?._id || "",
          // NAYE FIELDS SET KIYE
          requiresSize: product.requiresSize || false,
          requiresColor: product.requiresColor || false,
          hasVariants: product.hasVariants || false,
          variants: product.variants?.length > 0 ? product.variants : [{ size: "", colors: [{ color: "", stock: "" }], fabric: "" }],
          images: [], // New images will be added here
          thumbnailIndex: thumbnailIndex,
          status: product.status || "Active"
        });
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      alert("Failed to load product data");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "category") {
      setFormData({ ...formData, category: value });
    } else if (name.startsWith("variants.")) {
      const parts = name.split(".");
      const index = parseInt(parts[1]);
      const key = parts[2];
      const newVariants = [...formData.variants];
      
      if (key === "colors") {
        const colorIndex = parseInt(parts[3]);
        const subKey = parts[4];
        if (subKey === "color") {
          newVariants[index].colors[colorIndex].color = value;
        } else if (subKey === "stock") {
          newVariants[index].colors[colorIndex].stock = value;
        }
      } else {
        newVariants[index][key] = value;
      }
      setFormData({ ...formData, variants: newVariants });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: "", colors: [{ color: "", stock: "" }], fabric: "" }],
    });
  };

  const addColor = (variantIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].colors.push({ color: "", stock: "" });
    setFormData({ ...formData, variants: newVariants });
  };

  const removeColor = (variantIndex, colorIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].colors.splice(colorIndex, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...files],
    }));
  };
  
  const setThumbnail = (index) => {
    setFormData(prev => ({
      ...prev,
      thumbnailIndex: index,
    }));
  };
  
  const removeImage = (indexToRemove) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, index) => index !== indexToRemove);
      let newThumbnailIndex = prev.thumbnailIndex;

      if (prev.thumbnailIndex === indexToRemove) {
        newThumbnailIndex = (newImages.length > 0 || existingImages.length > 0) ? 0 : 0;
      } else if (prev.thumbnailIndex > indexToRemove) {
        newThumbnailIndex = prev.thumbnailIndex - 1;
      }
      
      return {
        ...prev,
        images: newImages,
        thumbnailIndex: newThumbnailIndex,
      };
    });
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(prev => {
      const newImages = prev.filter((_, index) => index !== indexToRemove);
      
      // Adjust thumbnail index if needed
      if (formData.thumbnailIndex === indexToRemove + formData.images.length) {
        setFormData(prevForm => ({
          ...prevForm,
          thumbnailIndex: newImages.length > 0 ? 0 : 0
        }));
      } else if (formData.thumbnailIndex > indexToRemove + formData.images.length) {
        setFormData(prevForm => ({
          ...prevForm,
          thumbnailIndex: prevForm.thumbnailIndex - 1
        }));
      }
      
      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('costPrice', formData.costPrice);
      formDataToSend.append('salePrice', formData.salePrice);
      formDataToSend.append('discountedPrice', formData.discountedPrice || '');
      formDataToSend.append('category', formData.category);
      // NAYE FIELDS ADD KIYE
      formDataToSend.append('requiresSize', formData.requiresSize);
      formDataToSend.append('requiresColor', formData.requiresColor);
      formDataToSend.append('hasVariants', formData.hasVariants);
      formDataToSend.append('variants', JSON.stringify(formData.variants));
      formDataToSend.append('thumbnailIndex', formData.thumbnailIndex);
      formDataToSend.append('status', formData.status);
      
      // Append existing images (as URLs)
      existingImages.forEach((imageUrl, index) => {
        formDataToSend.append(`existingImages[${index}]`, imageUrl);
      });
      
      // Append new images
      formData.images.forEach((file, index) => {
        if (file instanceof File) {
          formDataToSend.append(`images[${index}]`, file);
        }
      });

      const result = await productService.update(id, formDataToSend);

      if (result.success) {
        alert("Product updated successfully!");
        router.push('/products');
      } else {
        alert(result.error || "Failed to update product.");
      }
    } catch (error) {
      console.error('Product update error:', error);
      alert("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total images count (existing + new)
  const totalImages = [...existingImages, ...formData.images];

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Action Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-t-lg shadow-md border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition shadow-md"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          
          {/* Form Column */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-xl overflow-hidden p-6">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Base Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Title
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="Enter a descriptive and unique product title"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="Enter a detailed product description, including material, features, and care instructions."
                    />
                  </div>

                  {/* Status Field */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Properties Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresSize"
                      checked={formData.requiresSize}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Requires Size</div>
                      <div className="text-sm text-gray-500">Product has different sizes</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresColor"
                      checked={formData.requiresColor}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Requires Color</div>
                      <div className="text-sm text-gray-500">Product has different colors</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasVariants"
                      checked={formData.hasVariants}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Has Variants</div>
                      <div className="text-sm text-gray-500">Product has multiple variants</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Pricing Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price ($)
                    </label>
                    <input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Discounted Price ($)
                    </label>
                    <input
                      type="number"
                      id="discountedPrice"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="Optional"
                    />
                    {formData.discountedPrice && (
                      <p className="text-sm text-green-600 mt-1">
                        {Math.round(((formData.salePrice - formData.discountedPrice) / formData.salePrice) * 100)}% discount
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Category</h2>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Product Images */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Images</h2>
                <div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {/* Image Preview Thumbnails */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {/* Existing Images */}
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className={`w-36 border-2 rounded-lg p-1 transition ${
                        formData.thumbnailIndex === (index + formData.images.length) ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-300'
                      }`}>
                        <div className="w-full h-24 overflow-hidden rounded-md mb-2">
                          <img src={imageUrl} alt={`Existing Product Image ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex justify-between items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setThumbnail(index + formData.images.length)}
                            disabled={formData.thumbnailIndex === (index + formData.images.length)}
                            className={`flex-1 text-xs font-medium py-1 px-1 rounded transition ${
                              formData.thumbnailIndex === (index + formData.images.length) 
                                ? 'bg-blue-600 text-white cursor-default' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {formData.thumbnailIndex === (index + formData.images.length) ? 'Thumbnail Set' : 'Set Thumbnail'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* New Images */}
                    {formData.images.map((file, index) => (
                      <div key={`new-${index}`} className={`w-36 border-2 rounded-lg p-1 transition ${
                        formData.thumbnailIndex === index ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-300'
                      }`}>
                        <div className="w-full h-24 overflow-hidden rounded-md mb-2">
                          <img src={URL.createObjectURL(file)} alt={`New Product Image ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex justify-between items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setThumbnail(index)}
                            disabled={formData.thumbnailIndex === index}
                            className={`flex-1 text-xs font-medium py-1 px-1 rounded transition ${
                              formData.thumbnailIndex === index 
                                ? 'bg-blue-600 text-white cursor-default' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {formData.thumbnailIndex === index ? 'Thumbnail Set' : 'Set Thumbnail'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Variants - Conditionally Rendered */}
              {formData.hasVariants && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Variants</h2>
                  <div className="space-y-6">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
                          Variant {index + 1} ({variant.size || 'New Size'})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
                          {/* Size - Conditionally Rendered */}
                          {formData.requiresSize && (
                            <div>
                              <label htmlFor={`variants.${index}.size`} className="block text-sm font-medium text-gray-700 mb-1">
                                Size
                              </label>
                              <select
                                id={`variants.${index}.size`}
                                name={`variants.${index}.size`}
                                value={variant.size}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                              >
                                <option value="">Select size</option>
                                {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          )}
                          
                          {/* Fabric */}
                          <div>
                            <label htmlFor={`variants.${index}.fabric`} className="block text-sm font-medium text-gray-700 mb-1">
                              Fabric
                            </label>
                            <input
                              type="text"
                              id={`variants.${index}.fabric`}
                              name={`variants.${index}.fabric`}
                              value={variant.fabric}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                              placeholder="e.g., Cotton, Polyester"
                            />
                          </div>
                          
                          {/* Colors and Stock - Conditionally Rendered */}
                          {formData.requiresColor && (
                            <div className="sm:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Colors & Stock
                              </label>
                              <div className="space-y-3">
                                {variant.colors.map((color, colorIndex) => (
                                  <div key={colorIndex} className="flex items-center space-x-3">
                                    <input
                                      type="text"
                                      id={`variants.${index}.colors.${colorIndex}.color`}
                                      name={`variants.${index}.colors.${colorIndex}.color`}
                                      value={color.color}
                                      onChange={handleChange}
                                      placeholder="Color name (e.g., Red)"
                                      className="flex-1 border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                                    />
                                    <input
                                      type="number"
                                      id={`variants.${index}.colors.${colorIndex}.stock`}
                                      name={`variants.${index}.colors.${colorIndex}.stock`}
                                      value={color.stock}
                                      onChange={handleChange}
                                      placeholder="Stock"
                                      min="0"
                                      className="w-20 border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeColor(index, colorIndex)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addColor(index)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mt-2"
                                >
                                  <span className="mr-1 text-lg leading-none">+</span> Add Color Option
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addVariant}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center mt-4"
                    >
                      <span className="mr-2">+</span> Add Another Variant
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-1">
            {/* You can add the ProductPreview component here if needed */}
            <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Product Summary</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Product Name</h3>
                  <p className="text-gray-900">{formData.name || "No name set"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Category</h3>
                  <p className="text-gray-900">
                    {categories.find(cat => cat._id === formData.category)?.name || "No category selected"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Properties</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.requiresSize && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                        Size
                      </span>
                    )}
                    {formData.requiresColor && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                        Color
                      </span>
                    )}
                    {formData.hasVariants && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        Variants
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Total Images</h3>
                  <p className="text-gray-900">{totalImages.length} images</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Total Variants</h3>
                  <p className="text-gray-900">{formData.variants.length} variants</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}