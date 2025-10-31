// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/components/Navbar";
// import { useAuth } from "@/context/AuthContext";
// import { orderService } from "@/services/orderService";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const router = useRouter();
//   const { isAuthenticated, user } = useAuth();

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push("/login");
//       return;
//     }

//     const fetchOrders = async () => {
//       try {
//         const response = await orderService.getByCustomer(user.id);
//         setOrders(response.orders || []);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load your orders.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [isAuthenticated, user, router]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center">
//         <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
//         <p className="mt-4 text-muted-foreground">Loading your orders...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center text-center">
//         <h2 className="text-2xl font-semibold text-foreground mb-2">Error</h2>
//         <p className="text-muted-foreground mb-4">{error}</p>
//         <button
//           onClick={() => router.push("/")}
//           className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
//         >
//           Go Home
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <div className="max-w-6xl mx-auto px-6 py-10">
//         <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
//         <p className="text-muted-foreground mb-10">
//           Track all your orders and delivery updates
//         </p>

//         {orders.length === 0 ? (
//           <div className="text-center py-20">
//             <p className="text-xl font-semibold text-muted-foreground">
//               You haven’t placed any orders yet.
//             </p>
//             <button
//               onClick={() => router.push("/")}
//               className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold"
//             >
//               Start Shopping
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {orders.map((order) => (
//               <div
//                 key={order._id}
//                 className="bg-card rounded-2xl shadow-sm p-6 border border-border"
//               >
//                 {/* Header */}
//                 <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
//                   <div>
//                     <div className="flex items-center gap-3">
//                       <h3 className="text-lg font-semibold text-foreground">
//                         Order ID: <span className="text-muted-foreground">{order.orderNumber}</span>
//                       </h3>
//                       <span
//                         className={`px-3 py-1 text-xs font-medium rounded-full ${
//                           order.status === "confirmed"
//                             ? "bg-green-100 text-green-700"
//                             : order.status === "pending"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : order.status === "cancelled"
//                             ? "bg-red-100 text-red-700"
//                             : "bg-blue-100 text-blue-700"
//                         }`}
//                       >
//                         {order.statusText || order.status}
//                       </span>
//                     </div>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       Ordered on{" "}
//                       {new Date(order.createdAt).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </p>
//                   </div>

//                   <div className="flex gap-3 mt-3 md:mt-0">
//                     <button
//                       onClick={() => router.push(`/order/${order._id}`)}
//                       className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90"
//                     >
//                       Details
//                     </button>
//                     <button
//                       onClick={() => router.push(`/order-tracking/${order._id}`)}
//                       className="px-4 py-2 rounded-lg text-sm border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//                     >
//                       Track
//                     </button>
//                   </div>
//                 </div>

//                 {/* Shipment Info */}
//                 <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
//                   <span>
//                     📍 {order.shippingAddress?.city}, {order.shippingAddress?.country}
//                   </span>
//                   <span className="text-gray-400">→</span>
//                   <span>🏠 {order.shippingAddress?.fullName}</span>

//                   {order.timeline?.confirmedAt && (
//                     <span className="ml-auto text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
//                       Estimated arrival:{" "}
//                       {new Date(order.timeline.confirmedAt)
//                         .toLocaleDateString("en-US", {
//                           month: "short",
//                           day: "numeric",
//                           year: "numeric",
//                         })}
//                     </span>
//                   )}
//                 </div>

//                 {/* Items */}
//                 <div className="border-t pt-4">
//                   <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
//                     {order.items.map((item, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center gap-3 border rounded-lg p-3"
//                       >
//                         <img
//                           src={item.thumbnail}
//                           alt={item.name}
//                           className="w-14 h-14 object-cover rounded-lg"
//                         />
//                         <div className="flex-1 min-w-0">
//                           <h4 className="text-sm font-medium truncate text-foreground">
//                             {item.name}
//                           </h4>
//                           <p className="text-xs text-muted-foreground">
//                             {item.size ? `Size: ${item.size}` : ""}{" "}
//                             {item.color ? `| ${item.color}` : ""}
//                           </p>
//                           <p className="text-xs text-muted-foreground">
//                             Qty: {item.quantity}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Summary */}
//                   <div className="flex justify-between items-center mt-4">
//                     <span className="text-sm text-muted-foreground">
//                       Total Items: {order.totalItems}
//                     </span>
//                     <span className="text-lg font-bold text-foreground">
//                       Rs. {order.pricing?.grandTotal?.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { Package, Truck, CheckCircle, Clock, Ban } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await orderService.getByCustomer(user.id);
        setOrders(response.orders || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, router]);

  // ✅ Simple Status Display
  const getStatusInfo = (order) => {
    const statusMap = {
      'pending': { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" />, text: 'Pending' },
      'confirmed': { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-4 h-4" />, text: 'Confirmed' },
      'processing': { color: 'bg-purple-100 text-purple-700', icon: <Package className="w-4 h-4" />, text: 'Processing' },
      'shipped': { color: 'bg-orange-100 text-orange-700', icon: <Truck className="w-4 h-4" />, text: 'Shipped' },
      'delivered': { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" />, text: 'Delivered' },
      'cancelled': { color: 'bg-red-100 text-red-700', icon: <Ban className="w-4 h-4" />, text: 'Cancelled' }
    }
    
    return statusMap[order.status] || { color: 'bg-gray-100 text-gray-700', icon: <Package className="w-4 h-4" />, text: order.status }
  }

  // ✅ Format Price
  const formatPrice = (price) => {
    return `₹${(price / 100).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600 mb-10">
          Track all your orders and delivery updates
        </p>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-2">
              You haven't placed any orders yet.
            </p>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order)
              const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
              
              return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Ordered on {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    
                    {/* Payment Method */}
                    {order.payment && (
                      <p className="text-sm text-gray-500 mt-1">
                        Payment: {order.payment.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'} • 
                        <span className={order.payment.status === 'completed' ? 'text-green-600 ml-1' : 'text-orange-600 ml-1'}>
                          {order.payment.status === 'completed' ? 'Paid' : 'Pending'}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-3 md:mt-0">
                    <button
                      onClick={() => router.push(`/orders/${order._id}`)}
                      className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => router.push(`/track-order/${order._id}`)}
                        className="px-4 py-2 rounded-lg text-sm border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Track Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                  <span>📍 {order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                  <span className="text-gray-400">•</span>
                  <span>👤 {order.shippingAddress?.fullName}</span>
                  
                  {order.shipping?.estimatedDelivery && (
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      Estimated: {new Date(order.shipping.estimatedDelivery).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Items */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 hover:border-blue-200 transition-colors"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.productSnapshot?.thumbnail ? (
                            <img
                              src={item.productSnapshot.thumbnail}
                              alt={item.productSnapshot.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate text-gray-900">
                            {item.productSnapshot?.name || "Product"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {item.variant?.size && `Size: ${item.variant.size}`}
                            {item.variant?.color && ` • Color: ${item.variant.color}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} • {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-sm text-gray-600">
                        {totalItems} item{totalItems > 1 ? 's' : ''} • 
                        {order.payment?.method === 'cod' && ' 💰 Cash on Delivery'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(order.pricing?.grandTotal || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}