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
                            ₹{(order.pricing?.grandTotal / 100).toFixed(2)}
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

// "use client"

// import { useState, useEffect } from "react"
// import { orderService } from "@/services/orderService"
// import { OrderDetailsSheet } from "@/components/order-details-sheet"
// import { Search, ChevronLeft, ChevronRight, Package, Truck, CheckCircle, Clock, Ban, Filter, Download } from "lucide-react"

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([])
//   const [selectedOrder, setSelectedOrder] = useState(null)
//   const [isSheetOpen, setIsSheetOpen] = useState(false)
//   const [filter, setFilter] = useState("all")
//   const [loading, setLoading] = useState(true)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [searchTerm, setSearchTerm] = useState("")
//   const itemsPerPage = 10

//   useEffect(() => {
//     fetchOrders()
//   }, [])

//   const fetchOrders = async () => {
//     try {
//       setLoading(true)
//       const response = await orderService.getAll()
//       setOrders(response.orders || [])
//     } catch (error) {
//       console.error("Failed to fetch orders:", error)
//       alert("Failed to load orders. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const openSheet = (order) => {
//     setSelectedOrder(order)
//     setIsSheetOpen(true)
//   }

//   const closeSheet = () => {
//     setSelectedOrder(null)
//     setIsSheetOpen(false)
//   }

//   const handleStatusUpdate = (orderId, newStatus) => {
//     setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)))
//   }

//   // ✅ Filter orders
//   const filteredOrders = orders.filter((order) => {
//     const matchesFilter = filter === "all" || order.status?.toLowerCase() === filter
//     const matchesSearch =
//       order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.shippingAddress?.phone?.includes(searchTerm)
//     return matchesFilter && matchesSearch
//   })

//   // ✅ Pagination
//   const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

//   // ✅ Simple Status Colors with Icons
//   const getStatusInfo = (status) => {
//     const statusMap = {
//       'pending': { 
//         color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//         icon: <Clock className="w-3 h-3" />,
//         text: 'Pending'
//       },
//       'confirmed': { 
//         color: 'bg-blue-100 text-blue-800 border-blue-200',
//         icon: <CheckCircle className="w-3 h-3" />,
//         text: 'Confirmed'
//       },
//       'processing': { 
//         color: 'bg-purple-100 text-purple-800 border-purple-200',
//         icon: <Package className="w-3 h-3" />,
//         text: 'Processing'
//       },
//       'shipped': { 
//         color: 'bg-orange-100 text-orange-800 border-orange-200',
//         icon: <Truck className="w-3 h-3" />,
//         text: 'Shipped'
//       },
//       'delivered': { 
//         color: 'bg-green-100 text-green-800 border-green-200',
//         icon: <CheckCircle className="w-3 h-3" />,
//         text: 'Delivered'
//       },
//       'cancelled': { 
//         color: 'bg-red-100 text-red-800 border-red-200',
//         icon: <Ban className="w-3 h-3" />,
//         text: 'Cancelled'
//       }
//     }
//     return statusMap[status?.toLowerCase()] || { 
//       color: 'bg-gray-100 text-gray-800 border-gray-200',
//       icon: <Package className="w-3 h-3" />,
//       text: status || 'Unknown'
//     }
//   }

//   // ✅ Payment Status
//   const getPaymentStatus = (order) => {
//     if (!order.payment) return { text: 'Pending', color: 'text-orange-600' }
    
//     if (order.payment.status === 'completed') return { text: 'Paid', color: 'text-green-600' }
//     if (order.payment.status === 'failed') return { text: 'Failed', color: 'text-red-600' }
//     if (order.payment.method === 'cod') return { text: 'COD', color: 'text-blue-600' }
    
//     return { text: 'Pending', color: 'text-orange-600' }
//   }

//   // ✅ Format Price
//   const formatPrice = (price) => {
//     if (!price) return "₹0.00"
//     return `₹${(price / 100).toFixed(2)}`
//   }

//   // ✅ Status Counts for Dashboard
//   const statusCounts = {
//     all: orders.length,
//     pending: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
//     confirmed: orders.filter((o) => o.status?.toLowerCase() === "confirmed").length,
//     processing: orders.filter((o) => o.status?.toLowerCase() === "processing").length,
//     shipped: orders.filter((o) => o.status?.toLowerCase() === "shipped").length,
//     delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
//     cancelled: orders.filter((o) => o.status?.toLowerCase() === "cancelled").length,
//   }

