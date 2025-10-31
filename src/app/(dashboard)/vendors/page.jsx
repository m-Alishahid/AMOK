// // app/dashboard/page.jsx - COMPLETE UPDATED VERSION WITH CURRENCY UTILS
// "use client";
// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Users,
//   Package,
//   ShoppingCart,
//   DollarSign,
//   TrendingUp,
//   AlertCircle,
//   FileText,
//   Plus,
//   Download,
//   Eye,
//   BarChart3,
//   Activity,
//   Calendar,
//   Printer,
//   Edit,
//   Clock,
//   ArrowUp,
//   ArrowDown
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { Modal } from '@/components/ui/modal';
// import { VendorCreateForm } from '@/components/vendors/VendorCreateForm';
// import { ProductAllocationForm } from '@/components/vendors/ProductAllocationForm';
// import { InvoiceCreateForm } from '@/components/invoices/InvoiceCreateForm';
// import { useAuth } from '@/context/AuthContext';
// import { dashboardService } from '@/services/dashboardService';
// import { vendorService } from '@/services/vendorService';
// import { invoiceService } from '@/services/invoiceService';

// // NEW CURRENCY IMPORTS
// import { formatCurrency, getCurrencySymbol } from '@/lib/currencyUtils';

// // Vendor Stats Component
// function VendorStats({ vendorData, stats }) {
//   const statsConfig = [
//     {
//       title: 'Total Products',
//       value: stats?.totalProducts || 0,
//       icon: Package,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-50',
//       change: '+5%'
//     },
//     {
//       title: 'Current Stock',
//       value: stats?.currentStock || 0,
//       icon: ShoppingCart,
//       color: 'text-green-600',
//       bgColor: 'bg-green-50',
//       change: '+12%'
//     },
//     {
//       title: 'Sold Stock',
//       value: stats?.soldStock || 0,
//       icon: TrendingUp,
//       color: 'text-purple-600',
//       bgColor: 'bg-purple-50',
//       change: '+8%'
//     },
//     // UPDATED - Currency format use karein
//     {
//       title: 'Total Sales',
//       value: formatCurrency(stats?.totalSales || 0),
//       icon: DollarSign,
//       color: 'text-orange-600',
//       bgColor: 'bg-orange-50',
//       change: '+15%'
//     },
//     {
//       title: 'Total Profit',
//       value: formatCurrency(stats?.totalProfit || 0),
//       icon: BarChart3,
//       color: 'text-green-600',
//       bgColor: 'bg-green-50',
//       change: '+20%'
//     },
//     {
//       title: 'Low Stock Alerts',
//       value: stats?.lowStockProducts || 0,
//       icon: AlertCircle,
//       color: 'text-red-600',
//       bgColor: 'bg-red-50',
//       change: '-2%'
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
//       {statsConfig.map((stat, index) => (
//         <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                 <p className="text-xl font-bold mt-1">{stat.value}</p>
//                 <div className={`flex items-center text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
//                   {stat.change.startsWith('+') ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
//                   {stat.change}
//                 </div>
//               </div>
//               <div className={`p-2 rounded-lg ${stat.bgColor}`}>
//                 <stat.icon className={`h-5 w-5 ${stat.color}`} />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }

// // Admin Stats Component
// function AdminStats({ stats }) {
//   const adminStats = [
//     {
//       title: 'Total Vendors',
//       value: stats?.totalVendors || 0,
//       icon: Users,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-50',
//       change: '+3%'
//     },
//     {
//       title: 'Total Products',
//       value: stats?.totalProducts || 0,
//       icon: Package,
//       color: 'text-green-600',
//       bgColor: 'bg-green-50',
//       change: '+8%'
//     },
//     // UPDATED - Currency format use karein
//     {
//       title: 'Total Sales',
//       value: formatCurrency(stats?.totalSales || 0),
//       icon: DollarSign,
//       color: 'text-purple-600',
//       bgColor: 'bg-purple-50',
//       change: '+12%'
//     },
//     {
//       title: 'Total Profit',
//       value: formatCurrency(stats?.totalProfit || 0),
//       icon: BarChart3,
//       color: 'text-green-600',
//       bgColor: 'bg-green-50',
//       change: '+18%'
//     },
//     {
//       title: 'Pending Requests',
//       value: stats?.pendingRequests || 0,
//       icon: AlertCircle,
//       color: 'text-orange-600',
//       bgColor: 'bg-orange-50',
//       change: '+5%'
//     },
//     {
//       title: 'Low Stock Items',
//       value: stats?.lowStockProducts || 0,
//       icon: Activity,
//       color: 'text-red-600',
//       bgColor: 'bg-red-50',
//       change: '-3%'
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
//       {adminStats.map((stat, index) => (
//         <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                 <p className="text-xl font-bold mt-1">{stat.value}</p>
//                 <div className={`flex items-center text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
//                   {stat.change.startsWith('+') ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
//                   {stat.change}
//                 </div>
//               </div>
//               <div className={`p-2 rounded-lg ${stat.bgColor}`}>
//                 <stat.icon className={`h-5 w-5 ${stat.color}`} />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }

// // Activity Feed Component
// function ActivityFeed({ activities, onViewInvoice }) {
//   if (!activities || activities.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//         <p className="text-gray-500">No recent activity</p>
//       </div>
//     );
//   }

//   const getActivityIcon = (type) => {
//     switch (type) {
//       case 'invoice':
//         return <FileText className="w-4 h-4 text-blue-600" />;
//       case 'product':
//         return <Package className="w-4 h-4 text-green-600" />;
//       default:
//         return <Activity className="w-4 h-4 text-gray-600" />;
//     }
//   };

//   const getActivityColor = (type) => {
//     switch (type) {
//       case 'invoice':
//         return 'bg-blue-50 border-blue-200';
//       case 'product':
//         return 'bg-green-50 border-green-200';
//       default:
//         return 'bg-gray-50 border-gray-200';
//     }
//   };

//   return (
//     <div className="space-y-3">
//       {activities.map((activity, index) => (
//         <div
//           key={index}
//           className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getActivityColor(activity.type)}`}
//           onClick={() => activity.type === 'invoice' && onViewInvoice(activity)}
//         >
//           <div className="flex items-start space-x-3">
//             <div className="p-2 bg-white rounded-lg border">
//               {getActivityIcon(activity.type)}
//             </div>
//             <div className="flex-1">
//               <p className="font-medium text-sm text-gray-900">{activity.title}</p>
//               <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
//               {activity.amount && (
//                 <p className="text-xs font-medium text-gray-700 mt-1">
//                   Amount: {formatCurrency(activity.amount)} {/* UPDATED */}
//                 </p>
//               )}
//               <div className="flex items-center space-x-2 mt-2">
//                 <Clock className="w-3 h-3 text-gray-400" />
//                 <span className="text-xs text-gray-500">
//                   {new Date(activity.timestamp).toLocaleDateString()} at{' '}
//                   {new Date(activity.timestamp).toLocaleTimeString()}
//                 </span>
//               </div>
//             </div>
//             {activity.status && (
//               <Badge variant={
//                 activity.status === 'Paid' ? 'default' :
//                   activity.status === 'Pending' ? 'secondary' : 'outline'
//               }>
//                 {activity.status}
//               </Badge>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // Low Stock Alerts Component
// function LowStockAlerts({ lowStockData, user, onViewProduct }) {
//   if (!lowStockData || lowStockData.count === 0) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="text-center">
//             <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No low stock alerts</p>
//             <p className="text-sm text-gray-400 mt-1">All products are well stocked</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const getAlertLevel = (stock) => {
//     if (stock <= 3) return { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' };
//     if (stock <= 10) return { label: 'Warning', color: 'text-orange-600', bgColor: 'bg-orange-50' };
//     return { label: 'Low', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <AlertCircle className="w-5 h-5 text-red-600" />
//           Low Stock Alerts
//           <Badge variant="destructive" className="ml-2">
//             {lowStockData.count} items
//           </Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           {lowStockData.products.slice(0, 10).map((product, index) => {
//             const alertLevel = getAlertLevel(product.currentStock);
//             return (
//               <div
//                 key={index}
//                 className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
//                 onClick={() => onViewProduct(product)}
//               >
//                 <div className="flex items-center space-x-3 flex-1">
//                   <img
//                     src={product.image || '/placeholder-product.jpg'}
//                     alt={product.name}
//                     className="w-10 h-10 object-cover rounded border"
//                   />
//                   <div className="flex-1">
//                     <p className="font-medium text-sm text-gray-900">{product.name}</p>
//                     <div className="flex items-center space-x-4 mt-1">
//                       <div className="flex items-center space-x-1">
//                         <span className="text-xs text-gray-500">Stock:</span>
//                         <span className={`text-sm font-medium ${alertLevel.color}`}>
//                           {product.currentStock}
//                         </span>
//                       </div>
//                       {!user.isVendor && product.vendor && (
//                         <div className="flex items-center space-x-1">
//                           <span className="text-xs text-gray-500">Vendor:</span>
//                           <span className="text-sm font-medium">{product.vendor.companyName}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Badge variant={product.currentStock <= 3 ? "destructive" : "secondary"}>
//                     {alertLevel.label}
//                   </Badge>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onViewProduct(product);
//                     }}
//                   >
//                     <Eye className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {lowStockData.count > 10 && (
//           <div className="mt-4 text-center">
//             <Button variant="outline" size="sm">
//               View All {lowStockData.count} Alerts
//             </Button>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // Pending Requests Component
// function PendingRequests({ pendingRequests, user }) {
//   if (!pendingRequests || pendingRequests.count === 0) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="text-center">
//             <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No pending requests</p>
//             <p className="text-sm text-gray-400 mt-1">All requests have been processed</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const getRequestTypeIcon = (type) => {
//     switch (type) {
//       case 'product_deletion':
//         return <Package className="w-4 h-4 text-red-600" />;
//       case 'vendor_registration':
//         return <Users className="w-4 h-4 text-blue-600" />;
//       default:
//         return <FileText className="w-4 h-4 text-gray-600" />;
//     }
//   };

