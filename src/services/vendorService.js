// services/vendorService.js
import api from '@/lib/api';

export const vendorService = {
  // Get vendor's allocated products
  getVendorProducts: async (vendorId) => {
    const response = await api.get(`/vendors/${vendorId}/products`);
    return response.data;
  },

  // Get logged-in vendor's products
  getMyProducts: async () => {
    const response = await api.get('/auth/vendor/products');
    return response.data;
  },

  // Create new vendor
  create: async (vendorData) => {
    const response = await api.post('/vendors', vendorData);
    return response.data;
  },

  // Get all vendors
  getAll: async (params = {}) => {
    const response = await api.get('/vendors', { params });
    return response.data;
  },

  // Get vendor by ID
  getById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  // Update vendor
  update: async (id, vendorData) => {
    const response = await api.put(`/vendors/${id}`, vendorData);
    return response.data;
  },

  // Delete vendor
  delete: async (id) => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  },

  // Get my vendor profile
  getMyProfile: async () => {
    const response = await api.get('/vendors/me');
    return response.data;
  },

  // Allocate products to vendor
  allocateProducts: async (vendorId, productsData) => {
    const response = await api.post('/vendors/allocate', {
      vendorId,
      products: productsData
    });
    return response.data;
  },

  // Get allocated products with profit data
  getAllocatedProducts: async (vendorId) => {
    const response = await api.get(`/vendors/${vendorId}/allocated-products`);
    return response.data;
  },

  // Update stock
  updateStock: async (vendorId, stockData) => {
    const response = await api.patch(`/vendors/${vendorId}/stock`, stockData);
    return response.data;
  },

  // Request product deletion
  requestDelete: async (vendorId, productId, reason) => {
    const response = await api.post(`/vendors/${vendorId}/delete-request`, {
      productId,
      reason
    });
    return response.data;
  },

  // Get delete requests
  getDeleteRequests: async (vendorId = null) => {
    const url = vendorId 
      ? `/vendors/delete-requests?vendorId=${vendorId}`
      : '/vendors/delete-requests';
    const response = await api.get(url);
    return response.data;
  },

  // Process delete request
  processDeleteRequest: async (requestId, action, reviewedBy) => {
    const response = await api.patch(`/vendors/delete-requests/${requestId}`, {
      action,
      reviewedBy
    });
    return response.data;
  }
};