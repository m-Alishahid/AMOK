// "use client"

// import { useState } from "react"
// import { orderService } from "@/services/orderService"
// import { ChevronLeft, X } from "lucide-react"

// interface OrderDetailsSheetProps {
//   order: any
//   isOpen: boolean
//   onClose: () => void
//   onStatusUpdate: (orderId: string, newStatus: string) => void
// }

// export function OrderDetailsSheet({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsSheetProps) {
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [selectedStatus, setSelectedStatus] = useState(order?.status || "")

//   const handleStatusChange = async (newStatus: string) => {
//     setIsUpdating(true)
//     try {
//       await orderService.updateStatus(order._id, newStatus)
//       setSelectedStatus(newStatus)
//       onStatusUpdate(order._id, newStatus)
//     } catch (error) {
//       console.error("Failed to update status:", error)
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   const getStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "confirmed":
//         return "bg-blue-50 text-blue-700 border-blue-200"
//       case "processing":
//         return "bg-purple-50 text-purple-700 border-purple-200"
//       case "shipped":
//         return "bg-orange-50 text-orange-700 border-orange-200"
//       case "delivered":
//         return "bg-green-50 text-green-700 border-green-200"
//       case "cancelled":
//         return "bg-red-50 text-red-700 border-red-200"
//       case "pending":
//         return "bg-yellow-50 text-yellow-700 border-yellow-200"
//       default:
//         return "bg-gray-50 text-gray-700 border-gray-200"
//     }
//   }

//   const getPaymentStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return "text-orange-600"
//       case "completed":
//         return "text-green-600"
//       case "failed":
//         return "text-red-600"
//       default:
//         return "text-gray-600"
//     }
//   }

//   if (!isOpen || !order) return null

//   return (
//     <>
//       {/* Overlay */}
//       <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

//       {/* Sheet */}
//       <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Order ID #{order.orderNumber}</h2>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {new Date(order.createdAt).toLocaleDateString("en-US", {
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             </div>
//             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Status Badges */}
//           <div className="flex gap-3 mt-4">
//             <span
//               className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
//                 order.status,
//               )}`}
//             >
//               {order.status}
//             </span>
//             <span
//               className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-gray-200 ${getPaymentStatusColor(
//                 order.payment?.status,
//               )}`}
//             >
//               {order.payment?.status === "pending" ? "Unfulfilled" : "Fulfilled"}
//             </span>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 space-y-8">
//           {/* Order Items Section */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
//             <div className="space-y-4">
//               {order.items?.map((item: any, index: number) => (
//                 <div
//                   key={index}
//                   className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   {/* Product Image Placeholder */}
//                   <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <span className="text-2xl">📦</span>
//                   </div>

//                   {/* Product Details */}
//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-semibold text-gray-900 truncate">{item.productSnapshot?.name || "Product"}</h4>
//                     <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
//                       <div>
//                         <span className="text-gray-500">Size:</span>{" "}
//                         <span className="font-medium">{item.variant?.size || "N/A"}</span>
//                       </div>
//                       <div>
//                         <span className="text-gray-500">Color:</span>{" "}
//                         <span className="font-medium">{item.variant?.color || "N/A"}</span>
//                       </div>
//                       <div>
//                         <span className="text-gray-500">Quantity:</span>{" "}
//                         <span className="font-medium">{item.quantity}</span>
//                       </div>
//                       <div>
//                         <span className="text-gray-500">Stock:</span>{" "}
//                         <span className="font-medium">{item.productSnapshot?.originalStock || "N/A"}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Price */}
//                   <div className="text-right flex-shrink-0">
//                     <p className="text-lg font-bold text-gray-900">₹{(item.unitPrice / 100).toFixed(2)}</p>
//                     <p className="text-sm text-gray-500 mt-1">Total: ₹{(item.totalPrice / 100).toFixed(2)}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div className="bg-gray-50 rounded-lg p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between text-gray-700">
//                 <span>Subtotal</span>
//                 <span className="font-medium">₹{(order.pricing?.subtotal / 100).toFixed(2)}</span>
//               </div>
//               {order.pricing?.discount > 0 && (
//                 <div className="flex justify-between text-gray-700">
//                   <span>Discount</span>
//                   <span className="font-medium text-green-600">-₹{(order.pricing?.discount / 100).toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between text-gray-700">
//                 <span>Shipping</span>
//                 <span className="font-medium">₹{(order.pricing?.shipping / 100).toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-gray-700">
//                 <span>Tax</span>
//                 <span className="font-medium">₹{(order.pricing?.tax / 100).toFixed(2)}</span>
//               </div>
//               <div className="border-t border-gray-200 pt-3 flex justify-between">
//                 <span className="font-semibold text-gray-900">Total</span>
//                 <span className="text-xl font-bold text-gray-900">₹{(order.pricing?.grandTotal / 100).toFixed(2)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Customer Details */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Name</p>
//                 <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || "N/A"}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Email</p>
//                 <p className="font-medium text-gray-900">
//                   {order.shippingAddress?.email || order.customerEmail || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Phone</p>
//                 <p className="font-medium text-gray-900">
//                   {order.shippingAddress?.phone || order.customerPhone || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Payment Method</p>
//                 <p className="font-medium text-gray-900 uppercase">{order.payment?.method || "N/A"}</p>
//               </div>
//             </div>
//           </div>

