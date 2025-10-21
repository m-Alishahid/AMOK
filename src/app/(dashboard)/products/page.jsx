"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from '@/services/productService';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: 'asc',
        search: searchTerm
      });

      if (response.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleDelete = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await productService.delete(productId);
        if (response.success) {
          alert("Product deleted successfully!");
          fetchProducts();
        }
      } catch (error) {
        alert("Failed to delete product.");
        console.error("Delete error:", error);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Manage your product inventory and listings</p>
        </div>
        <Link
          href="/products/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:py-3 px-4 md:px-6 rounded-lg shadow-md transition duration-200 flex items-center gap-2 text-sm md:text-base"
        >
          <span>+</span>
          Add New Product
        </Link>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm md:text-base"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg transition duration-200 text-sm md:text-base"
              >
                Search
              </button>
            </form>
          </div>

          {/* Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm md:text-base w-full sm:w-auto"
            >
              <option value="name">Name A-Z</option>
              <option value="-name">Name Z-A</option>
              <option value="createdAt">Newest First</option>
              <option value="-createdAt">Oldest First</option>
              <option value="salePrice">Price: Low to High</option>
              <option value="-salePrice">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                  Stock
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                        <img
                          className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-cover"
                          src={product.thumbnail || '/placeholder-image.jpg'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          ID: {product._id?.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-900">{product.category?.name}</div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${product.salePrice?.toFixed(2)}
                    </div>
                    {product.discountedPrice > 0 && (
                      <div className="text-sm text-green-600">
                        ${product.discountedPrice?.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {product.totalStock || 0}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'Draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                      <Link
                        href={`/products/${product._id}/view`}
                        className="text-blue-600 hover:text-blue-800 font-medium transition duration-200 text-xs md:text-sm"
                      >
                        View
                      </Link>
                      <Link
                        href={`/products/${product._id}/edit`}
                        className="text-green-600 hover:text-green-800 font-medium transition duration-200 text-xs md:text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800 font-medium transition duration-200 text-xs md:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 md:py-12 px-4">
            <div className="text-gray-400 text-4xl md:text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-base md:text-lg">No products found</p>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first product"}
            </p>
            {!searchTerm && (
              <Link
                href="/products/add"
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 md:px-6 rounded-lg transition duration-200 text-sm md:text-base"
              >
                Add Your First Product
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
