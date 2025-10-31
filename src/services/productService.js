// services/productService.js
import api from '@/lib/api';

export const productService = {
  // Get all products with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get products by category
  getByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/products/category/${categoryId}`, { params });
    return response.data;
  },

  // Create new product
  create: async (productData) => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Update product status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/products/${id}/status`, { status });
    return response.data;
  },

  // Increment product views
  incrementViews: async (id) => {
    const response = await api.patch(`/products/${id}/views`);
    return response.data;
  },

  // ✅ GET PRODUCT VARIANTS
  getVariants: async (productId) => {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  },

  // ✅ GET BATCH PRODUCTS VARIANTS
  getBatchVariants: async (productIds) => {
    const response = await api.post('/products/variants/batch', { productIds });
    return response.data;
  },

  // ✅ CHECK STOCK AVAILABILITY
  checkStock: async (productId, size = null, color = null, quantity = 1) => {
    const response = await api.get(`/products/${productId}/check-stock`, {
      params: { size, color, quantity }
    });
    return response.data;
  }
};