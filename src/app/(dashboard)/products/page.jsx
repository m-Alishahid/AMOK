"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from '@/services/productService';
import DataTable from '@/components/DataTable';
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll({
        limit: 1000 // Get all products for client-side filtering
      });

      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await productService.delete(product._id);
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

  // Define table columns
  const columns = [
    {
      key: "thumbnail",
      label: "Image",
      render: (value) => (
        <img
          src={value || '/placeholder-image.jpg'}
          alt="Product"
          className="w-10 h-10 rounded-lg object-cover"
        />
      ),
    },
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (value, product) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">ID: {product._id?.substring(0, 8)}...</div>
        </div>
      ),
    },
    {
      key: "category.name",
      label: "Category",
      sortable: true,
    },
    {
      key: "salePrice",
      label: "Price",
      sortable: true,
      render: (value, product) => (
        <div>
          <div className="font-medium text-gray-900">${value?.toFixed(2)}</div>
          {product.discountedPrice > 0 && (
            <div className="text-sm text-green-600">
              ${product.discountedPrice?.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "totalStock",
      label: "Stock",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <Badge
          variant={
            value === 'Active' ? 'default' :
            value === 'Draft' ? 'secondary' :
            'destructive'
          }
        >
          {value}
        </Badge>
      ),
    },
  ];

  // Define table actions
  const actions = [
    {
      label: "View",
      icon: Eye,
      variant: "secondary",
      onClick: (product) => {
        window.open(`/products/${product._id}/view`, '_blank');
      },
    },
    {
      label: "Edit",
      icon: Edit,
      variant: "secondary",
      onClick: (product) => {
        window.location.href = `/products/${product._id}/edit`;
      },
    },
    {
      label: "Delete",
      icon: Trash2,
      variant: "secondary",
      onClick: handleDelete,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-0 sm:px-0">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-1">
          <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your product inventory and listings</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6">
          {/* Add Product Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900">All Products</h2>
            <Link
              href="/products/add"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-200 flex items-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
          </div>

          {/* Products Table */}
          <DataTable
            columns={columns}
            data={products}
            actions={actions}
            searchable={true}
            paginated={true}
            pageSize={10}
            loading={loading}
            emptyMessage="No products found. Get started by adding your first product."
            searchPlaceholder="Search products by name, category..."
            responsiveView={true}
            mobileCard={(product) => (
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={product.thumbnail || '/placeholder-image.jpg'}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 truncate">ID: {product._id?.substring(0, 8)}...</p>
                    <p className="text-xs text-gray-600 truncate mt-1">{product.category?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-semibold text-gray-900">${product.salePrice?.toFixed(2)}</p>
                    {product.discountedPrice > 0 && (
                      <p className="text-green-600">${product.discountedPrice?.toFixed(2)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600">Stock</p>
                    <p className="font-semibold text-gray-900">{product.totalStock}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Badge className={`text-xs mt-1 ${
                      product.status === 'Active' ? 'bg-green-100 text-green-800' :
                      product.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => window.open(`/products/${product._id}/view`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors touch-manipulation"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => window.location.href = `/products/${product._id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 active:bg-amber-100 rounded-lg transition-colors touch-manipulation"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors touch-manipulation"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
