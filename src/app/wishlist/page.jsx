"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, getWishlistCount } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (item) => {
    // Check if item is already in cart and would exceed stock limit
    const existingCartItem = cartItems.find(cartItem =>
      cartItem.productId === item.productId &&
      cartItem.size === item.size &&
      cartItem.color === item.color
    );

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + 1;
      if (newQuantity > (item.stock || 10)) {
        toast.error(`Cannot add more than ${item.stock || 10} items to cart`);
        return;
      }
    }

    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      size: item.size || null,
      color: item.color || null,
      quantity: 1,
      stock: item.stock || 10
    });
    toast.success(`${item.name} added to cart!`);
    // Navigate to cart page
    window.location.href = '/cart';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)]"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2 font-serif">Your wishlist is empty</h1>
            <p className="text-gray-600 mb-8 font-serif">Save items you love for later!</p>
            <Link
              href="/"
              className="inline-block bg-[var(--primary-blue)] text-white px-8 py-3 rounded-full font-serif font-semibold hover:bg-[var(--primary-blue-hover)] transition-colors"
            >
              Start Shopping
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 font-serif">
            My Wishlist ({getWishlistCount()} items)
          </h1>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-2 mb-4">
          {wishlistItems.map((item, index) => {
            const itemId = `${item.productId}-${index}`;

            return (
              <div key={itemId} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder-product.jpg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>

                    {/* Product Content */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`} className="block">
                        <h3 className="font-medium text-gray-800 hover:text-[var(--primary-blue)] transition-colors text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Variants */}
                      <div className="mb-2">
                        <span className="text-xs text-gray-600">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' '}
                          {item.color && `Color: ${item.color}`}
                        </span>
                      </div>

                      {/* Category */}
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">
                          Category: {item.category || 'N/A'}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromWishlist(item.productId)}
                          className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-xs"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-800 font-serif">
                          PKR {item.price}
                        </p>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center gap-1 bg-[var(--primary-blue)] text-white px-3 py-1 rounded-full font-serif font-semibold hover:bg-[var(--primary-blue-hover)] transition-colors text-xs"
                      >
                        <ShoppingCart size={12} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping Button */}
        <div className="text-center mt-12">
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
