"use client";

import { useState, useEffect } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (response.ok) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (sortBy === "all") return true;
    return order.status.toLowerCase() === sortBy;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700 ring-1 ring-green-600/20";
      case "pending":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20";
      case "cancelled":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      case "shipped":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20";
    }
  };

  const getStatusBadge = (status) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Manage and track all customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-sm md:text-base w-full sm:w-auto"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Order Details", "Customer", "Amount", "Status", "Date", "Actions"].map((h, i) => (
                  <th key={i} className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                      <div className="text-xs md:text-sm text-gray-500 mt-1">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-xs md:text-sm text-gray-500">{order.customer.email}</div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 px-2 md:px-3 py-1 ${getStatusColor(order.status)} cursor-pointer`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">{order.date}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <button
                      onClick={() => openModal(order)}
                      className="inline-flex items-center px-2 md:px-3 py-1 md:py-1.5 border border-gray-300 text-xs md:text-sm font-medium rounded-lg hover:bg-gray-50"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-8 md:py-12 px-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            <h3 className="mt-4 text-base md:text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-2 text-sm md:text-base text-gray-500">No orders match your current filter selection.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 md:py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm md:text-base text-gray-600">Loading orders...</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Order Details</h2>
                <p className="text-gray-600 text-xs md:text-sm mt-1">#{selectedOrder.id}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-lg">✖️</button>
            </div>

            <div className="overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Customer Info */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-900">Customer Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm md:text-base"><strong>Name:</strong> {selectedOrder.customer.name}</p>
                    <p className="text-sm md:text-base"><strong>Email:</strong> {selectedOrder.customer.email}</p>
                    <p className="text-sm md:text-base"><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                    <p className="text-sm md:text-base"><strong>Address:</strong> {selectedOrder.customer.address}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-900">Order Summary</h3>
                  <div className="space-y-2">
                    <p className="text-sm md:text-base"><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                    <p className="text-sm md:text-base"><strong>Date:</strong> {selectedOrder.date}</p>
                    <p className="text-sm md:text-base"><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Product", "Category", "Price", "Qty", "Total"].map((h, i) => (
                          <th key={i} className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-sm">{item.productName}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-sm">{item.category}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-sm">${item.price.toFixed(2)}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-sm">{item.quantity}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 text-right">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