//   // ✅ Quick Status Update
//   const quickStatusUpdate = async (orderId, newStatus) => {
//     try {
//       await orderService.updateStatus(orderId, newStatus)
//       setOrders(prev => prev.map(order => 
//         order._id === orderId ? { ...order, status: newStatus } : order
//       ))
//     } catch (error) {
//       console.error("Failed to update status:", error)
//       alert("Failed to update status. Please try again.")
//     }
//   }

//   // ✅ Export Orders (Basic)
//   const exportOrders = () => {
//     const data = filteredOrders.map(order => ({
//       'Order ID': order.orderNumber,
//       'Customer': order.shippingAddress?.fullName,
//       'Email': order.customerEmail,
//       'Phone': order.shippingAddress?.phone,
//       'Total': formatPrice(order.pricing?.grandTotal),
//       'Status': order.status,
//       'Payment': order.payment?.method,
//       'Date': new Date(order.createdAt).toLocaleDateString()
//     }))
    
//     // Simple CSV export
//     const csv = [
//       Object.keys(data[0]).join(','),
//       ...data.map(row => Object.values(row).join(','))
//     ].join('\n')
    
//     const blob = new Blob([csv], { type: 'text/csv' })
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
//     a.click()
//     window.URL.revokeObjectURL(url)
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 py-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
//               <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
//             </div>
//             <button
//               onClick={exportOrders}
//               disabled={filteredOrders.length === 0}
//               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Quick Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
//             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <Package className="w-6 h-6 text-blue-600" />
//             </div>
//             <p className="text-sm text-gray-600 font-medium">Total Orders</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
//           </div>
          
//           <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
//             <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <Clock className="w-6 h-6 text-yellow-600" />
//             </div>
//             <p className="text-sm text-gray-600 font-medium">Pending</p>
//             <p className="text-2xl font-bold text-yellow-600 mt-1">{statusCounts.pending}</p>
//           </div>
          
//           <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
//             <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <Truck className="w-6 h-6 text-orange-600" />
//             </div>
//             <p className="text-sm text-gray-600 font-medium">Shipped</p>
//             <p className="text-2xl font-bold text-orange-600 mt-1">{statusCounts.shipped}</p>
//           </div>
          
//           <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
//             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//             </div>
//             <p className="text-sm text-gray-600 font-medium">Delivered</p>
//             <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts.delivered}</p>
//           </div>
//         </div>

