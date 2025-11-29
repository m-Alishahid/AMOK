// "use client"

// import { useState, useEffect } from "react"
// import { orderService } from "@/services/orderService"
// import { OrderDetailsSheet } from "@/components/order-details-sheet"
// import DataTable from "@/components/DataTable"
// import { Badge } from "@/components/ui/badge"
// import { Eye } from "lucide-react"

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([])
//   const [selectedOrder, setSelectedOrder] = useState(null)
//   const [isSheetOpen, setIsSheetOpen] = useState(false)
//   const [loading, setLoading] = useState(true)

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

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "confirmed":
//         return "bg-blue-100 text-blue-800"
//       case "processing":
//         return "bg-purple-100 text-purple-800"
//       case "shipped":
//         return "bg-orange-100 text-orange-800"
//       case "delivered":
//         return "bg-green-100 text-green-800"
//       case "cancelled":
//         return "bg-red-100 text-red-800"
//       case "pending":
//         return "bg-yellow-100 text-yellow-800"
//       case "returned":
//         return "bg-indigo-100 text-indigo-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
//           <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and track all customer orders</p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
//           <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
//             <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Orders</p>
//             <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{orders.length}</p>
//           </div>
//           <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
//             <p className="text-xs sm:text-sm text-gray-600 font-medium">Pending</p>
//             <p className="text-xl sm:text-3xl font-bold text-yellow-600 mt-1 sm:mt-2">
//               {orders.filter((o) => o.status?.toLowerCase() === "pending").length}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
//             <p className="text-xs sm:text-sm text-gray-600 font-medium">Delivered</p>
//             <p className="text-xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">
//               {orders.filter((o) => o.status?.toLowerCase() === "delivered").length}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
//             <p className="text-xs sm:text-sm text-gray-600 font-medium">Returned</p>
//             <p className="text-xl sm:text-3xl font-bold text-indigo-600 mt-1 sm:mt-2">
//               {orders.filter((o) => o.status?.toLowerCase() === "returned").length}
//             </p>
//           </div>
//         </div>

//         {/* Orders Table */}
//         <DataTable
//           columns={[
//             {
//               key: "orderNumber",
//               label: "Order ID",
//               sortable: true,
//               render: (value) => <span className="font-semibold text-gray-900">#{value}</span>,
//             },
//             {
//               key: "customer",
//               label: "Customer",
//               sortable: true,
//               render: (value, order) => (
//                 <div>
//                   <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || "N/A"}</p>
//                   <p className="text-sm text-gray-500">{order.customerEmail}</p>
//                 </div>
//               ),
//             },
//             {
//               key: "items",
//               label: "Items",
//               sortable: true,
//               render: (value) => (
//                 <span className="text-gray-900">
//                   {value?.length || 0} item{value?.length !== 1 ? "s" : ""}
//                 </span>
//               ),
//             },
//             {
//               key: "total",
//               label: "Total",
//               sortable: true,
//               render: (value, order) => (
//                 <span className="font-semibold text-gray-900">
//                   Rs.{(order.pricing?.grandTotal / 100).toFixed(2)}
//                 </span>
//               ),
//             },
//             {
//               key: "status",
//               label: "Status",
//               sortable: true,
//               render: (value) => (
//                 <Badge className={getStatusColor(value)}>
//                   {value}
//                 </Badge>
//               ),
//             },
//             {
//               key: "createdAt",
//               label: "Date",
//               sortable: true,
//               render: (value) => (
//                 <span className="text-sm text-gray-600">
//                   {new Date(value).toLocaleDateString()}
//                 </span>
//               ),
//             },
//           ]}
//           data={orders}
//           actions={[
//             {
//               label: "View Details",
//               icon: Eye,
//               onClick: (order) => openSheet(order),
//             },
//           ]}
//           searchable={true}
//           paginated={true}
//           pageSize={10}
//           loading={loading}
//           emptyMessage="No orders found"
//           searchPlaceholder="Search orders by ID, customer email..."
//         />
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


"use client"

