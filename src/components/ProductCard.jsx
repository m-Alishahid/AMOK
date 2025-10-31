"use client";
import Link from "next/link";
import Image from "next/image";
import { theme } from "@/lib/theme";
import { productService } from "@/services/productService";

export default function ProductCard({ product }) {
  const handleViewIncrement = async () => {
    try {
      await productService.incrementViews(product._id);
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  };

  const isDiscounted =
    product.discountedPrice && product.discountedPrice < product.salePrice;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group"
      onClick={handleViewIncrement}
    >
      <div
        className={`bg-[var(--text-white)] rounded-lg border border-[var(--text-lighter)] overflow-hidden
          transition-all duration-300 shadow-sm hover:shadow-md
          hover:border-[${theme.colors.primary}] cursor-pointer h-100 flex flex-col`}
      >
        {/* Product Image */}
        <div className="relative overflow-hidden bg-[var(--text-lighter)]" style={{ height: "16rem" }}>
          {product.thumbnail ? (
            <Image
              alt={product.name}
              src={product.thumbnail}
              fill
              sizes="(max-width: 1024px) 100vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-96 bg-[var(--text-lighter)]" />
          )}

          {/* Discount Badge */}
          {isDiscounted && (
            <div className="absolute top-3 left-3">
              <div className="bg-red-500 text-[var(--text-white)] px-2 py-1 rounded-full text-xs font-serif font-semibold tracking-wide flex items-center gap-1">
                <span>Sale</span>
                {product.discountPercentage > 0 && (
                  <span>{product.discountPercentage}% OFF</span>
                )}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="absolute top-3 right-3">
            {product.totalStock > 0 ? (
              <span className="bg-green-500 text-[var(--text-white)] px-2 py-1 rounded-full text-xs font-serif">
                In Stock
              </span>
            ) : (
              <span className="bg-red-500 text-[var(--text-white)] px-2 py-1 rounded-full text-xs font-serif">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3
            className="text-[var(--text-accent)]ase font-serif font-semibold mb-2 line-clamp-2 text-[var(--text-primary)] 
            group-hover:text-[#3b82f6] transition-colors duration-300 leading-tight"
          >
            {product.name}
          </h3>

          <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-1 font-serif leading-relaxed min-h-[20px]">
            {product.description}
          </p>

          {/* Price Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isDiscounted ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-bold text-[#3b82f6] font-serif"
                    >
                      PKR:{product.discountedPrice}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] line-through font-serif">
                      PKR:{product.salePrice}
                    </span>
                  </div>
                  {product.discountPercentage > 0 && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-serif">
                      Save {product.discountPercentage}%
                    </span>
                  )}
                </div>
              ) : (
                <span
                  className="text-lg font-bold text-[#3b82f6] font-serif"
                >
                  PKR:{product.salePrice}
                </span>
              )}
            </div>

            {product.sales > 0 && (
              <span className="text-xs text-[var(--text-muted)] font-serif">
                {product.sales} sold
              </span>
            )}
          </div>

          {/* Variants Info */}
          {(product.hasVariants || product.requiresSize || product.requiresColor) && (
            <div className="flex items-center gap-2 mb-3">
              {product.requiresSize && (
                <span className="text-xs text-[var(--text-muted)] bg-[var(--text-lighter)] px-2 py-1 rounded-full font-serif">
                  {product.variants?.length > 0
                    ? `${product.variants.length} sizes`
                    : "Multiple sizes"}
                </span>
              )}
              {product.requiresColor && (
                <span className="text-xs text-[var(--text-muted)] bg-[var(--text-lighter)] px-2 py-1 rounded-full font-serif">
                  {product.variants?.[0]?.colors?.length > 0
                    ? `${product.variants[0].colors.length} colors`
                    : "Multiple colors"}
                </span>
              )}
            </div>
          )}

          {/* View Details Button */}
          <button
            className="w-full bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white rounded-full py-2 font-serif font-semibold
              transition-all duration-300 transform group-hover:scale-[1.02]
              text-sm flex items-center justify-center gap-2"
          >
            <span>View Details</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