//   const getRequestTypeColor = (type) => {
//     switch (type) {
//       case 'product_deletion':
//         return 'bg-red-50 border-red-200';
//       case 'vendor_registration':
//         return 'bg-blue-50 border-blue-200';
//       default:
//         return 'bg-gray-50 border-gray-200';
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Clock className="w-5 h-5 text-orange-600" />
//           Pending Requests
//           <Badge variant="secondary" className="ml-2">
//             {pendingRequests.count} pending
//           </Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           {pendingRequests.requests.slice(0, 10).map((request, index) => (
//             <div
//               key={index}
//               className={`p-3 border rounded-lg ${getRequestTypeColor(request.type)}`}
//             >
//               <div className="flex items-start space-x-3">
//                 <div className="p-2 bg-white rounded-lg border">
//                   {getRequestTypeIcon(request.type)}
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-medium text-sm text-gray-900">
//                     {request.type === 'product_deletion'
//                       ? `Delete ${request.product.name}`
//                       : `New Vendor: ${request.vendor.companyName}`
//                     }
//                   </p>
//                   <p className="text-xs text-gray-600 mt-1">
//                     {request.type === 'product_deletion'
//                       ? `Vendor: ${request.vendor.companyName} • Reason: ${request.reason}`
//                       : `Contact: ${request.vendor.contactPerson} • ${request.vendor.phone}`
//                     }
//                   </p>
//                   <div className="flex items-center space-x-2 mt-2">
//                     <Calendar className="w-3 h-3 text-gray-400" />
//                     <span className="text-xs text-gray-500">
//                       Requested: {new Date(request.requestedAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//                 <Badge variant="outline">
//                   {request.type.replace('_', ' ')}
//                 </Badge>
//               </div>
//             </div>
//           ))}
//         </div>

