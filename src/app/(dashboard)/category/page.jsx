"use client";

import { useState, useRef, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import { toast } from "sonner";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";

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
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate flex items-center gap-2">
              <Tag className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
              Categories Management
            </h1>
            <p className="text-gray-600 mt-1 text-xs xs:text-sm md:text-base truncate">Manage your product categories and their properties</p>
          </div>
          {/* <button
            onClick={() => {
              setFormMode('add');
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-sm text-xs sm:text-sm w-full xs:w-auto touch-manipulation flex-shrink-0 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={submitLoading}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="truncate">{submitLoading ? 'Loading...' : 'Add Category'}</span>
          </button> */}
        </div>
      </div>



      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base font-medium">Loading categories...</p>
        </div>
      )}

      {/* Categories DataTable */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            {/* Add Category Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900">All Categories</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    onClick={() => {
                      setFormMode('add');
                      resetForm();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-small py-1 px-4 rounded-lg shadow-sm transition duration-200 flex items-center gap-2 w-full sm:w-auto touch-manipulation disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={submitLoading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Category
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={currentCategory.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200 text-xs sm:text-sm ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter category name"
                          disabled={submitLoading}
                        />
                        {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="border-t border-gray-200 pt-4 sm:pt-6">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                        Category Image *
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
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
                          className="cursor-pointer bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-sm text-xs sm:text-sm touch-manipulation disabled:bg-gray-400 flex-shrink-0"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Choose Image
                        </label>
                        <span className="text-xs text-gray-500">
                          JPEG, PNG, WebP (Max 5MB)
                        </span>
                      </div>
                      {errors.image && <p className="text-red-500 text-xs sm:text-sm mt-1.5 sm:mt-2">{errors.image}</p>}

                      {/* Image Preview */}
                      {(imagePreview || currentCategory.image) && (
                        <div className="mt-4">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                            Image Preview
                          </label>
                          <div className="relative inline-block">
                            <img
                              src={imagePreview || currentCategory.image}
                              alt="Preview"
                              className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full p-1 transition duration-200 shadow-md touch-manipulation disabled:bg-red-400"
                              disabled={submitLoading}
                            >
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="border-t border-gray-200 pt-4 sm:pt-6">
                      <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        value={currentCategory.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition duration-200 text-xs sm:text-sm ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter category description"
                        disabled={submitLoading}
                      />
                      {errors.description && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSaveCategory}
                        disabled={submitLoading}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition duration-200 flex items-center justify-center shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm flex-1"
                      >
                        {submitLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Add Category
                          </>
                        )}
                      </button>
                      <button
                        onClick={resetForm}
                        disabled={submitLoading}
                        className="bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-medium py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <DataTable
              columns={[
                {
                  key: 'category',
                  label: 'Category',
                  sortable: true,
                  render: (value, item) => (
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover border border-gray-300 shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-600 line-clamp-1 hidden sm:block">{item.description}</div>
                        {item.isFeatured && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  sortable: true,
                  render: (value, item) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(item._id, item.status)}
                      className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                        item.status === 'Active'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        item.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {item.status}
                    </Button>
                  )
                }
              ]}
              data={categories}
              actions={[
                {
                  label: 'Edit',
                  icon: Edit,
                  onClick: handleEditCategory,
                  variant: 'ghost'
                },
                {
                  label: 'Delete',
                  icon: Trash2,
                  onClick: (item) => handleDeleteCategory(item._id),
                  variant: 'destructive'
                }
              ]}
              searchable={true}
              paginated={true}
              pageSize={10}
              loading={loading}
              emptyMessage="No categories found"
              searchPlaceholder="Search categories..."
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow duration-200">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{categories.length}</div>
            <div className="text-xs sm:text-sm font-medium text-gray-700">Total Categories</div>
          </div>
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow duration-200">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
              {categories.filter(cat => cat.status === 'Active').length}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-700">Active</div>
          </div>
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow duration-200">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">
              {categories.filter(cat => cat.isFeatured).length}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-700">Featured</div>
          </div>
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow duration-200">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
              {categories.filter(cat => cat.taxRate > 0).length}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-700">Taxable</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">Get started by creating your first product category.</p>
            <button
              onClick={() => {
                setFormMode('add');
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition duration-200 shadow-sm text-xs sm:text-sm touch-manipulation"
            >
              Create First Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
}