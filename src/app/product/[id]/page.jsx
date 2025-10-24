"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { productService } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          initializeVariants(data.data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const initializeVariants = (productData) => {
    if (productData.variants && productData.variants.length > 0) {
      // Extract unique sizes
      const sizes = [...new Set(productData.variants.map(v => v.size))].filter(Boolean);
      setAvailableSizes(sizes);

      // Set first size as default
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
        updateColorsForSize(productData.variants, sizes[0]);
      }
    }
  };

  const updateColorsForSize = (variants, size) => {
    const sizeVariant = variants.find(v => v.size === size);
    if (sizeVariant && sizeVariant.colors) {
      const colors = sizeVariant.colors.map(color => ({
        name: color.color,
        stock: color.stock,
        inStock: color.stock > 0
      }));
      setAvailableColors(colors);

      // Set first available color as default
      const firstAvailableColor = colors.find(c => c.inStock) || colors[0];
      if (firstAvailableColor) {
        setSelectedColor(firstAvailableColor.name);
      }
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    updateColorsForSize(product.variants, size);
    setSelectedColor(""); // Reset color when size changes
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const getCurrentStock = () => {
    if (!selectedSize || !selectedColor) return 0;

    const variant = product.variants.find(v => v.size === selectedSize);
    if (variant && variant.colors) {
      const colorVariant = variant.colors.find(c => c.color === selectedColor);
      return colorVariant ? colorVariant.stock : 0;
    }
    return 0;
  };

  const handleAddToWishlist = () => {
    if (isInWishlist(product._id)) {
      toast.info('Product is already in your wishlist!');
      return;
    }

    const wishlistItem = {
      productId: product._id,
      name: product.name,
      price: product.discountedPrice || product.salePrice,
      image: product.thumbnail,
      category: product.category?.name,
      size: selectedSize,
      color: selectedColor,
      stock: getCurrentStock(),
      description: product.description,
      variants: product.variants
    };

    addToWishlist(wishlistItem);
    toast.success('Added to wishlist!');
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.requiresSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor && product.requiresColor) {
      toast.error('Please select a color');
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.discountedPrice || product.salePrice,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.thumbnail,
      stock: getCurrentStock()
    };

    addToCart(cartItem);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.requiresSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor && product.requiresColor) {
      toast.error('Please select a color');
      return;
    }

    // Add to cart first, then redirect to checkout
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.discountedPrice || product.salePrice,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.thumbnail,
      stock: getCurrentStock()
    };

    addToCart(cartItem);
    toast.success('Proceeding to checkout...');
    // TODO: Redirect to checkout page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b26e]"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 font-serif">Product not found.</p>
        </div>
      </div>
    );
  }

  const currentStock = getCurrentStock();
  const displayPrice = product.discountedPrice || product.salePrice;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.salePrice;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center text-sm font-serif">
            <a href="/" className="text-gray-600 hover:text-[#d4b26e] transition-colors">Home</a>
            <span className="mx-3 text-gray-400">›</span>
            <a href={`/category/${product.category?._id}`} className="text-gray-600 hover:text-[#d4b26e] transition-colors capitalize">
              {product.category?.name}
            </a>
            <span className="mx-3 text-gray-400">›</span>
            <span className="text-[#d4b26e] font-semibold capitalize">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={product.images ? product.images[selectedImage] : product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-[#d4b26e]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 font-serif">{product.name}</h1>

              {/* Views Count */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500 font-serif">👁️ {product.views || 0} views</span>
                {product.sales > 0 && (
                  <span className="text-sm text-gray-500 font-serif">• {product.sales} sold</span>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#d4b26e] font-serif">${displayPrice}</span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through font-serif">${product.salePrice}</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold font-serif">
                    -{product.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-600 mb-4 font-serif leading-relaxed">{product.description}</p>
            </div>

            {/* Variants Selection */}
            <div className="space-y-6">
              {/* Size Selection */}
              {product.requiresSize && availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 font-serif">
                    Size: {selectedSize && <span className="font-semibold text-[#d4b26e]">{selectedSize}</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const sizeVariant = product.variants.find(v => v.size === size);
                      const hasStock = sizeVariant && sizeVariant.colors.some(c => c.stock > 0);

                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          disabled={!hasStock}
                          className={`px-4 py-2 rounded-full border-2 font-serif text-sm font-semibold transition-all ${
                            selectedSize === size
                              ? 'border-[#d4b26e] bg-[#d4b26e] text-white'
                              : hasStock
                              ? 'border-gray-300 text-gray-700 hover:border-[#d4b26e] hover:text-[#d4b26e]'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed line-through'
                          }`}
                        >
                          {size}
                          {!hasStock && " (Out of Stock)"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.requiresColor && availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 font-serif">
                    Color: {selectedColor && <span className="font-semibold text-[#d4b26e]">{selectedColor}</span>}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorSelect(color.name)}
                        disabled={!color.inStock}
                        className={`px-4 py-2 rounded-full border-2 font-serif text-sm font-semibold transition-all ${
                          selectedColor === color.name
                            ? 'border-[#d4b26e] bg-[#d4b26e] text-white'
                            : color.inStock
                            ? 'border-gray-300 text-gray-700 hover:border-[#d4b26e] hover:text-[#d4b26e]'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed line-through'
                        }`}
                      >
                        {color.name}
                        {!color.inStock && " (Out of Stock)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-semibold text-gray-700">Available Stock:</span>
                  <span className={`font-serif font-semibold ${
                    currentStock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {/* {currentStock > 0 ? `${currentStock} items in stock` : 'Out of Stock'} */}
                  </span>
                </div>
                {selectedSize && selectedColor && currentStock > 0 && currentStock < 10 && (
                  <p className="text-sm text-orange-600 mt-2 font-serif">
                    Only {currentStock} left in stock - order soon!
                  </p>
                )}
              </div>

              {/* Quantity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-[#d4b26e] text-[#d4b26e] flex items-center justify-center hover:bg-[#f8f4eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-serif font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-serif font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="w-10 h-10 rounded-full border border-[#d4b26e] text-[#d4b26e] flex items-center justify-center hover:bg-[#f8f4eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-serif font-bold"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 font-serif ml-2">
                    Max: {currentStock}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleAddToWishlist}
                  className={`flex-1 border rounded-full py-3 font-serif font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isInWishlist(product._id)
                      ? 'border-blue-800 text-white bg-blue-800 hover:bg-blue-900'
                      : 'border-blue-800 text-blue-800 hover:bg-blue-50'
                  }`}
                >
                  <span>❤️</span>
                  {isInWishlist(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || (product.requiresSize && !selectedSize) || (product.requiresColor && !selectedColor)}
                  className="flex-1 border border-blue-800 bg-blue-800 text-white rounded-full py-3 font-serif font-semibold hover:bg-blue-900 hover:border-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>🛒</span>
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={currentStock === 0 || (product.requiresSize && !selectedSize) || (product.requiresColor && !selectedColor)}
                  className="flex-1 border border-gray-800 bg-gray-800 text-white rounded-full py-3 font-serif font-semibold hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>⚡</span>
                  Buy Now
                </button>
              </div>
            </div>

            {/* Product Information */}
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 font-serif">Category:</span>
                  <span className="text-gray-600 font-serif capitalize">{product.category?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
