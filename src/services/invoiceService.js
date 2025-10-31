
// // services/invoiceService.js - UPDATED
// import api from '@/lib/api';

// export const invoiceService = {
//   // Get all invoices
//   getAll: async (params = {}) => {
//     const response = await api.get('/invoices', { params });
//     return response.data;
//   },

//   // Get invoice by ID
//   getById: async (id) => {
//     const response = await api.get(`/invoices/${id}`);
//     return response.data;
//   },

//   // Create invoice
//   create: async (invoiceData) => {
//     const response = await api.post('/invoices', invoiceData);
//     return response.data;
//   },

//   // Update invoice
//   update: async (id, invoiceData) => {
//     const response = await api.put(`/invoices/${id}`, invoiceData);
//     return response.data;
//   },

//   // Delete invoice
//   delete: async (id) => {
//     const response = await api.delete(`/invoices/${id}`);
//     return response.data;
//   },

//   // Get vendor invoices
//   getVendorInvoices: async (vendorId, params = {}) => {
//     const response = await api.get(`/invoices/vendor/${vendorId}`, { params });
//     return response.data;
//   },

//   // Get my invoices (for vendors)
//   getMyInvoices: async (params = {}) => {
//     const response = await api.get('/invoices/me', { params });
//     return response.data;
//   },
//     // Get allocated products for vendor (for invoice creation)
//   getAllocatedProducts: async (vendorId) => {
//     const response = await api.get(`/vendors/${vendorId}/allocated-products`);
//     return response.data;
//   },

//   // Update invoice status
//   updateStatus: async (id, status) => {
//     const response = await api.patch(`/invoices/${id}/status`, { status });
//     return response.data;
//   },

//   // Record payment
//   recordPayment: async (id, paymentData) => {
//     const response = await api.post(`/invoices/${id}/payment`, paymentData);

//     return response.data;
//   },

//   // Send invoice (email)
//   sendInvoice: async (id) => {
//     const response = await api.post(`/invoices/${id}/send`);
//     return response.data;
//   },

//   // Download invoice as PDF
//   downloadPDF: async (id) => {
//     const response = await api.get(`/invoices/${id}/pdf`, {
//       responseType: 'blob'
//     });
//     return response.data;
//   }
// };

// services/invoiceService.js - UPDATED
import api from '@/lib/api';

export const invoiceService = {
  // Get all invoices
  getAll: async (params = {}) => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  // Get invoice by ID
  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // Create invoice
  create: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  // Update invoice
  update: async (id, invoiceData) => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  // Delete invoice
  delete: async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  // Get vendor invoices
  getVendorInvoices: async (vendorId, params = {}) => {
    const response = await api.get(`/invoices/vendor/${vendorId}`, { params });
    return response.data;
  },

  // Get my invoices (for vendors)
  getMyInvoices: async (params = {}) => {
    const response = await api.get('/invoices/me', { params });
    return response.data;
  },

  // Get allocated products for vendor
  getAllocatedProducts: async (vendorId) => {
    const response = await api.get(`/vendors/${vendorId}/allocated-products`);
    return response.data;
  },

  // Update invoice status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },

  // ✅ NEW: Approve invoice (for admin)
  approveInvoice: async (id, approvedBy) => {
    const response = await api.patch(`/invoices/${id}/approve`, { approvedBy });
    return response.data;
  },

  // ✅ NEW: Reject invoice (for admin)
  rejectInvoice: async (id, rejectionReason) => {
    const response = await api.patch(`/invoices/${id}/reject`, { rejectionReason });
    return response.data;
  },


    // ✅ NEW: Mark invoice as paid
  markAsPaid: async (id) => {
    const response = await api.patch(`/invoices/${id}/pay`);
    return response.data;
  },

  // Record payment
  recordPayment: async (id, paymentData) => {
    const response = await api.post(`/invoices/${id}/payment`, paymentData);
    return response.data;
  },

  // Send invoice (email)
  sendInvoice: async (id) => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  },

  // ✅ UPDATED: Download invoice as PDF
  // downloadPDF: async (id) => {
  //   const response = await api.get(`/invoices/${id}/pdf`, {
  //     responseType: 'blob'
  //   });
    
  //   // Create download link
  //   const blob = new Blob([response.data], { type: 'application/pdf' });
  //   const url = window.URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `invoice-${id}.pdf`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   window.URL.revokeObjectURL(url);
    
  //   return response.data;
  // },

  // Download invoice as HTML (for printing as PDF)
  downloadInvoice: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Invoice download error:', error);
      throw error;
    }
  },

  // Open invoice in new tab for printing
  openInvoiceForPrint: async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`);
      const htmlBlob = new Blob([response.data], { type: 'text/html' });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      window.open(htmlUrl, '_blank');
    } catch (error) {
      console.error('Error opening invoice:', error);
      throw error;
    }
  },

  // ✅ NEW: Submit invoice for approval (for vendors)
  submitForApproval: async (id) => {
    const response = await api.patch(`/invoices/${id}/submit`);
    return response.data;
  }
};