//         {/* Filters and Search */}
//         <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//             {/* Status Filters */}
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-3">
//                 <Filter className="w-4 h-4 text-gray-400" />
//                 <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   { key: "all", label: "All Orders", color: "bg-gray-500" },
//                   { key: "pending", label: "Pending", color: "bg-yellow-500" },
//                   { key: "confirmed", label: "Confirmed", color: "bg-blue-500" },
//                   { key: "processing", label: "Processing", color: "bg-purple-500" },
//                   { key: "shipped", label: "Shipped", color: "bg-orange-500" },
//                   { key: "delivered", label: "Delivered", color: "bg-green-500" },
//                   { key: "cancelled", label: "Cancelled", color: "bg-red-500" },
//                 ].map((item) => (
//                   <button
//                     key={item.key}
//                     onClick={() => {
//                       setFilter(item.key)
//                       setCurrentPage(1)
//                     }}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
//                       filter === item.key 
//                         ? `${item.color} shadow-lg` 
//                         : `${item.color} opacity-70 hover:opacity-100`
//                     }`}
//                   >
//                     <span>{item.label}</span>
//                     <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded text-xs">
//                       {statusCounts[item.key] || 0}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Search */}
//             <div className="w-full lg:w-80">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by order ID, name, email, phone..."
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value)
//                     setCurrentPage(1)
//                   }}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Orders Table */}
//         <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-16">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//               <p className="text-gray-600">Loading orders...</p>
//             </div>
//           ) : filteredOrders.length === 0 ? (
//             <div className="text-center py-16 px-4">
//               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Package className="w-10 h-10 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
//               <p className="text-gray-600 mb-4">
//                 {searchTerm ? "Try changing your search terms" : "No orders match the selected filter"}
//               </p>
//               {(searchTerm || filter !== "all") && (
//                 <button
//                   onClick={() => {
//                     setSearchTerm("")
//                     setFilter("all")
//                   }}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Clear Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50 border-b border-gray-200">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Order Details
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Customer
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Payment
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Amount
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {paginatedOrders.map((order) => {
//                       const statusInfo = getStatusInfo(order.status)
//                       const paymentStatus = getPaymentStatus(order)
//                       const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
                      
//                       return (
//                       <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
//                         <td className="px-6 py-4">
//                           <div>
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="font-bold text-gray-900">#{order.orderNumber}</span>
//                             </div>
//                             <p className="text-sm text-gray-500">
//                               {totalItems} item{totalItems !== 1 ? 's' : ''} • 
//                               {new Date(order.createdAt).toLocaleDateString('en-US', {
//                                 day: 'numeric',
//                                 month: 'short',
//                                 year: 'numeric'
//                               })}
//                             </p>
//                             {order.shipping?.trackingNumber && (
//                               <p className="text-xs text-blue-600 mt-1">
//                                 Track: {order.shipping.trackingNumber}
//                               </p>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {order.shippingAddress?.fullName || "Customer"}
//                             </p>
//                             <p className="text-sm text-gray-500">{order.customerEmail}</p>
//                             <p className="text-xs text-gray-400">{order.shippingAddress?.phone}</p>
//                             <p className="text-xs text-gray-500 mt-1">
//                               {order.shippingAddress?.city}, {order.shippingAddress?.state}
//                             </p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex flex-col gap-1">
//                             <span className={`text-sm font-medium ${paymentStatus.color}`}>
//                               {paymentStatus.text}
//                             </span>
//                             <span className="text-xs text-gray-500 capitalize">
//                               {order.payment?.method?.replace('_', ' ') || 'N/A'}
//                             </span>
//                             {order.payment?.method === 'cod' && (
//                               <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
//                                 COD
//                               </span>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div>
//                             <span className="font-bold text-gray-900 text-lg">
//                               {formatPrice(order.pricing?.grandTotal)}
//                             </span>
//                             {order.pricing?.discount > 0 && (
//                               <p className="text-xs text-green-600">
//                                 Save {formatPrice(order.pricing.discount)}
//                               </p>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex flex-col gap-2">
//                             <span
//                               className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color}`}
//                             >
//                               {statusInfo.icon}
//                               {statusInfo.text}
//                             </span>
                            
//                             {/* Quick Status Update Buttons */}
//                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                               {order.status !== 'delivered' && order.status !== 'cancelled' && (
//                                 <>
//                                   {order.status !== 'shipped' && (
//                                     <button
//                                       onClick={() => quickStatusUpdate(order._id, 'shipped')}
//                                       className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
//                                     >
//                                       Ship
//                                     </button>
//                                   )}
//                                   {order.status !== 'delivered' && (
//                                     <button
//                                       onClick={() => quickStatusUpdate(order._id, 'delivered')}
//                                       className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
//                                     >
//                                       Deliver
//                                     </button>
//                                   )}
//                                 </>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex flex-col gap-2">
//                             <button
//                               onClick={() => openSheet(order)}
//                               className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
//                             >
//                               View Details
//                             </button>
//                             {order.status === 'delivered' && (
//                               <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
//                                 Print Invoice
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     )})}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
//                   <div className="text-sm text-gray-600">
//                     Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
//                     <span className="font-semibold">
//                       {Math.min(startIndex + itemsPerPage, filteredOrders.length)}
//                     </span> of{" "}
//                     <span className="font-semibold">{filteredOrders.length}</span> orders
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <div className="flex gap-1">
//                       <button
//                         onClick={() => setCurrentPage(1)}
//                         disabled={currentPage === 1}
//                         className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
//                       >
//                         <ChevronLeft className="w-4 h-4" />
//                       </button>
//                       <div className="flex items-center gap-1">
//                         {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                           const pageNum = i + 1
//                           return (
//                             <button
//                               key={pageNum}
//                               onClick={() => setCurrentPage(pageNum)}
//                               className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
//                                 currentPage === pageNum
//                                   ? "bg-blue-600 text-white"
//                                   : "border border-gray-300 hover:bg-gray-50"
//                               }`}
//                             >
//                               {pageNum}
//                             </button>
//                           )
//                         })}
//                         {totalPages > 5 && (
//                           <span className="px-2 text-gray-500">...</span>
//                         )}
//                       </div>
//                       <button
//                         onClick={() => setCurrentPage(totalPages)}
//                         disabled={currentPage === totalPages}
//                         className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
//                       >
//                         <ChevronRight className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Order Details Sheet */}
//       <OrderDetailsSheet
//         order={selectedOrder}
//         isOpen={isSheetOpen}
//         onClose={closeSheet}
//         onStatusUpdate={handleStatusUpdate}
//       />
//     </div>
//   )
// }