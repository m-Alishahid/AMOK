"use client"

import { useState, useEffect } from "react"
import { orderService } from "@/services/orderService"
import { OrderDetailsSheet } from "@/components/order-details-sheet"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrders, setSelectedOrders] = useState([])
  const [showStatusDropdown, setShowStatusDropdown] = useState(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getAll()
      setOrders(response.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const openSheet = (order) => {
    setSelectedOrder(order)
    setIsSheetOpen(true)
  }

  const closeSheet = () => {
    setSelectedOrder(null)
    setIsSheetOpen(false)
  }

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)))
  }

  const handleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map((order) => order._id))
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus)
      handleStatusUpdate(orderId, newStatus)
      setShowStatusDropdown(null)
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const getReturnStatusColor = (returnStatus) => {
    switch (returnStatus?.toLowerCase()) {
      case "requested":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "received":
        return "bg-orange-100 text-orange-800"
      case "refunded":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status?.toLowerCase() === filter
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "returned":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const statusCounts = {
    all: orders.length,
    confirmed: orders.filter((o) => o.status?.toLowerCase() === "confirmed").length,
    processing: orders.filter((o) => o.status?.toLowerCase() === "processing").length,
    shipped: orders.filter((o) => o.status?.toLowerCase() === "shipped").length,
    delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
    cancelled: orders.filter((o) => o.status?.toLowerCase() === "cancelled").length,
    returned: orders.filter((o) => o.status?.toLowerCase() === "returned").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{statusCounts.pending || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">Delivered</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{statusCounts.delivered}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 font-medium">returned</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{statusCounts.returned}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "confirmed", label: "Confirmed" },
                { key: "processing", label: "Processing" },
                { key: "shipped", label: "Shipped" },
                { key: "delivered", label: "Delivered" },
                { key: "cancelled", label: "Cancelled" },
                {key: "returned", label: "Returned" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setFilter(item.key)
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === item.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.label}{" "}
                  <span className="text-xs ml-1">({statusCounts[item.key] || 0})</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-900">Update status to:</span>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      selectedOrders.forEach(orderId => updateOrderStatus(orderId, e.target.value))
                      setSelectedOrders([])
                    }
                  }}
                  className="px-3 py-1 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => handleOrderSelection(order._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || "N/A"}</p>
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900">
                            {order.items?.length || 0} item
                            {order.items?.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            Rs.{(order.pricing?.grandTotal / 100).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openSheet(order)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{" "}
                  {filteredOrders.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Details Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={isSheetOpen}
        onClose={closeSheet}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}


