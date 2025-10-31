import api from '@/lib/api';

export const orderService = {
  // ✅ CREATE NEW ORDER
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // ✅ GET ALL ORDERS (Admin)
  getAll: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // ✅ GET ORDERS BY CUSTOMER
  getByCustomer: async (customerId, params = {}) => {
    const response = await api.get(`/orders/customer/${customerId}`, { params });
    return response.data;
  },

  // ✅ GET ORDER BY ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // ✅ GET ORDER BY ORDER NUMBER
  getByOrderNumber: async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  // ✅ UPDATE ORDER STATUS
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // ✅ UPDATE PAYMENT STATUS
  updatePaymentStatus: async (id, paymentStatus) => {
    const response = await api.patch(`/orders/${id}/payment-status`, { paymentStatus });
    return response.data;
  },

  // ✅ CANCEL ORDER
  cancel: async (id, reason = '') => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // ✅ REQUEST RETURN
  requestReturn: async (id, returnData) => {
    const response = await api.post(`/orders/${id}/return`, returnData);
    return response.data;
  },

  // ✅ APPROVE RETURN
  approveReturn: async (id, returnId, refundAmount = null) => {
    const response = await api.post(`/orders/${id}/return/${returnId}/approve`, { refundAmount });
    return response.data;
  },

  updateReturnStatus: async (id, returnId, status, notes = null) => {
    const response = await api.patch(`/orders/${id}/return/${returnId}/status`, { status, notes });
    return response.data;
  },

  // ✅ UPDATE TRACKING INFO
  updateTracking: async (id, trackingData) => {
    const response = await api.patch(`/orders/${id}/tracking`, trackingData);
    return response.data;
  },

  // ✅ MARK AS DELIVERED
  markDelivered: async (id) => {
    const response = await api.patch(`/orders/${id}/deliver`);
    return response.data;
  },

  // ✅ GET ORDER ANALYTICS
  getAnalytics: async (startDate, endDate) => {
    const response = await api.get('/orders/analytics', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // ✅ GET RECENT ORDERS
  getRecent: async (limit = 10) => {
    const response = await api.get('/orders/recent', { params: { limit } });
    return response.data;
  },

  // ✅ GET ORDERS BY STATUS
  getByStatus: async (status, page = 1, limit = 20) => {
    const response = await api.get('/orders/status/' + status, {
      params: { page, limit }
    });
    return response.data;
  },

  // ✅ PROCESS COD PAYMENT
  processCODPayment: async (id, collectedAmount, collectedBy, notes = '') => {
    const response = await api.post(`/orders/${id}/cod-payment`, {
      collectedAmount,
      collectedBy,
      notes
    });
    return response.data;
  }
};