//           {/* Shipping Address */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <p className="font-medium text-gray-900">{order.shippingAddress?.addressLine1}</p>
//               <p className="text-gray-600 mt-1">
//                 {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
//               </p>
//               <p className="text-gray-600">{order.shippingAddress?.country}</p>
//             </div>
//           </div>

//           {/* Status Update Section */}
//           <div className="border-t border-gray-200 pt-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
//             <div className="flex gap-2 flex-wrap">
//               {["confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
//                 <button
//                   key={status}
//                   onClick={() => handleStatusChange(status)}
//                   disabled={isUpdating}
//                   className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
//                     selectedStatus === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   } disabled:opacity-50 disabled:cursor-not-allowed`}
//                 >
//                   {status}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//           >
//             Close
//           </button>
//           <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
//             Print Invoice
//           </button>
//         </div>
//       </div>
//     </>
//   )
// }


"use client"

import { useState } from "react"
import { orderService } from "@/services/orderService"
import { ChevronLeft, X, Package, Truck, CheckCircle, Clock, Ban } from "lucide-react"

interface OrderDetailsSheetProps {
  order: any
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (orderId: string, newStatus: string) => void
}

export function OrderDetailsSheet({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsSheetProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "")

  const handleStatusChange = async (newStatus: string) => {
    if (!order?._id) return
    
    setIsUpdating(true)
    try {
      await orderService.updateStatus(order._id, newStatus)
      setSelectedStatus(newStatus)
      onStatusUpdate(order._id, newStatus)
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Status update failed. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  // ✅ Simple Status Colors - Easy to Understand
  const getStatusColor = (status: string) => {
    const statusMap: any = {
      'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
      'processing': 'bg-purple-50 text-purple-700 border-purple-200',
      'shipped': 'bg-orange-50 text-orange-700 border-orange-200',
      'delivered': 'bg-green-50 text-green-700 border-green-200',
      'cancelled': 'bg-red-50 text-red-700 border-red-200',
      'refunded': 'bg-gray-50 text-gray-700 border-gray-200',
      'returned': 'bg-pink-50 text-pink-700 border-pink-200'
    }
    return statusMap[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  // ✅ Simple Payment Status
  const getPaymentStatus = (payment: any) => {
    if (!payment) return { text: 'Pending', color: 'text-orange-600' }
    
    if (payment.status === 'completed') return { text: 'Paid', color: 'text-green-600' }
    if (payment.status === 'failed') return { text: 'Failed', color: 'text-red-600' }
    if (payment.method === 'cod' && payment.status !== 'completed') return { text: 'Cash on Delivery', color: 'text-blue-600' }
    
    return { text: 'Pending', color: 'text-orange-600' }
  }

  // ✅ Status Icons for Better Understanding
  const getStatusIcon = (status: string) => {
    const iconMap: any = {
      'pending': <Clock className="w-4 h-4" />,
      'confirmed': <CheckCircle className="w-4 h-4" />,
      'processing': <Package className="w-4 h-4" />,
      'shipped': <Truck className="w-4 h-4" />,
      'delivered': <CheckCircle className="w-4 h-4" />,
      'cancelled': <Ban className="w-4 h-4" />,
    }
    return iconMap[status?.toLowerCase()] || <Package className="w-4 h-4" />
  }

  // ✅ Format Price Properly
  const formatPrice = (price: number) => {
    return `₹${(price / 100).toFixed(2)}`
  }

  // ✅ Get readable status text
  const getStatusText = (status: string) => {
    const statusMap: any = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded',
      'returned': 'Returned'
    }
    return statusMap[status] || status
  }

  if (!isOpen || !order) return null

  const paymentStatus = getPaymentStatus(order.payment)

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Badges - Simple and Clear */}
          <div className="flex gap-3 mt-4">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                order.status,
              )}`}
            >
              {getStatusIcon(order.status)}
              {getStatusText(order.status)}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-gray-200 ${paymentStatus.color}`}
            >
              {paymentStatus.text}
            </span>
            {order.payment?.method === 'cod' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700">
                COD
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Order Progress Timeline */}
          {order.timeline && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Journey</h3>
              <div className="space-y-2 text-sm">
                {order.timeline.orderedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Placed</span>
                    <span className="text-gray-900">
                      {new Date(order.timeline.orderedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.timeline.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Confirmed</span>
                    <span className="text-gray-900">
                      {new Date(order.timeline.confirmedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.timeline.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipped</span>
                    <span className="text-gray-900">
                      {new Date(order.timeline.shippedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.timeline.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-green-600 font-medium">Delivered</span>
                    <span className="text-green-600 font-medium">
                      {new Date(order.timeline.deliveredAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.productSnapshot?.thumbnail ? (
                      <img 
                        src={item.productSnapshot.thumbnail} 
                        alt={item.productSnapshot?.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {item.productSnapshot?.name || "Product"}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      SKU: {item.productSnapshot?.sku || "N/A"}
                    </p>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-500">Size:</span>{" "}
                        <span className="font-medium">{item.variant?.size || "Standard"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Color:</span>{" "}
                        <span className="font-medium">{item.variant?.color || "Standard"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantity:</span>{" "}
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>{" "}
                        <span className="font-medium">{formatPrice(item.unitPrice)}</span>
                      </div>
                    </div>

                    {/* Return Status */}
                    {item.isReturned && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                          Returned • {item.returnReason}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">{formatPrice(item.unitPrice)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Total: {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Simple and Clear */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Items Total</span>
                <span className="font-medium">{formatPrice(order.pricing?.subtotal || 0)}</span>
              </div>
              
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatPrice(order.pricing?.discount || 0)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="font-medium">{formatPrice(order.pricing?.shipping || 0)}</span>
              </div>
              
              {order.pricing?.tax > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-medium">{formatPrice(order.pricing?.tax || 0)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Final Amount</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(order.pricing?.grandTotal || 0)}
                </span>
              </div>

              {/* COD Information */}
              {order.payment?.method === 'cod' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    💰 Cash on Delivery: {formatPrice(order.payment?.amount || order.pricing?.grandTotal || 0)}
                  </p>
                  {order.payment?.codDetails?.collectedAmount > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      ✅ Collected: {formatPrice(order.payment.codDetails.collectedAmount)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.email || order.customerEmail || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.phone || order.customerPhone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.payment?.method?.replace('_', ' ') || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
              <p className="text-gray-900">{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p className="text-gray-900">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-600 mt-1">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-gray-600">{order.shippingAddress?.country}</p>
              <p className="text-gray-600 mt-1">📞 {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Shipping Information */}
          {order.shipping && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Shipping Method:</span>
                    <p className="font-medium capitalize">{order.shipping.method?.replace('_', ' ')}</p>
                  </div>
                  {order.shipping.trackingNumber && (
                    <div>
                      <span className="text-gray-500">Tracking Number:</span>
                      <p className="font-medium">{order.shipping.trackingNumber}</p>
                    </div>
                  )}
                  {order.shipping.carrier && (
                    <div>
                      <span className="text-gray-500">Carrier:</span>
                      <p className="font-medium">{order.shipping.carrier}</p>
                    </div>
                  )}
                  {order.shipping.estimatedDelivery && (
                    <div>
                      <span className="text-gray-500">Estimated Delivery:</span>
                      <p className="font-medium">
                        {new Date(order.shipping.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Update Section - Simple One-Click Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
            <p className="text-sm text-gray-500 mb-3">Click any status to update:</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'confirmed', label: 'Confirm', color: 'bg-blue-500' },
                { value: 'processing', label: 'Processing', color: 'bg-purple-500' },
                { value: 'shipped', label: 'Shipped', color: 'bg-orange-500' },
                { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
                { value: 'cancelled', label: 'Cancel', color: 'bg-red-500' }
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  disabled={isUpdating || selectedStatus === status.value}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
                    selectedStatus === status.value 
                      ? `${status.color} opacity-100` 
                      : `${status.color} opacity-70 hover:opacity-100`
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status.label}
                </button>
              ))}
            </div>
            {isUpdating && (
              <p className="text-sm text-blue-500 mt-2">Updating status...</p>
            )}
          </div>

          {/* Returns Section */}
          {order.returns && order.returns.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Requests</h3>
              <div className="space-y-3">
                {order.returns.map((returnItem: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Quantity: {returnItem.quantity}</p>
                        <p className="text-sm text-gray-600">Reason: {returnItem.reason}</p>
                        <p className={`text-sm font-medium ${
                          returnItem.status === 'approved' ? 'text-green-600' : 
                          returnItem.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          Status: {returnItem.status}
                        </p>
                      </div>
                      {returnItem.refundAmount && (
                        <p className="text-green-600 font-bold">
                          Refund: {formatPrice(returnItem.refundAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Print Invoice
          </button>
        </div>
      </div>
    </>
  )
}