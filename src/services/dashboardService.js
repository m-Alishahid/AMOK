// // services/dashboardService.js
// import api from '@/lib/api';

// export const dashboardService = {
//   // Get dashboard data based on user role
//   getDashboardData: async () => {
//     const response = await api.get('/dashboard');
//     return response.data;
//   },
  

//   // Get admin dashboard stats
//   getAdminStats: async () => {
//     const response = await api.get('/dashboard/admin');
//     return response.data;
//   },

//   // Get vendor dashboard stats
//   getVendorStats: async () => {
//     const response = await api.get('/dashboard/vendor');
//     return response.data;
//   },

//   // Get recent activity
//   getRecentActivity: async (limit = 10) => {
//     const response = await api.get('/dashboard/activity', {
//       params: { limit }
//     });
//     return response.data;
//   },

//   // Get sales analytics
//   getSalesAnalytics: async (period = 'monthly') => {
//     const response = await api.get('/dashboard/analytics', {
//       params: { period }
//     });
//     return response.data;
//   },

//   // Get low stock alerts
//   getLowStockAlerts: async () => {
//     const response = await api.get('/dashboard/low-stock');
//     return response.data;
//   },

//   // Get pending requests
//   getPendingRequests: async () => {
//     const response = await api.get('/dashboard/pending-requests');
//     return response.data;
//   }
// };









import api from '@/lib/api';

export const dashboardService = {
  // Get dashboard data based on user role
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Get admin dashboard stats
  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Get vendor dashboard stats
  getVendorStats: async () => {
    const response = await api.get('/dashboard/vendor');
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async (limit = 10) => {
    const response = await api.get('/dashboard/activity', {
      params: { limit }
    });
    return response.data;
  },

  // Get sales analytics
  getSalesAnalytics: async (period = 'monthly') => {
    const response = await api.get('/dashboard/analytics', {
      params: { period }
    });
    return response.data;
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    const response = await api.get('/dashboard/low-stock');
    return response.data;
  },

  // Get pending requests
  getPendingRequests: async () => {
    const response = await api.get('/dashboard/pending-requests');
    return response.data;
  },

  // Update invoice
  updateInvoice: async (invoiceId, updateData) => {
    const response = await api.put(`/invoices/${invoiceId}`, updateData);
    return response.data;
  }
};