//         {pendingRequests.count > 10 && (
//           <div className="mt-4 text-center">
//             <Button variant="outline" size="sm">
//               Manage All Requests
//             </Button>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // Analytics Charts Component
// function AnalyticsCharts({ analyticsData }) {
//   if (!analyticsData || !analyticsData.sales || analyticsData.sales.length === 0) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="text-center">
//             <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No analytics data available</p>
//             <p className="text-sm text-gray-400 mt-1">Data will appear as sales are recorded</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Sales Chart */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <TrendingUp className="w-5 h-5 text-green-600" />
//             Sales Performance ({analyticsData.period})
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {analyticsData.sales.map((item, index) => (
//               <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                 <div className="flex-1">
//                   <p className="font-medium text-sm">{item.period}</p>
//                   <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
//                     <div>
//                       <span className="text-gray-500">Sales: </span>
//                       <span className="font-medium">{formatCurrency(item.sales)}</span> {/* UPDATED */}
//                     </div>
//                     <div>
//                       <span className="text-gray-500">Profit: </span>
//                       <span className="font-medium text-green-600">{formatCurrency(item.profit)}</span> {/* UPDATED */}
//                     </div>
//                     <div>
//                       <span className="text-gray-500">Orders: </span>
//                       <span className="font-medium">{item.orders}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Summary */}
//           {analyticsData.summary && (
//             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//               <h4 className="font-semibold text-gray-900 mb-3">Period Summary</h4>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-blue-600">{formatCurrency(analyticsData.summary.totalSales)}</p> {/* UPDATED */}
//                   <p className="text-xs text-gray-600">Total Sales</p>
//                 </div>
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.summary.totalProfit)}</p> {/* UPDATED */}
//                   <p className="text-xs text-gray-600">Total Profit</p>
//                 </div>
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-purple-600">{analyticsData.summary.totalOrders}</p>
//                   <p className="text-xs text-gray-600">Total Orders</p>
//                 </div>
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-orange-600">{analyticsData.summary.topVendors || '-'}</p>
//                   <p className="text-xs text-gray-600">Top Vendors</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Top Products/Vendors */}
//       {(analyticsData.topProducts || analyticsData.vendorPerformance) && (
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               {analyticsData.topProducts ? 'Top Products' : 'Vendor Performance'}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {(analyticsData.topProducts || analyticsData.vendorPerformance)?.slice(0, 5).map((item, index) => (
//                 <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                       <span className="text-sm font-bold text-blue-600">{index + 1}</span>
//                     </div>
//                     <div>
//                       <p className="font-medium text-sm">
//                         {item.name || item.vendor}
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         Sold: {item.sold?.toLocaleString() || item.orders} units
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold text-green-600">
//                       {formatCurrency(item.revenue || item.sales)} {/* UPDATED */}
//                     </p>
//                     <p className="text-xs text-gray-600">Revenue</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// // Product View Modal Component
// function ProductViewModal({ product, isOpen, onClose }) {
//   if (!product) return null;

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Product Details"
//       size="lg"
//     >
//       <div className="space-y-6">
//         {/* Product Header */}
//         <div className="flex items-start space-x-4">
//           <img
//             src={product.product?.images?.[0] || product.image || '/placeholder-product.jpg'}
//             alt={product.product?.name || product.name}
//             className="w-20 h-20 object-cover rounded-lg border"
//           />
//           <div className="flex-1">
//             <h3 className="text-xl font-bold text-gray-900">{product.product?.name || product.name}</h3>
//             <p className="text-gray-600 mt-1">{product.product?.description}</p>
//           </div>
//         </div>

//         {/* Stock Information */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center p-3 bg-blue-50 rounded-lg">
//             <p className="text-sm text-gray-600">Allocated</p>
//             <p className="text-2xl font-bold text-blue-600">{product.allocatedStock || '-'}</p>
//           </div>
//           <div className="text-center p-3 bg-green-50 rounded-lg">
//             <p className="text-sm text-gray-600">Current</p>
//             <p className="text-2xl font-bold text-green-600">{product.currentStock || product.totalStock}</p>
//           </div>
//           <div className="text-center p-3 bg-purple-50 rounded-lg">
//             <p className="text-sm text-gray-600">Sold</p>
//             <p className="text-2xl font-bold text-purple-600">{product.soldStock || '-'}</p>
//           </div>
//           <div className="text-center p-3 bg-orange-50 rounded-lg">
//             <p className="text-sm text-gray-600">Status</p>
//             <Badge variant={(product.currentStock || product.totalStock) > 0 ? "default" : "destructive"} className="mt-1">
//               {(product.currentStock || product.totalStock) > 0 ? 'In Stock' : 'Out of Stock'}
//             </Badge>
//           </div>
//         </div>

//         {/* Variant Details */}
//         {(product.size || product.color || product.fabric) && (
//           <div className="border rounded-lg p-4">
//             <h4 className="font-semibold text-gray-900 mb-3">Variant Details</h4>
//             <div className="grid grid-cols-2 gap-4">
//               {product.size && (
//                 <div>
//                   <span className="text-sm text-gray-600">Size:</span>
//                   <p className="font-medium">{product.size}</p>
//                 </div>
//               )}
//               {product.color && (
//                 <div>
//                   <span className="text-sm text-gray-600">Color:</span>
//                   <p className="font-medium">{product.color}</p>
//                 </div>
//               )}
//               {product.fabric && (
//                 <div>
//                   <span className="text-sm text-gray-600">Fabric:</span>
//                   <p className="font-medium">{product.fabric}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Pricing Information */}
//         <div className="border rounded-lg p-4">
//           <h4 className="font-semibold text-gray-900 mb-3">Pricing Information</h4>
//           <div className="space-y-2">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Cost Price:</span>
//               <span className="font-medium">{formatCurrency(product.costPrice || product.product?.costPrice)}</span> {/* UPDATED */}
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Sale Price:</span>
//               <span className="font-medium">{formatCurrency(product.salePrice || product.product?.salePrice)}</span> {/* UPDATED */}
//             </div>
//             {product.vendorPrice && (
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Vendor Price:</span>
//                 <span className="font-medium">{formatCurrency(product.vendorPrice)}</span> {/* UPDATED */}
//               </div>
//             )}
//             {product.profitPerPiece && (
//               <div className="flex justify-between border-t pt-2">
//                 <span className="text-gray-800 font-bold">Profit Per Piece:</span>
//                 <span className="font-bold text-green-600">{formatCurrency(product.profitPerPiece)}</span> {/* UPDATED */}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Vendor Information (for admin) */}
//         {product.vendor && (
//           <div className="border rounded-lg p-4">
//             <h4 className="font-semibold text-gray-900 mb-3">Vendor Information</h4>
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Company:</span>
//                 <span className="font-medium">{product.vendor.companyName}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Contact:</span>
//                 <span className="font-medium">{product.vendor.contactPerson}</span>
//               </div>
//               {product.vendor.phone && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Phone:</span>
//                   <span className="font-medium">{product.vendor.phone}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex justify-end space-x-3 pt-4">
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// // Vendor Products Component
// function VendorProducts({ products, onRequestDelete, onViewProduct }) {
//   if (!products || products.length === 0) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="text-center">
//             <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No products allocated yet</p>
//             <p className="text-sm text-gray-400 mt-1">Products allocated to you will appear here</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Package className="w-5 h-5" />
//           My Products
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {products.slice(0, 10).map((product, index) => (
//             <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
//               <div className="flex items-center space-x-4 flex-1">
//                 <img
//                   src={product.product?.images?.[0] || '/placeholder-product.jpg'}
//                   alt={product.product?.name}
//                   className="w-12 h-12 object-cover rounded border"
//                 />
//                 <div className="flex-1">
//                   <p className="font-medium text-gray-900">{product.product?.name}</p>
//                   <div className="flex items-center space-x-4 mt-1">
//                     <div className="flex items-center space-x-1">
//                       <span className="text-xs text-gray-500">Allocated:</span>
//                       <span className="text-sm font-medium">{product.allocatedStock}</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <span className="text-xs text-gray-500">Current:</span>
//                       <span className="text-sm font-medium">{product.currentStock}</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <span className="text-xs text-gray-500">Sold:</span>
//                       <span className="text-sm font-medium">{product.soldStock}</span>
//                     </div>
//                   </div>
//                   {(product.size || product.color) && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       {product.size && `Size: ${product.size}`}
//                       {product.size && product.color && ' • '}
//                       {product.color && `Color: ${product.color}`}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Badge variant={product.currentStock > 0 ? "default" : "destructive"}>
//                   {product.currentStock > 0 ? 'In Stock' : 'Out of Stock'}
//                 </Badge>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => onViewProduct(product)}
//                 >
//                   <Eye className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => onRequestDelete(product)}
//                 >
//                   Delete Request
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // Invoices Component
// function InvoicesSection({ invoices, user, onCreateInvoice, onViewInvoice, onEditInvoice }) {
//   const getStatusColor = (status) => {
//     const colors = {
//       Draft: 'bg-gray-100 text-gray-800',
//       Sent: 'bg-blue-100 text-blue-800',
//       Paid: 'bg-green-100 text-green-800',
//       Overdue: 'bg-red-100 text-red-800',
//       Cancelled: 'bg-gray-100 text-gray-800'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
//     try {
//       const blob = await invoiceService.downloadInvoice(invoiceId);
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.style.display = 'none';
//       a.href = url;
//       a.download = `invoice-${invoiceNumber}.html`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//       toast.success('Invoice downloaded! Open the file and click "Print Invoice" to save as PDF.');
//     } catch (error) {
//       console.error('Download failed:', error);
//       toast.error('Failed to download invoice. Please try again.');
//     }
//   };

//   const handlePrintInvoice = async (invoiceId) => {
//     try {
//       const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
//       const htmlText = await response.text();

//       const printWindow = window.open('', '_blank');
//       printWindow.document.write(htmlText);
//       printWindow.document.close();

//       // Auto-print after loading
//       printWindow.onload = function () {
//         setTimeout(() => {
//           printWindow.print();
//         }, 500);
//       };

//     } catch (error) {
//       console.error('Print failed:', error);
//       toast.error('Failed to open invoice for printing.');
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle className="flex items-center gap-2">
//           <FileText className="w-5 h-5" />
//           Recent Invoices
//         </CardTitle>
//         {!user.isVendor && (
//           <Button onClick={onCreateInvoice}>
//             <Plus className="w-4 h-4 mr-2" />
//             Create Invoice
//           </Button>
//         )}
//       </CardHeader>
//       <CardContent>
//         {invoices.length > 0 ? (
//           <div className="space-y-4">
//             {invoices.slice(0, 5).map((invoice) => (
//               <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
//                 <div className="flex-1">
//                   <div className="flex items-center space-x-3">
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <FileText className="w-4 h-4 text-blue-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium text-gray-900">#{invoice.invoiceNumber}</p>
//                       <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
//                         <span>{invoice.vendor?.companyName || 'System'}</span>
//                         <span>•</span>
//                         <span>{invoice.type?.replace('_', ' ') || 'Invoice'}</span>
//                         <span>•</span>
//                         <span className="flex items-center">
//                           {formatCurrency(invoice.totalAmount)} {/* UPDATED */}
//                         </span>
//                       </div>
//                       <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
//                         <Calendar className="w-3 h-3" />
//                         <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Badge className={getStatusColor(invoice.status)}>
//                     {invoice.status}
//                   </Badge>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => onViewInvoice(invoice)}
//                   >
//                     <Eye className="w-4 h-4 mr-1" />
//                     View
//                   </Button>
//                   {!user.isVendor && invoice.status !== 'Paid' && (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => onEditInvoice(invoice)}
//                     >
//                       <Edit className="w-4 h-4 mr-1" />
//                       Edit
//                     </Button>
//                   )}
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleDownloadInvoice(invoice._id, invoice.invoiceNumber)}
//                   >
//                     <Download className="w-4 h-4 mr-1" />
//                     Download
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handlePrintInvoice(invoice._id)}
//                   >
//                     <Printer className="w-4 h-4 mr-1" />
//                     Print
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No invoices found</p>
//             <p className="text-sm text-gray-400 mt-1">
//               {user.isVendor ? 'Your invoices will appear here' : 'Create your first invoice to get started'}
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // Invoice View Modal Component
// function InvoiceViewModal({ invoice, isOpen, onClose, onEdit }) {
//   if (!invoice) return null;

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title={`Invoice #${invoice.invoiceNumber}`}
//       size="xl"
//     >
//       <div className="space-y-6">
//         {/* Invoice Header */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-2">Vendor Information</h4>
//             <div className="space-y-1 text-sm">
//               <p className="font-medium">{invoice.vendor?.companyName}</p>
//               <p className="text-gray-600">{invoice.vendor?.contactPerson}</p>
//               <p className="text-gray-600">{invoice.vendor?.phone}</p>
//             </div>
//           </div>
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-2">Invoice Details</h4>
//             <div className="space-y-1 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Type:</span>
//                 <span className="font-medium">{invoice.type?.replace('_', ' ')}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Status:</span>
//                 <Badge variant={
//                   invoice.status === 'Paid' ? 'default' :
//                     invoice.status === 'Pending' ? 'secondary' : 'outline'
//                 }>
//                   {invoice.status}
//                 </Badge>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Due Date:</span>
//                 <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Invoice Items */}
//         <div>
//           <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
//           <div className="border rounded-lg">
//             <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b font-medium text-sm">
//               <div className="col-span-5">Product</div>
//               <div className="col-span-2 text-center">Qty</div>
//               <div className="col-span-2 text-right">Unit Price</div>
//               <div className="col-span-3 text-right">Total</div>
//             </div>
//             {invoice.items?.map((item, index) => (
//               <div key={index} className="grid grid-cols-12 gap-4 p-3 border-b text-sm">
//                 <div className="col-span-5">
//                   <p className="font-medium">{item.productName}</p>
//                   {(item.size || item.color) && (
//                     <p className="text-xs text-gray-500">
//                       {item.size && `Size: ${item.size}`}
//                       {item.size && item.color && ' • '}
//                       {item.color && `Color: ${item.color}`}
//                     </p>
//                   )}
//                 </div>
//                 <div className="col-span-2 text-center">{item.quantity}</div>
//                 <div className="col-span-2 text-right">
//                   {formatCurrency(item.unitPrice)} {/* UPDATED */}
//                 </div>
//                 <div className="col-span-3 text-right font-medium">
//                   {formatCurrency(item.totalPrice)} {/* UPDATED */}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Invoice Summary */}
//         <div className="border-t pt-4">
//           <div className="flex justify-end">
//             <div className="w-64 space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Subtotal:</span>
//                 <span className="font-medium">
//                   {formatCurrency(invoice.subtotal)} {/* UPDATED */}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Tax:</span>
//                 <span className="font-medium">
//                   {formatCurrency(invoice.taxAmount)} {/* UPDATED */}
//                 </span>
//               </div>
//               <div className="flex justify-between border-t pt-2 font-bold text-lg">
//                 <span>Total Amount:</span>
//                 <span className="text-blue-600">
//                   {formatCurrency(invoice.totalAmount)} {/* UPDATED */}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Notes & Terms */}
//         {(invoice.notes || invoice.terms) && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {invoice.notes && (
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
//                 <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{invoice.notes}</p>
//               </div>
//             )}
//             {invoice.terms && (
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
//                 <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{invoice.terms}</p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex justify-end space-x-3 pt-4">
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//           {onEdit && invoice.status !== 'Paid' && (
//             <Button variant="outline" onClick={() => onEdit(invoice)}>
//               <Edit className="w-4 h-4 mr-2" />
//               Edit Invoice
//             </Button>
//           )}
//           <Button>
//             <Download className="w-4 h-4 mr-2" />
//             Download PDF
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// // Main Dashboard Component
// export default function Dashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const [dashboardData, setDashboardData] = useState(null);
//   const [vendorData, setVendorData] = useState(null);
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // New data states for the 4 routes
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [analyticsData, setAnalyticsData] = useState(null);
//   const [lowStockData, setLowStockData] = useState(null);
//   const [pendingRequests, setPendingRequests] = useState(null);

//   // Modal states
//   const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
//   const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
//   const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
//   const [isInvoiceEditModalOpen, setIsInvoiceEditModalOpen] = useState(false);
//   const [isDeleteRequestModalOpen, setIsDeleteRequestModalOpen] = useState(false);
//   const [isProductViewModalOpen, setIsProductViewModalOpen] = useState(false);
//   const [isInvoiceViewModalOpen, setIsInvoiceViewModalOpen] = useState(false);

//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [selectedInvoice, setSelectedInvoice] = useState(null);
//   const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState(null);

//   useEffect(() => {
//     if (user && !authLoading) {
//       loadDashboardData();
//     }
//   }, [user, authLoading]);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Load main dashboard data
//       const dashboardResponse = await dashboardService.getDashboardData();
//       if (dashboardResponse.success) {
//         setDashboardData(dashboardResponse.data);

//         if (user.isVendor) {
//           setVendorData(dashboardResponse.data.vendor);
//           setInvoices(dashboardResponse.data.recentInvoices || []);
//         } else {
//           setInvoices(dashboardResponse.data.recentInvoices || []);
//         }
//       }

//       // Load additional dashboard data from the 4 new routes
//       await loadAdditionalData();

//     } catch (error) {
//       console.error('Dashboard load error:', error);
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadAdditionalData = async () => {
//     try {
//       // Load recent activity
//       const activityResponse = await dashboardService.getRecentActivity(10);
//       if (activityResponse.success) {
//         setRecentActivity(activityResponse.data);
//       }

//       // Load analytics data
//       const analyticsResponse = await dashboardService.getSalesAnalytics('monthly');
//       if (analyticsResponse.success) {
//         setAnalyticsData(analyticsResponse.data);
//       }

//       // Load low stock alerts
//       const lowStockResponse = await dashboardService.getLowStockAlerts();
//       if (lowStockResponse.success) {
//         setLowStockData(lowStockResponse.data);
//       }

//       // Load pending requests
//       const pendingResponse = await dashboardService.getPendingRequests();
//       if (pendingResponse.success) {
//         setPendingRequests(pendingResponse.data);
//       }

//     } catch (error) {
//       console.error('Additional data load error:', error);
//       // Don't show toast for these as they're secondary data
//     }
//   };

//   const handleDeleteRequest = (product) => {
//     setSelectedProduct(product);
//     setIsDeleteRequestModalOpen(true);
//   };

//   const handleViewProduct = (product) => {
//     setSelectedProduct(product);
//     setIsProductViewModalOpen(true);
//   };

//   const handleViewInvoice = (invoice) => {
//     setSelectedInvoice(invoice);
//     setIsInvoiceViewModalOpen(true);
//   };

//   const handleEditInvoice = (invoice) => {
//     setSelectedInvoiceForEdit(invoice);
//     setIsInvoiceEditModalOpen(true);
//   };

//   const handleCreateInvoice = () => {
//     setIsInvoiceModalOpen(true);
//   };

//   const handleModalSuccess = () => {
//     loadDashboardData(); // Refresh data after successful action
//   };

//   if (authLoading || loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p className="text-gray-600">Please login to access dashboard</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               {user.isVendor ? 'Vendor Dashboard' : 'Admin Dashboard'}
//             </h1>
//             <p className="text-gray-600 mt-2">
//               Welcome back, {user.firstName} {user.lastName}
//             </p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <Badge variant="secondary" className="text-sm">
//               {user.isVendor
//                 ? vendorData?.companyName
//                 : user.role === 'super_admin' ? 'Super Admin' : 'Admin'
//               }
//             </Badge>
//             {!user.isVendor && (
//               <div className="flex flex-wrap gap-2">
//                 <Button onClick={() => setIsVendorModalOpen(true)} size="sm">
//                   <Users className="w-4 h-4 mr-2" />
//                   Create Vendor
//                 </Button>
//                 <Button variant="outline" onClick={() => setIsAllocationModalOpen(true)} size="sm">
//                   <Package className="w-4 h-4 mr-2" />
//                   Allocate Products
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Stats Section */}
//         {user.isVendor ? (
//           <VendorStats
//             vendorData={vendorData}
//             stats={dashboardData?.stats}
//           />
//         ) : (
//           <AdminStats stats={dashboardData?.stats} />
//         )}

//         {/* Tabs Content */}
//         <Tabs defaultValue="overview" className="mt-8">
//           <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
//             <TabsTrigger value="overview">Overview</TabsTrigger>
//             <TabsTrigger value="analytics">Analytics</TabsTrigger>
//             <TabsTrigger value="products">Products</TabsTrigger>
//             <TabsTrigger value="invoices">Invoices</TabsTrigger>
//             {!user.isVendor && (
//               <TabsTrigger value="management">Management</TabsTrigger>
//             )}
//           </TabsList>

//           {/* Overview Tab */}
//           <TabsContent value="overview" className="space-y-6 mt-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Recent Activity */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Activity className="w-5 h-5" />
//                     Recent Activity
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <ActivityFeed
//                     activities={recentActivity}
//                     onViewInvoice={handleViewInvoice}
//                   />
//                 </CardContent>
//               </Card>

//               {/* Quick Stats & Alerts */}
//               <div className="space-y-6">
//                 {/* Low Stock Alerts */}
//                 <LowStockAlerts
//                   lowStockData={lowStockData}
//                   user={user}
//                   onViewProduct={handleViewProduct}
//                 />

//                 {/* Pending Requests (Admin only) */}
//                 {!user.isVendor && pendingRequests && pendingRequests.count > 0 && (
//                   <PendingRequests
//                     pendingRequests={pendingRequests}
//                     user={user}
//                   />
//                 )}
//               </div>
//             </div>
//           </TabsContent>

//           {/* Analytics Tab */}
//           <TabsContent value="analytics" className="space-y-6 mt-6">
//             <AnalyticsCharts analyticsData={analyticsData} />
//           </TabsContent>

//           {/* Products Tab */}
//           <TabsContent value="products" className="space-y-6 mt-6">
//             {user.isVendor ? (
//               <VendorProducts
//                 products={vendorData?.products}
//                 onRequestDelete={handleDeleteRequest}
//                 onViewProduct={handleViewProduct}
//               />
//             ) : (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <LowStockAlerts
//                   lowStockData={lowStockData}
//                   user={user}
//                   onViewProduct={handleViewProduct}
//                 />
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Product Management</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-center py-8">
//                       <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                       <p className="text-gray-500">Product management for all vendors</p>
//                       <p className="text-sm text-gray-400 mt-1">Use the management tab to allocate products</p>
//                       <Button
//                         className="mt-4"
//                         onClick={() => setIsAllocationModalOpen(true)}
//                       >
//                         <Package className="w-4 h-4 mr-2" />
//                         Allocate Products
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}
//           </TabsContent>

//           {/* Invoices Tab */}
//           <TabsContent value="invoices" className="space-y-6 mt-6">
//             <InvoicesSection
//               invoices={invoices}
//               user={user}
//               onCreateInvoice={handleCreateInvoice}
//               onViewInvoice={handleViewInvoice}
//               onEditInvoice={handleEditInvoice}
//             />
//           </TabsContent>

//           {/* Management Tab (Admin only) */}
//           {!user.isVendor && (
//             <TabsContent value="management" className="space-y-6 mt-6">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Vendor Management</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       <p className="text-gray-600">
//                         Manage all vendors, product allocations, and system requests from this centralized panel.
//                       </p>
//                       <div className="flex flex-wrap gap-3">
//                         <Button onClick={() => setIsVendorModalOpen(true)}>
//                           <Users className="w-4 h-4 mr-2" />
//                           Manage Vendors
//                         </Button>
//                         <Button variant="outline" onClick={() => setIsAllocationModalOpen(true)}>
//                           <Package className="w-4 h-4 mr-2" />
//                           Product Allocation
//                         </Button>
//                         <Button variant="outline">
//                           <AlertCircle className="w-4 h-4 mr-2" />
//                           View Delete Requests
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>System Overview</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="text-center p-4 bg-blue-50 rounded-lg">
//                           <p className="text-2xl font-bold text-blue-600">{dashboardData?.stats?.totalVendors || 0}</p>
//                           <p className="text-sm text-gray-600">Total Vendors</p>
//                         </div>
//                         <div className="text-center p-4 bg-green-50 rounded-lg">
//                           <p className="text-2xl font-bold text-green-600">{dashboardData?.stats?.totalProducts || 0}</p>
//                           <p className="text-sm text-gray-600">Total Products</p>
//                         </div>
//                         <div className="text-center p-4 bg-purple-50 rounded-lg">
//                           <p className="text-2xl font-bold text-purple-600">{pendingRequests?.count || 0}</p>
//                           <p className="text-sm text-gray-600">Pending Requests</p>
//                         </div>
//                         <div className="text-center p-4 bg-orange-50 rounded-lg">
//                           <p className="text-2xl font-bold text-orange-600">{lowStockData?.count || 0}</p>
//                           <p className="text-sm text-gray-600">Low Stock Items</p>
//                         </div>
//                       </div>
//                       <Button variant="outline" className="w-full">
//                         <BarChart3 className="w-4 h-4 mr-2" />
//                         View Detailed Reports
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </TabsContent>
//           )}
//         </Tabs>
//       </div>

//       {/* Modals */}
//       <Modal
//         isOpen={isVendorModalOpen}
//         onClose={() => setIsVendorModalOpen(false)}
//         title="Create New Vendor"
//         size="lg"
//       >
//         <VendorCreateForm
//           onSuccess={() => {
//             setIsVendorModalOpen(false);
//             handleModalSuccess();
//             toast.success('Vendor created successfully!');
//           }}
//         />
//       </Modal>

//       <Modal
//         isOpen={isAllocationModalOpen}
//         onClose={() => setIsAllocationModalOpen(false)}
//         title="Allocate Products to Vendor"
//         size="xl"
//       >
//         <ProductAllocationForm
//           onSuccess={() => {
//             setIsAllocationModalOpen(false);
//             handleModalSuccess();
//             toast.success('Products allocated successfully!');
//           }}
//         />
//       </Modal>

//       <Modal
//         isOpen={isInvoiceModalOpen}
//         onClose={() => setIsInvoiceModalOpen(false)}
//         title="Create New Invoice"
//         size="xl"
//       >
//         <InvoiceCreateForm
//           onSuccess={() => {
//             setIsInvoiceModalOpen(false);
//             handleModalSuccess();
//             toast.success('Invoice created successfully!');
//           }}
//         />
//       </Modal>

//       <Modal
//         isOpen={isInvoiceEditModalOpen}
//         onClose={() => {
//           setIsInvoiceEditModalOpen(false);
//           setSelectedInvoiceForEdit(null);
//         }}
//         title="Edit Invoice"
//         size="4xl"
//       >
//         <InvoiceCreateForm
//           editData={selectedInvoiceForEdit}
//           isEdit={true}
//           onSuccess={() => {
//             setIsInvoiceEditModalOpen(false);
//             setSelectedInvoiceForEdit(null);
//             handleModalSuccess();
//             toast.success('Invoice updated successfully!');
//           }}
//           onCancel={() => {
//             setIsInvoiceEditModalOpen(false);
//             setSelectedInvoiceForEdit(null);
//           }}
//         />
//       </Modal>

//       {/* Product View Modal */}
//       <ProductViewModal
//         product={selectedProduct}
//         isOpen={isProductViewModalOpen}
//         onClose={() => {
//           setIsProductViewModalOpen(false);
//           setSelectedProduct(null);
//         }}
//       />

//       {/* Invoice View Modal */}
//       <InvoiceViewModal
//         invoice={selectedInvoice}
//         isOpen={isInvoiceViewModalOpen}
//         onClose={() => {
//           setIsInvoiceViewModalOpen(false);
//           setSelectedInvoice(null);
//         }}
//         onEdit={(invoice) => {
//           setSelectedInvoiceForEdit(invoice);
//           setIsInvoiceEditModalOpen(true);
//           setIsInvoiceViewModalOpen(false);
//         }}
//       />

//       {/* Delete Request Modal */}
//       <Modal
//         isOpen={isDeleteRequestModalOpen}
//         onClose={() => {
//           setIsDeleteRequestModalOpen(false);
//           setSelectedProduct(null);
//         }}
//         title="Request Product Deletion"
//         size="md"
//       >
//         <div className="space-y-4">
//           <div className="p-4 bg-gray-50 rounded-lg">
//             <p className="font-medium">{selectedProduct?.product?.name}</p>
//             <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
//               <div>
//                 <span className="text-gray-600">Current Stock:</span>
//                 <span className="ml-2 font-medium">{selectedProduct?.currentStock}</span>
//               </div>
//               <div>
//                 <span className="text-gray-600">Sold Stock:</span>
//                 <span className="ml-2 font-medium">{selectedProduct?.soldStock}</span>
//               </div>
//               {selectedProduct?.size && (
//                 <div>
//                   <span className="text-gray-600">Size:</span>
//                   <span className="ml-2 font-medium">{selectedProduct.size}</span>
//                 </div>
//               )}
//               {selectedProduct?.color && (
//                 <div>
//                   <span className="text-gray-600">Color:</span>
//                   <span className="ml-2 font-medium">{selectedProduct.color}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Reason for deletion *
//             </label>
//             <textarea
//               placeholder="Please provide a reason for requesting product deletion..."
//               className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               rows={4}
//             />
//           </div>
//           <div className="flex justify-end space-x-3 pt-4">
//             <Button
//               variant="outline"
//               onClick={() => setIsDeleteRequestModalOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={async () => {
//                 try {
//                   // Handle delete request submission
//                   await vendorService.requestDelete(
//                     vendorData._id,
//                     selectedProduct.product._id,
//                     "User requested deletion" // You can get this from textarea
//                   );
//                   setIsDeleteRequestModalOpen(false);
//                   setSelectedProduct(null);
//                   handleModalSuccess();
//                   toast.success('Delete request submitted successfully!');
//                 } catch (error) {
//                   toast.error('Failed to submit delete request');
//                 }
//               }}
//             >
//               Submit Request
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }









// app/dashboard/page.jsx - FIXED VERSION
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  Plus,
  Download,
  Eye,
  BarChart3,
  Activity,
  Calendar,
  Printer,
  Edit,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { VendorCreateForm } from '@/components/vendors/VendorCreateForm';
import { ProductAllocationForm } from '@/components/vendors/ProductAllocationForm';
import { InvoiceCreateForm } from '@/components/invoices/InvoiceCreateForm';
import { useAuth } from '@/context/AuthContext';
import { dashboardService } from '@/services/dashboardService';
import { vendorService } from '@/services/vendorService';
import { invoiceService } from '@/services/invoiceService';

// CURRENCY IMPORTS
import { formatCurrency, getCurrencySymbol } from '@/lib/currencyUtils';

// Vendor Stats Component - FIXED: Only show vendor-specific stats
function VendorStats({ vendorData, stats }) {
  const statsConfig = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+5%'
    },
    {
      title: 'Current Stock',
      value: stats?.currentStock || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12%'
    },
    {
      title: 'Sold Stock',
      value: stats?.soldStock || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+8%'
    },
    {
      title: 'Total Sales',
      value: formatCurrency(stats?.totalSales || 0),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+15%'
    },
    {
      title: 'Total Profit',
      value: formatCurrency(stats?.totalProfit || 0),
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+20%'
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockProducts || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '-2%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsConfig.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
                <div className={`flex items-center text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change.startsWith('+') ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Admin Stats Component - FIXED: Only show admin-specific stats
function AdminStats({ stats }) {
  const adminStats = [
    {
      title: 'Total Vendors',
      value: stats?.totalVendors || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+3%'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%'
    },
    {
      title: 'Total Sales',
      value: formatCurrency(stats?.totalSales || 0),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+12%'
    },
    {
      title: 'Total Profit',
      value: formatCurrency(stats?.totalProfit || 0),
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+18%'
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%'
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockProducts || 0,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '-3%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {adminStats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
                <div className={`flex items-center text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change.startsWith('+') ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Activity Feed Component
function ActivityFeed({ activities, onViewInvoice }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'product':
        return <Package className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-50 border-blue-200';
      case 'product':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={index}
          className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getActivityColor(activity.type)}`}
          onClick={() => activity.type === 'invoice' && onViewInvoice(activity)}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white rounded-lg border">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
              {activity.amount && (
                <p className="text-xs font-medium text-gray-700 mt-1">
                  Amount: {formatCurrency(activity.amount)}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            {activity.status && (
              <Badge variant={
                activity.status === 'Paid' ? 'default' :
                  activity.status === 'Pending' ? 'secondary' : 'outline'
              }>
                {activity.status}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Low Stock Alerts Component
function LowStockAlerts({ lowStockData, user, onViewProduct }) {
  if (!lowStockData || lowStockData.count === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No low stock alerts</p>
            <p className="text-sm text-gray-400 mt-1">All products are well stocked</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAlertLevel = (stock) => {
    if (stock <= 3) return { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (stock <= 10) return { label: 'Warning', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { label: 'Low', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Low Stock Alerts
          <Badge variant="destructive" className="ml-2">
            {lowStockData.count} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockData.products.slice(0, 10).map((product, index) => {
            const alertLevel = getAlertLevel(product.currentStock);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewProduct(product)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <img
                    src={product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{product.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Stock:</span>
                        <span className={`text-sm font-medium ${alertLevel.color}`}>
                          {product.currentStock}
                        </span>
                      </div>
                      {!user.isVendor && product.vendor && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Vendor:</span>
                          <span className="text-sm font-medium">{product.vendor.companyName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={product.currentStock <= 3 ? "destructive" : "secondary"}>
                    {alertLevel.label}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProduct(product);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {lowStockData.count > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All {lowStockData.count} Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pending Requests Component - FIXED: Only for admin
function PendingRequests({ pendingRequests, user }) {
  if (!user || user.isVendor) return null; // Vendor ko nahi dikhana
  
  if (!pendingRequests || pendingRequests.count === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pending requests</p>
            <p className="text-sm text-gray-400 mt-1">All requests have been processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'product_deletion':
        return <Package className="w-4 h-4 text-red-600" />;
      case 'vendor_registration':
        return <Users className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRequestTypeColor = (type) => {
    switch (type) {
      case 'product_deletion':
        return 'bg-red-50 border-red-200';
      case 'vendor_registration':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Pending Requests
          <Badge variant="secondary" className="ml-2">
            {pendingRequests.count} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingRequests.requests.slice(0, 10).map((request, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg ${getRequestTypeColor(request.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg border">
                  {getRequestTypeIcon(request.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">
                    {request.type === 'product_deletion'
                      ? `Delete ${request.product.name}`
                      : `New Vendor: ${request.vendor.companyName}`
                    }
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {request.type === 'product_deletion'
                      ? `Vendor: ${request.vendor.companyName} • Reason: ${request.reason}`
                      : `Contact: ${request.vendor.contactPerson} • ${request.vendor.phone}`
                    }
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Requested: {new Date(request.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge variant="outline">
                  {request.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {pendingRequests.count > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Manage All Requests
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Analytics Charts Component
function AnalyticsCharts({ analyticsData, user }) {
  if (!analyticsData || !analyticsData.sales || analyticsData.sales.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No analytics data available</p>
            <p className="text-sm text-gray-400 mt-1">Data will appear as sales are recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            {user.isVendor ? 'My Sales Performance' : 'Sales Performance'} ({analyticsData.period})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.sales.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.period}</p>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
                    <div>
                      <span className="text-gray-500">Sales: </span>
                      <span className="font-medium">{formatCurrency(item.sales)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Profit: </span>
                      <span className="font-medium text-green-600">{formatCurrency(item.profit)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Orders: </span>
                      <span className="font-medium">{item.orders}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {analyticsData.summary && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Period Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(analyticsData.summary.totalSales)}</p>
                  <p className="text-xs text-gray-600">Total Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.summary.totalProfit)}</p>
                  <p className="text-xs text-gray-600">Total Profit</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{analyticsData.summary.totalOrders}</p>
                  <p className="text-xs text-gray-600">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{analyticsData.summary.topVendors || '-'}</p>
                  <p className="text-xs text-gray-600">Top Vendors</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Product View Modal Component
function ProductViewModal({ product, isOpen, onClose }) {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Product Header */}
        <div className="flex items-start space-x-4">
          <img
            src={product.product?.images?.[0] || product.image || '/placeholder-product.jpg'}
            alt={product.product?.name || product.name}
            className="w-20 h-20 object-cover rounded-lg border"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{product.product?.name || product.name}</h3>
            <p className="text-gray-600 mt-1">{product.product?.description}</p>
          </div>
        </div>

        {/* Stock Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Allocated</p>
            <p className="text-2xl font-bold text-blue-600">{product.allocatedStock || '-'}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Current</p>
            <p className="text-2xl font-bold text-green-600">{product.currentStock || product.totalStock}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Sold</p>
            <p className="text-2xl font-bold text-purple-600">{product.soldStock || '-'}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant={(product.currentStock || product.totalStock) > 0 ? "default" : "destructive"} className="mt-1">
              {(product.currentStock || product.totalStock) > 0 ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>
        </div>

        {/* Variant Details */}
        {(product.size || product.color || product.fabric) && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Variant Details</h4>
            <div className="grid grid-cols-2 gap-4">
              {product.size && (
                <div>
                  <span className="text-sm text-gray-600">Size:</span>
                  <p className="font-medium">{product.size}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-sm text-gray-600">Color:</span>
                  <p className="font-medium">{product.color}</p>
                </div>
              )}
              {product.fabric && (
                <div>
                  <span className="text-sm text-gray-600">Fabric:</span>
                  <p className="font-medium">{product.fabric}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Information */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Pricing Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Cost Price:</span>
              <span className="font-medium">{formatCurrency(product.costPrice || product.product?.costPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sale Price:</span>
              <span className="font-medium">{formatCurrency(product.salePrice || product.product?.salePrice)}</span>
            </div>
            {product.vendorPrice && (
              <div className="flex justify-between">
                <span className="text-gray-600">Vendor Price:</span>
                <span className="font-medium">{formatCurrency(product.vendorPrice)}</span>
              </div>
            )}
            {product.profitPerPiece && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-bold">Profit Per Piece:</span>
                <span className="font-bold text-green-600">{formatCurrency(product.profitPerPiece)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Information (for admin) */}
        {product.vendor && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Vendor Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium">{product.vendor.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium">{product.vendor.contactPerson}</span>
              </div>
              {product.vendor.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{product.vendor.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Vendor Products Component - FIXED: Only for vendors
function VendorProducts({ products, onRequestDelete, onViewProduct, user }) {
  if (!user || !user.isVendor) return null; // Admin ko nahi dikhana

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products allocated yet</p>
            <p className="text-sm text-gray-400 mt-1">Products allocated to you will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          My Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.slice(0, 10).map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4 flex-1">
                <img
                  src={product.product?.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.product?.name}
                  className="w-12 h-12 object-cover rounded border"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.product?.name}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Allocated:</span>
                      <span className="text-sm font-medium">{product.allocatedStock}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Current:</span>
                      <span className="text-sm font-medium">{product.currentStock}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Sold:</span>
                      <span className="text-sm font-medium">{product.soldStock}</span>
                    </div>
                  </div>
                  {(product.size || product.color) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {product.size && `Size: ${product.size}`}
                      {product.size && product.color && ' • '}
                      {product.color && `Color: ${product.color}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={product.currentStock > 0 ? "default" : "destructive"}>
                  {product.currentStock > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProduct(product)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestDelete(product)}
                >
                  Delete Request
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Invoices Component - FIXED: Vendor can create invoices
function InvoicesSection({ invoices, user, onCreateInvoice, onViewInvoice, onEditInvoice }) {
  const getStatusColor = (status) => {
    const colors = {
      Draft: 'bg-gray-100 text-gray-800',
      Sent: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Overdue: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const blob = await invoiceService.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoice downloaded! Open the file and click "Print Invoice" to save as PDF.');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  const handlePrintInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      const htmlText = await response.text();

      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlText);
      printWindow.document.close();

      // Auto-print after loading
      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };

    } catch (error) {
      console.error('Print failed:', error);
      toast.error('Failed to open invoice for printing.');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Recent Invoices
        </CardTitle>
        {/* FIXED: Vendor bhi invoice create kar sakta hai */}
        <Button onClick={onCreateInvoice}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.slice(0, 5).map((invoice) => (
              <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{invoice.invoiceNumber}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{invoice.vendor?.companyName || 'System'}</span>
                        <span>•</span>
                        <span>{invoice.type?.replace('_', ' ') || 'Invoice'}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          {formatCurrency(invoice.totalAmount)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewInvoice(invoice)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {invoice.status !== 'Paid' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditInvoice(invoice)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice._id, invoice.invoiceNumber)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintInvoice(invoice._id)}
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
            <p className="text-sm text-gray-400 mt-1">
              {user.isVendor ? 'Your invoices will appear here' : 'Create your first invoice to get started'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Invoice View Modal Component
function InvoiceViewModal({ invoice, isOpen, onClose, onEdit, user }) {
  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice #${invoice.invoiceNumber}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Vendor Information</h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{invoice.vendor?.companyName}</p>
              <p className="text-gray-600">{invoice.vendor?.contactPerson}</p>
              <p className="text-gray-600">{invoice.vendor?.phone}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Invoice Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{invoice.type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={
                  invoice.status === 'Paid' ? 'default' :
                    invoice.status === 'Pending' ? 'secondary' : 'outline'
                }>
                  {invoice.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
          <div className="border rounded-lg">
            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b font-medium text-sm">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            {invoice.items?.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 p-3 border-b text-sm">
                <div className="col-span-5">
                  <p className="font-medium">{item.productName}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-gray-500">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && ' • '}
                      {item.color && `Color: ${item.color}`}
                    </p>
                  )}
                </div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">
                  {formatCurrency(item.unitPrice)}
                </div>
                <div className="col-span-3 text-right font-medium">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.taxAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-lg">
                <span>Total Amount:</span>
                <span className="text-blue-600">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoice.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && invoice.status !== 'Paid' && (
            <Button variant="outline" onClick={() => onEdit(invoice)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Invoice
            </Button>
          )}
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Main Dashboard Component - FIXED: Proper conditional rendering
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // New data states for the 4 routes
  const [recentActivity, setRecentActivity] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [lowStockData, setLowStockData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(null);

  // Modal states - FIXED: Separate vendor/admin modals
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInvoiceEditModalOpen, setIsInvoiceEditModalOpen] = useState(false);
  const [isDeleteRequestModalOpen, setIsDeleteRequestModalOpen] = useState(false);
  const [isProductViewModalOpen, setIsProductViewModalOpen] = useState(false);
  const [isInvoiceViewModalOpen, setIsInvoiceViewModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState(null);

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load main dashboard data
      const dashboardResponse = await dashboardService.getDashboardData();
      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);

        if (user.isVendor) {
          setVendorData(dashboardResponse.data.vendor);
          setInvoices(dashboardResponse.data.recentInvoices || []);
        } else {
          setInvoices(dashboardResponse.data.recentInvoices || []);
        }
      }

      // Load additional dashboard data from the 4 new routes
      await loadAdditionalData();

    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAdditionalData = async () => {
    try {
      // Load recent activity
      const activityResponse = await dashboardService.getRecentActivity(10);
      if (activityResponse.success) {
        setRecentActivity(activityResponse.data);
      }

      // Load analytics data
      const analyticsResponse = await dashboardService.getSalesAnalytics('monthly');
      if (analyticsResponse.success) {
        setAnalyticsData(analyticsResponse.data);
      }

      // Load low stock alerts
      const lowStockResponse = await dashboardService.getLowStockAlerts();
      if (lowStockResponse.success) {
        setLowStockData(lowStockResponse.data);
      }

      // Load pending requests (admin only)
      if (!user.isVendor) {
        const pendingResponse = await dashboardService.getPendingRequests();
        if (pendingResponse.success) {
          setPendingRequests(pendingResponse.data);
        }
      }

    } catch (error) {
      console.error('Additional data load error:', error);
      // Don't show toast for these as they're secondary data
    }
  };

  const handleDeleteRequest = (product) => {
    setSelectedProduct(product);
    setIsDeleteRequestModalOpen(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsProductViewModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceViewModalOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoiceForEdit(invoice);
    setIsInvoiceEditModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadDashboardData(); // Refresh data after successful action
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please login to access dashboard</p>
      </div>
    );
  }

  // FIXED: Check user type properly
  const isVendor = user.isVendor;
  const isAdmin = !isVendor && (user.role === 'super_admin' || user.role === 'admin' || user.isAdmin);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - FIXED: Conditional buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isVendor ? 'Vendor Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user.firstName} {user.lastName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              {isVendor
                ? vendorData?.companyName || 'Vendor'
                : user.role === 'super_admin' ? 'Super Admin' : 'Admin'
              }
            </Badge>
            {/* FIXED: Only show admin buttons to admin */}
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsVendorModalOpen(true)} size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Create Vendor
                </Button>
                <Button variant="outline" onClick={() => setIsAllocationModalOpen(true)} size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  Allocate Products
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section - FIXED: Show correct stats */}
        {isVendor ? (
          <VendorStats
            vendorData={vendorData}
            stats={dashboardData?.stats}
          />
        ) : (
          <AdminStats stats={dashboardData?.stats} />
        )}

        {/* Tabs Content - FIXED: Conditional tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="management">Management</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed
                    activities={recentActivity}
                    onViewInvoice={handleViewInvoice}
                  />
                </CardContent>
              </Card>

              {/* Quick Stats & Alerts */}
              <div className="space-y-6">
                {/* Low Stock Alerts */}
                <LowStockAlerts
                  lowStockData={lowStockData}
                  user={user}
                  onViewProduct={handleViewProduct}
                />

                {/* Pending Requests (Admin only) */}
                {isAdmin && pendingRequests && pendingRequests.count > 0 && (
                  <PendingRequests
                    pendingRequests={pendingRequests}
                    user={user}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <AnalyticsCharts analyticsData={analyticsData} user={user} />
          </TabsContent>

          {/* Products Tab - FIXED: Show vendor products only to vendor */}
          <TabsContent value="products" className="space-y-6 mt-6">
            {isVendor ? (
              <VendorProducts
                products={vendorData?.products}
                onRequestDelete={handleDeleteRequest}
                onViewProduct={handleViewProduct}
                user={user}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LowStockAlerts
                  lowStockData={lowStockData}
                  user={user}
                  onViewProduct={handleViewProduct}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Product Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Product management for all vendors</p>
                      <p className="text-sm text-gray-400 mt-1">Use the management tab to allocate products</p>
                      {isAdmin && (
                        <Button
                          className="mt-4"
                          onClick={() => setIsAllocationModalOpen(true)}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Allocate Products
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6 mt-6">
            <InvoicesSection
              invoices={invoices}
              user={user}
              onCreateInvoice={handleCreateInvoice}
              onViewInvoice={handleViewInvoice}
              onEditInvoice={handleEditInvoice}
            />
          </TabsContent>

          {/* Management Tab (Admin only) */}
          {isAdmin && (
            <TabsContent value="management" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Manage all vendors, product allocations, and system requests from this centralized panel.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={() => setIsVendorModalOpen(true)}>
                          <Users className="w-4 h-4 mr-2" />
                          Manage Vendors
                        </Button>
                        <Button variant="outline" onClick={() => setIsAllocationModalOpen(true)}>
                          <Package className="w-4 h-4 mr-2" />
                          Product Allocation
                        </Button>
                        <Button variant="outline">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          View Delete Requests
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{dashboardData?.stats?.totalVendors || 0}</p>
                          <p className="text-sm text-gray-600">Total Vendors</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{dashboardData?.stats?.totalProducts || 0}</p>
                          <p className="text-sm text-gray-600">Total Products</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{pendingRequests?.count || 0}</p>
                          <p className="text-sm text-gray-600">Pending Requests</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{lowStockData?.count || 0}</p>
                          <p className="text-sm text-gray-600">Low Stock Items</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Detailed Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modals - FIXED: Only show admin modals to admin */}
      {isAdmin && (
        <>
          <Modal
            isOpen={isVendorModalOpen}
            onClose={() => setIsVendorModalOpen(false)}
            title="Create New Vendor"
            size="lg"
          >
            <VendorCreateForm
              onSuccess={() => {
                setIsVendorModalOpen(false);
                handleModalSuccess();
                toast.success('Vendor created successfully!');
              }}
            />
          </Modal>

          <Modal
            isOpen={isAllocationModalOpen}
            onClose={() => setIsAllocationModalOpen(false)}
            title="Allocate Products to Vendor"
            size="xl"
          >
            <ProductAllocationForm
              onSuccess={() => {
                setIsAllocationModalOpen(false);
                handleModalSuccess();
                toast.success('Products allocated successfully!');
              }}
            />
          </Modal>
        </>
      )}

      {/* Invoice Modal - Both admin and vendor can use */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create New Invoice"
        size="xl"
      >
        <InvoiceCreateForm
          onSuccess={() => {
            setIsInvoiceModalOpen(false);
            handleModalSuccess();
            toast.success('Invoice created successfully!');
          }}
        />
      </Modal>

      <Modal
        isOpen={isInvoiceEditModalOpen}
        onClose={() => {
          setIsInvoiceEditModalOpen(false);
          setSelectedInvoiceForEdit(null);
        }}
        title="Edit Invoice"
        size="xl"
      >
        <InvoiceCreateForm
          editData={selectedInvoiceForEdit}
          isEdit={true}
          onSuccess={() => {
            setIsInvoiceEditModalOpen(false);
            setSelectedInvoiceForEdit(null);
            handleModalSuccess();
            toast.success('Invoice updated successfully!');
          }}
          onCancel={() => {
            setIsInvoiceEditModalOpen(false);
            setSelectedInvoiceForEdit(null);
          }}
        />
      </Modal>

      {/* Product View Modal */}
      <ProductViewModal
        product={selectedProduct}
        isOpen={isProductViewModalOpen}
        onClose={() => {
          setIsProductViewModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* Invoice View Modal */}
      <InvoiceViewModal
        invoice={selectedInvoice}
        isOpen={isInvoiceViewModalOpen}
        onClose={() => {
          setIsInvoiceViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        onEdit={(invoice) => {
          setSelectedInvoiceForEdit(invoice);
          setIsInvoiceEditModalOpen(true);
          setIsInvoiceViewModalOpen(false);
        }}
        user={user}
      />

      {/* Delete Request Modal - Only for vendors */}
      {isVendor && (
        <Modal
          isOpen={isDeleteRequestModalOpen}
          onClose={() => {
            setIsDeleteRequestModalOpen(false);
            setSelectedProduct(null);
          }}
          title="Request Product Deletion"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedProduct?.product?.name}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="ml-2 font-medium">{selectedProduct?.currentStock}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sold Stock:</span>
                  <span className="ml-2 font-medium">{selectedProduct?.soldStock}</span>
                </div>
                {selectedProduct?.size && (
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="ml-2 font-medium">{selectedProduct.size}</span>
                  </div>
                )}
                {selectedProduct?.color && (
                  <div>
                    <span className="text-gray-600">Color:</span>
                    <span className="ml-2 font-medium">{selectedProduct.color}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion *
              </label>
              <textarea
                placeholder="Please provide a reason for requesting product deletion..."
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteRequestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    // Handle delete request submission
                    await vendorService.requestDelete(
                      vendorData._id,
                      selectedProduct.product._id,
                      "User requested deletion" // You can get this from textarea
                    );
                    setIsDeleteRequestModalOpen(false);
                    setSelectedProduct(null);
                    handleModalSuccess();
                    toast.success('Delete request submitted successfully!');
                  } catch (error) {
                    toast.error('Failed to submit delete request');
                  }
                }}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}