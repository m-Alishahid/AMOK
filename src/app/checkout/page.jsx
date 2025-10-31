"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { orderService } from "../../services/orderService";

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    country: "Pakistan"
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });

  const [showModal, setShowModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : [];
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || nameParts[0] || '',
        lastName: user.lastName || nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate unique order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // For guest users, create a user account from customer information
      let userId = null;
      if (!isAuthenticated) {
        // Create guest user ID from email and phone
        userId = `GUEST-${formData.email}-${formData.phone}`.replace(/[^a-zA-Z0-9-_]/g, '-');

        // Store guest user info for future reference
        const guestUsers = JSON.parse(localStorage.getItem('guestUsers') || '[]');
        const existingGuestUser = guestUsers.find(user => user.userId === userId);

        if (!existingGuestUser) {
          const guestUserData = {
            userId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postcode: formData.postcode,
            country: formData.country,
            roleType: 'customer',
            createdAt: new Date().toISOString(),
            orders: [orderId]
          };
          guestUsers.push(guestUserData);
          localStorage.setItem('guestUsers', JSON.stringify(guestUsers));
        } else {
          // Add order to existing guest user
          existingGuestUser.orders = existingGuestUser.orders || [];
          if (!existingGuestUser.orders.includes(orderId)) {
            existingGuestUser.orders.push(orderId);
          }
          localStorage.setItem('guestUsers', JSON.stringify(guestUsers));
        }

        // Store userId in session for tracking
        sessionStorage.setItem('guestUserId', userId);
      }

      // Create order object for API
      const orderData = {
        orderNumber: orderId, // Use orderId as orderNumber for MongoDB
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: cartItems.map(item => ({
          product: item.productId,
          variant: {
            size: item.size || 'Standard',
            color: item.color || 'Standard'
          },
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          productSnapshot: {
            name: item.name,
            thumbnail: item.image
          }
        })),
        pricing: {
          subtotal: subtotal,
          shipping: shipping,
          tax: tax,
          discount: 0,
          grandTotal: total,
          currency: 'PKR'
        },
        shippingAddress: {
          fullName: isAuthenticated && user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          email: formData.email,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.city, // Using city as state for simplicity
          pincode: formData.postcode,
          country: formData.country
        },
        billingAddress: {
          fullName: isAuthenticated && user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          email: formData.email,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.city,
          pincode: formData.postcode,
          country: formData.country
        },
        payment: {
          method: paymentMethod,
          amount: total,
          currency: 'PKR'
        },
        shipping: {
          cost: shipping
        },
        status: 'confirmed',
        isGuestOrder: !isAuthenticated
      };

      // Save order to MongoDB via API
      console.log('Sending order data:', orderData);
      const response = await orderService.create(orderData);
      console.log('Order creation response:', response);

      // Set order data for modal
      setOrderData({
        ...response.order,
        orderId: orderId,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        paymentMethod: paymentMethod,
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode,
          country: formData.country
        },
        items: cartItems
      });

      // Clear the cart
      clearCart();

      // Show confirmation modal
      setShowModal(true);
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to place order: ${error.response?.data?.error || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Billing & Shipping */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isAuthenticated ? (
                  // For logged-in users: only email and phone
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      />
                    </div>
                  </>
                ) : (
                  // For guest users: full billing information
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Street address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="UK">United Kingdom</option>
                    <option value="USA">United States</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Payment Method</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2 text-[#cda434] focus:ring-[#cda434]"
                    />
                    <span className="text-foreground">Cash on Delivery (COD)</span>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Pay when your order is delivered to your doorstep.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center space-x-4">
                    <img
                      src={item.image || "/placeholder-product.jpg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      {item.size && item.color && (
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size}, Color: {item.color}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="font-semibold text-foreground">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="w-6 h-6 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center text-sm font-medium"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="w-6 h-6 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center text-sm font-medium"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-xs text-destructive hover:text-destructive underline ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-foreground border-t pt-2">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-primary-blue-hover text-primary-foreground py-4 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            {/* Terms and Conditions */}
            <div className="text-sm text-muted-foreground text-center">
              <p>By placing your order, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</p>
            </div>

            {/* Order Tracking Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Already have an order? <a href="/order-tracking" className="text-primary hover:underline font-semibold">Track your order here</a>
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Order Confirmation Modal */}
      {showModal && orderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
              </div>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-semibold text-gray-900">{orderData.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-semibold text-gray-900 capitalize">{orderData.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold text-orange-300 capitalize">pending</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-900">
                      <p className="font-semibold">
                        {orderData.customerInfo.firstName} {orderData.customerInfo.lastName}
                      </p>
                      <p>{orderData.customerInfo.address}</p>
                      <p>{orderData.customerInfo.city}, {orderData.customerInfo.postcode}</p>
                      <p>{orderData.customerInfo.country}</p>
                      <p className="mt-2">{orderData.customerInfo.phone}</p>
                      <p>{orderData.customerInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center space-x-3 border-b pb-3">
                      <img
                        src={item.image || "/placeholder-product.jpg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.size && item.color && (
                          <p className="text-xs text-gray-500">
                            Size: {item.size}, Color: {item.color}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t pt-4 mt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>Rs. {orderData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{orderData.shipping === 0 ? 'Free' : `Rs. ${orderData.shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>Rs. {orderData.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                      <span>Total</span>
                      <span>Rs. {orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    router.push('/');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    router.push('/order-tracking');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Track Order
                </button>
              </div>

              {/* Order Tracking Info */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  You can track your order status using the Order ID: <strong className="text-gray-900">{orderData.orderId}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  We'll send you email updates about your order status. For COD orders, our delivery partner will contact you before delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
