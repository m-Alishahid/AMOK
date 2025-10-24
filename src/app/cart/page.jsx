"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, Heart, Copy } from "lucide-react";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => `${item.productId}-${item.size}-${item.color}`)));
    }
  };

  const selectedTotal = cartItems
    .filter(item => selectedItems.has(`${item.productId}-${item.size}-${item.color}`))
    .reduce((total, item) => total + (item.price * item.quantity), 0);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)]"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2 font-serif">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 font-serif">Add some products to get started!</p>
            <Link
              href="/"
              className="inline-block bg-[var(--primary-blue)] text-white px-8 py-3 rounded-full font-serif font-semibold hover:bg-[var(--primary-blue-hover)] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg p-3 mb-3 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[var(--primary-blue)] border-gray-300 rounded focus:ring-[var(--primary-blue)]"
                />
                <span className="text-sm font-medium text-gray-700">Select All ({cartItems.length})</span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Selected: {selectedItems.size} items</span>
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 font-serif font-medium text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-2 mb-4">
          {cartItems.map((item, index) => {
            const itemId = `${item.productId}-${item.size}-${item.color}`;
            const isSelected = selectedItems.has(itemId);

            return (
              <div key={itemId} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <label className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(itemId)}
                        className="w-4 h-4 text-[var(--primary-blue)] border-gray-300 rounded focus:ring-[var(--primary-blue)]"
                      />
                    </label>

                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 ">
                      <Image
                        src={item.image || "/placeholder-product.jpg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Content */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`} className="block">
                        <h3 className="font-medium text-gray-800 hover:text-[var(--primary-blue)] transition-colors text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                        {item.category}
                      </p>

                      {/* Variants */}
                      <div className="mb-2">
                        <span className="text-xs text-gray-600">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' '}
                          {item.color && `Color: ${item.color}`}
                        </span>
                      </div>

                      {/* Operations */}
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-xs">
                          <Heart size={12} />
                          <span>Wishlist</span>
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-xs"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 text-xs">
                          <Copy size={12} />
                          <span>Similar</span>
                        </button>
                      </div>
                    </div>

                    {/* Price and Quantity - Mobile Stack */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-800 font-serif">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.originalPrice && (
                          <p className="text-xs text-gray-500 line-through">
                            Rs. {(item.originalPrice * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="p-1 hover:bg-gray-50 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 py-1 font-serif font-semibold text-sm min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="p-1 hover:bg-gray-50 disabled:opacity-50"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Max: {item.stock}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 font-serif">Order Summary</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({getCartItemCount()} items)</span>
              <span className="font-semibold">Rs. {getCartTotal().toFixed(2)}</span>
            </div>

            {selectedItems.size > 0 && (
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="text-gray-600">Selected Items ({selectedItems.size})</span>
                <span className="font-semibold text-[var(--primary-blue)]">Rs. {selectedTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">Rs. 0.00</span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-[var(--primary-blue)]">Rs. {getCartTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/checkout"
              className="flex-1 bg-[var(--primary-blue)] text-white py-3 px-6 rounded-lg font-serif font-semibold hover:bg-[var(--primary-blue-hover)] transition-colors text-center"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="flex-1 border border-[var(--primary-blue)] text-[var(--primary-blue)] py-3 px-6 rounded-lg font-serif font-semibold hover:bg-[#f8f4eb] transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
