"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import { productService } from "@/services/productService";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Search products by name and description
        const response = await productService.getAll();
        const allProducts = response.data || response || [];

        // Filter products based on search query
        const searchResults = allProducts.filter(product =>
          product.name?.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.name?.toLowerCase().includes(query.toLowerCase())
        );

        setProducts(searchResults);
        setFilteredProducts(searchResults);

        // Extract unique categories from search results
        const uniqueCategories = [...new Set(searchResults.map(p => p.category?.name).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category?.name === selectedCategory);
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('relevance');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cda434]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Search size={24} className="text-[#d4b26e]" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 font-serif">
              Search Results
            </h1>
          </div>

          {query && (
            <p className="text-gray-600 font-serif">
              Showing results for "<span className="font-semibold text-[#d4b26e]">{query}</span>"
              {filteredProducts.length !== products.length && (
                <span className="ml-2 text-sm">
                  ({filteredProducts.length} of {products.length} products)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={20} className="text-[#d4b26e]" />
                <h2 className="text-lg font-semibold text-gray-800 font-serif">Filters</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4b26e] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4b26e] focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4b26e] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4b26e] focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors font-serif font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2 font-serif">
                  {query ? 'No products found' : 'Start searching'}
                </h2>
                <p className="text-gray-600 font-serif mb-6">
                  {query
                    ? `We couldn't find any products matching "${query}". Try adjusting your search or filters.`
                    : 'Enter a search term to find products.'
                  }
                </p>
                <Link
                  href="/"
                  className="inline-block bg-[#d4b26e] text-white px-6 py-3 rounded-full font-serif font-semibold hover:bg-[#b8932a] transition-colors"
                >
                  Browse All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product._id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <Image
                        src={product.images?.[0] || "/placeholder-product.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 group-hover:text-[#d4b26e] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 capitalize">
                        {product.category?.name || 'Uncategorized'}
                      </p>
                      <p className="text-lg font-bold text-gray-800 font-serif">
                        PKR {product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cda434]"></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
