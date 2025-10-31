"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Image from 'next/image'
import { productService } from "@/services/productService";

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId;
  const categorySlug = params.categorySlug;

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    sort: 'createdAt',
    order: 'desc',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 12
  });

  const fetchCategoryProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getByCategory(categoryId || categorySlug, filters);

      if (response.success) {
        setProducts(response.data.products);
        setCategory(response.data.category);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching category products:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, categorySlug, filters]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 })
    }));
  };

  const handlePageChange = (newPage) => {
    handleFilterChange('page', newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      sort: 'createdAt',
      order: 'desc',
      minPrice: '',
      maxPrice: '',
      page: 1,
      limit: 12
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cda434] mx-auto mb-4"></div>
              <p className="text-gray-600 font-serif text-lg">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6 font-serif">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="bg-[#cda434] text-white px-6 py-3 rounded-sm hover:bg-[#b8932a] transition duration-300 font-serif font-semibold"
                >
                  Back to Home
                </button>
                <button
                  onClick={fetchCategoryProducts}
                  className="bg-gray-800 text-white px-6 py-3 rounded-sm hover:bg-gray-700 transition duration-300 font-serif"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center text-sm font-serif">
            <Link href="/" className="text-gray-600 hover:text-[#cda434] transition-colors duration-300">
              Home
            </Link>
            <span className="mx-3 text-gray-400">›</span>
            <span className="text-[#cda434] font-semibold capitalize">{category?.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            {category?.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-serif leading-relaxed">
            Discover our exquisite collection of {category?.name.toLowerCase()} clothing and accessories,
            crafted with premium quality and elegant designs.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 font-serif">
            <span>{pagination.totalProducts} products</span>
            <span>•</span>
            <span>Premium quality</span>
            <span>•</span>
            <span>Free shipping over £100</span>
          </div>
        </div>
      </section>

      {/* Filters and Sorting Bar */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Left Side - Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 font-serif whitespace-nowrap">Sort by:</label>
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    handleFilterChange('sort', sort);
                    handleFilterChange('order', order);
                  }}
                  className="border border-gray-300 rounded-sm px-4 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-[#cda434] focus:border-[#cda434] transition-colors bg-white min-w-[160px]"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="salePrice-asc">Price: Low to High</option>
                  <option value="salePrice-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 font-serif whitespace-nowrap">Price:</label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-sm p-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="border-0 bg-transparent px-3 py-1 text-sm w-20 font-serif focus:outline-none focus:ring-1 focus:ring-[#cda434] rounded"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="border-0 bg-transparent px-3 py-1 text-sm w-20 font-serif focus:outline-none focus:ring-1 focus:ring-[#cda434] rounded"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {(filters.minPrice || filters.maxPrice || filters.sort !== 'createdAt' || filters.order !== 'desc') && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#cda434] hover:text-[#b8932a] font-serif font-medium transition-colors underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Right Side - Results Count */}
            <div className="text-sm text-gray-600 font-serif bg-gray-50 px-3 py-2 rounded-sm">
              Showing <span className="font-semibold">{products.length}</span> of{" "}
              <span className="font-semibold">{pagination.totalProducts}</span> products
              {pagination.currentPage && (
                <span> • Page <span className="font-semibold">{pagination.currentPage}</span> of{" "}
                  <span className="font-semibold">{pagination.totalPages}</span></span>
              )}
            </div>
          </div>
        </div>
      </section>
<main className="container mx-auto px-4 py-8 md:py-12">
  {products.length === 0 ? (
    <div className="text-center py-16 md:py-24">
      <div className="max-w-md mx-auto">
        <div className="text-8xl mb-6">👗</div>
        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4">
          No products found
        </h3>
        <p className="text-gray-600 mb-8 font-serif leading-relaxed">
          We couldn&apos;t find any products in this category matching your filters.
          Try adjusting your search criteria or browse other categories.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={clearFilters}
            className="border border-[#d4b26e] rounded-full px-6 py-3 flex items-center gap-2 hover:bg-[#f8f4eb] transition-colors font-serif text-[#d4b26e] hover:text-[#b8932a]"
          >
            Clear All Filters
          </button>
          <Link
            href="/"
            className="bg-[#d4b26e] text-white rounded-full px-6 py-3 hover:bg-[#b8932a] transition duration-300 font-serif text-center flex items-center justify-center gap-2"
          >
            Browse All Categories
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <>
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/product/${product._id}`}
            className="group"
            onClick={async () => {
              try {
                await productService.incrementViews(product._id);
              } catch (error) {
                console.error('Failed to increment view count:', error);
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100 hover:border-[#d4b26e]">
              {/* Image Container - FIXED */}
                  <div className="relative overflow-hidden bg-gray-50" style={{height: '16rem'}}>
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
                      <div className="w-full h-64 bg-gray-100" />
                    )}
                
                {/* Discount Badge */}
                {product.discountedPrice && product.discountedPrice < product.salePrice && (
                  <div className="absolute top-3 left-3">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-serif font-semibold tracking-wide flex items-center gap-1">
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
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-serif">
                      In Stock
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-serif">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* View Count */}
                {/* <div className="absolute bottom-3 left-3">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs font-serif">
                    👁️ {product.views || 0} views
                  </span>
                </div> */}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-base font-serif font-semibold mb-2 line-clamp-2 text-gray-900 group-hover:text-[#d4b26e] transition-colors duration-300 leading-tight">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 font-serif leading-relaxed min-h-[40px]">
                  {product.description}
                </p>

                {/* Price Section */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {product.discountedPrice && product.discountedPrice < product.salePrice ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#d4b26e] font-serif">
                            PKR:{product.discountedPrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through font-serif">
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
                      <span className="text-lg font-bold text-[#d4b26e] font-serif">
                        PKR:{product.salePrice}
                      </span>
                    )}
                  </div>

                  {/* Sales Count */}
                  {product.sales > 0 && (
                    <span className="text-xs text-gray-500 font-serif">
                      {product.sales} sold
                    </span>
                  )}
                </div>

                {/* Variants Info */}
                {(product.hasVariants || product.requiresSize || product.requiresColor) && (
                  <div className="flex items-center gap-2 mb-3">
                    {product.requiresSize && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-serif">
                        {product.variants?.length > 0 ? `${product.variants.length} sizes` : 'Multiple sizes'}
                      </span>
                    )}
                    {product.requiresColor && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-serif">
                        {product.variants?.[0]?.colors?.length > 0 ? `${product.variants[0].colors.length} colors` : 'Multiple colors'}
                      </span>
                    )}
                  </div>
                )}

                {/* View Details Button */}
                <button className="w-full border border-[#d4b26e] text-[#d4b26e] rounded-full py-2 font-serif font-semibold hover:bg-[#f8f4eb] transition-all duration-300 transform group-hover:scale-[1.02] text-sm flex items-center justify-center gap-2">
                  <span>View Details</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-16 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-600 font-serif">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className={`border border-[#d4b26e] rounded-full px-4 py-2 font-serif text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                pagination.hasPrev
                  ? 'text-[#d4b26e] hover:bg-[#f8f4eb] hover:border-[#b8932a] hover:text-[#b8932a]'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-full font-serif text-sm font-semibold transition-all duration-300 ${
                      pageNum === pagination.currentPage
                        ? 'bg-[#d4b26e] text-white shadow-lg'
                        : 'border border-[#d4b26e] text-[#d4b26e] hover:bg-[#f8f4eb]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className={`border border-[#d4b26e] rounded-full px-4 py-2 font-serif text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                pagination.hasNext
                  ? 'text-[#d4b26e] hover:bg-[#f8f4eb] hover:border-[#b8932a] hover:text-[#b8932a]'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-sm text-gray-500 font-serif">
            {pagination.totalProducts} total products
          </div>
        </div>
      )}
    </>
  )}
</main>

      {/* Back to Home */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#cda434] font-serif font-semibold transition-colors duration-300 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
            Back to All Categories
          </Link>
        </div>
      </section>
    </div>
  );
}









