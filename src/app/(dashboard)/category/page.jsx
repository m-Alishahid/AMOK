"use client";

import { useState, useRef, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import { toast } from "sonner";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    description: "",
    image: "",
    isFeatured: false,
    status: "Active"
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Load categories from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Convert image file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: "Please upload a valid image (JPEG, PNG, WebP)" }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
        return;
      }

      try {
        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // Convert to base64 for Cloudinary upload
        const base64Image = await convertToBase64(file);
        setCurrentCategory(prev => ({
          ...prev,
          image: base64Image
        }));

        // Clear any previous image errors
        if (errors.image) {
          setErrors(prev => ({ ...prev, image: "" }));
        }
      } catch (error) {
        console.error('Error converting image:', error);
        setErrors(prev => ({ ...prev, image: "Failed to process image" }));
      }
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setCurrentCategory(prev => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!currentCategory.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (currentCategory.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    }

    if (!currentCategory.description.trim()) {
      newErrors.description = "Description is required";
    } else if (currentCategory.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!currentCategory.image) {
      newErrors.image = "Category image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSaveCategory = async () => {
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      if (formMode === 'add') {
        await categoryService.create(currentCategory);
        toast.success('Category created successfully!');
      } else {
        await categoryService.update(currentCategory._id, currentCategory);
        toast.success('Category updated successfully!');
      }
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Edit category
  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setImagePreview(category.image);
    setFormMode('edit');
    setShowForm(true);
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This will also delete the category page.")) return;

    try {
      await categoryService.delete(id);
      toast.success('Category deleted successfully!');
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(error.message);
    }
  };

  // Toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await categoryService.toggleStatus(id, newStatus);
      toast.success(`Category ${newStatus.toLowerCase()} successfully!`);
      loadCategories();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentCategory({
      name: "", 
      description: "", 
      image: "",
      isFeatured: false,
      status: "Active"
    });
    setImagePreview(null);
    setErrors({});
    setShowForm(false);
    setFormMode('add');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setCurrentCategory(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-600 mt-1">Manage your product categories and their properties</p>
          </div>
          <button
            onClick={() => {
              setFormMode('add');
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center shadow-sm"
            disabled={submitLoading}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {submitLoading ? 'Loading...' : 'Add New Category'}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {formMode === 'add' ? 'Add New Category' : 'Edit Category'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 transition duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={currentCategory.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black transition duration-200 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category name"
                  disabled={submitLoading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image *
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  id="image-upload"
                  disabled={submitLoading}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choose Image
                </label>
                <span className="text-sm text-gray-500">
                  JPEG, PNG, WebP (Max 5MB)
                </span>
              </div>
              {errors.image && <p className="text-red-500 text-sm mt-2">{errors.image}</p>}
              
              {/* Image Preview */}
              {(imagePreview || currentCategory.image) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Image Preview
                  </label>
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview || currentCategory.image} 
                      alt="Preview" 
                      className="h-40 w-40 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition duration-200 shadow-md"
                      disabled={submitLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={currentCategory.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black transition duration-200 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter category description"
                disabled={submitLoading}
              />
              {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveCategory}
                disabled={submitLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200 flex items-center justify-center shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex-1"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {formMode === 'add' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {formMode === 'add' ? 'Add Category' : 'Update Category'}
                  </>
                )}
              </button>
              <button
                onClick={resetForm}
                disabled={submitLoading}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-8 rounded-lg transition duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Loading State */}
       {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading categories...</p>
        </div>
      )}

      {/* Categories Table */}
      {!loading && categories.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="h-14 w-14 rounded-lg object-cover border border-gray-300 shadow-sm"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{category.description}</div>
                            {category.isFeatured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 mt-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(category._id, category.status)}
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
                            category.status === 'Active' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            category.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {category.status}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition duration-200 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600 hover:text-red-800 font-medium transition duration-200 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{categories.length}</div>
              <div className="text-sm font-medium text-gray-700">Total Categories</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {categories.filter(cat => cat.status === 'Active').length}
              </div>
              <div className="text-sm font-medium text-gray-700">Active Categories</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {categories.filter(cat => cat.isFeatured).length}
              </div>
              <div className="text-sm font-medium text-gray-700">Featured Categories</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {categories.filter(cat => cat.taxRate > 0).length}
              </div>
              <div className="text-sm font-medium text-gray-700">Taxable Categories</div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first product category.</p>
            <button
              onClick={() => {
                setFormMode('add');
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 shadow-sm"
            >
              Create First Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
}