import { useState, useEffect } from "react"
import { orderService } from "@/services/orderService"
import { OrderDetailsSheet } from "@/components/order-details-sheet"
import DataTable from "@/components/DataTable"
import { Badge } from "@/components/ui/badge"
import { Eye, Package, Clock, CheckCircle, RefreshCw, ShoppingCart } from "lucide-react"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const response = await orderService.getAll()
      setOrders(response.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "processing":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "shipped":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "returned":
        return "bg-indigo-50 text-indigo-700 border-indigo-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return Clock
      case "delivered":
        return CheckCircle
      case "processing":
      case "shipped":
        return Package
      default:
        return Package
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                    Orders
                  </h1>
                  <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base truncate">Manage and track all customer orders</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 touch-manipulation"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''} flex-shrink-0`} />
              <span className="truncate">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-1 sm:px-2 md:px-6 py-2 sm:py-3 md:py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            {
              label: "Total Orders",
              value: orders.length,
              icon: Package,
              color: "text-gray-600",
              bg: "bg-white",
            },
            {
              label: "Pending",
              value: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
              icon: Clock,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Delivered",
              value: orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
              icon: CheckCircle,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Returned",
              value: orders.filter((o) => o.status?.toLowerCase() === "returned").length,
              icon: RefreshCw,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`${stat.bg} rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className={`text-xl sm:text-3xl font-bold ${stat.color} mt-1 sm:mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <DataTable
            columns={[
              {
                key: "orderNumber",
                label: "Order ID",
                sortable: true,
                render: (value) => (
                  <span className="font-semibold text-gray-900 font-mono">#{value}</span>
                ),
              },
              {
                key: "customer",
                label: "Customer",
                sortable: true,
                render: (value, order) => (
                  <div className="min-w-[140px]">
                    <p className="font-medium text-gray-900 truncate">
                      {order.shippingAddress?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{order.customerEmail}</p>
                  </div>
                ),
              },
              {
                key: "items",
                label: "Items",
                sortable: true,
                render: (value) => (
                  <span className="text-gray-900 font-medium">
                    {value?.length || 0} item{value?.length !== 1 ? "s" : ""}
                  </span>
                ),
              },
              {
                key: "total",
                label: "Total",
                sortable: true,
                render: (value, order) => (
                  <span className="font-bold text-gray-900">
                    Rs.{(order.pricing?.grandTotal / 100).toFixed(2)}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                sortable: true,
                render: (value) => {
                  const StatusIcon = getStatusIcon(value)
                  return (
                    <Badge
                      className={`${getStatusColor(value)} border font-medium px-3 py-1.5`}
                      variant="outline"
                    >
                      <StatusIcon className="h-3 w-3 mr-1.5" />
                      {value}
                    </Badge>
                  )
                },
              },
              {
                key: "createdAt",
                label: "Date",
                sortable: true,
                render: (value) => (
                  <div className="text-sm">
                    <p className="text-gray-900 font-medium">
                      {new Date(value).toLocaleDateString()}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ),
              },
            ]}
            data={orders}
            responsiveView={true}
            mobileCard={(order) => (
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-medium">#{order.orderNumber?.slice(-2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {order.shippingAddress?.fullName || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{order.customerEmail}</p>
                    <p className="text-xs text-gray-600 mt-1 truncate font-mono">#{order.orderNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-xs pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-medium text-gray-900">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-medium text-gray-900">
                      Rs.{(order.pricing?.grandTotal / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Badge className={`${getStatusColor(order.status)} border font-medium flex-1 justify-center`}>
                    {order.status}
                  </Badge>
                  <button
                    onClick={() => openSheet(order)}
                    className="flex-1 text-xs py-2 rounded-lg bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
            actions={[
              {
                label: "View Details",
                icon: Eye,
                onClick: (order) => openSheet(order),
                variant: "outline",
              },
            ]}
            searchable={true}
            paginated={true}
            pageSize={10}
            loading={loading}
            emptyMessage={
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">There are no orders matching your criteria.</p>
              </div>
            }
            searchPlaceholder="Search orders by ID, customer email..."
          />
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