"use client";

import '../globals.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
       setProducts(productsResponse.data?.products || []);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dummyData = {
    hero: {
      title: "Fashion Collection",
      subtitle: "Style your life",
      description: "Discover our curated collection of trendy clothing and accessories for every occasion."
    },
    categories: categories.map((category, index) => ({
      id: category._id || index + 1,
      name: category.name || 'Category',
      icon: "👕",
      count: products.filter(p => p.category === category._id).length,
      link: `/product?category=${category.name?.toLowerCase()}`
    })),
    products: products.map(product => ({
      id: product._id,
      name: product.name || 'Product Name',
      price: `$${product.salePrice || product.price || '0.00'}`,
      image: product.thumbnail || product.images?.[0] || "👕",
      rating: 4.5,
      reviews: 128,
      category: categories.find(c => c._id === product.category)?.name || 'General',
      description: product.description || 'Product description'
    }))
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{dummyData.hero.title}</h1>
            <p className="text-xl mb-4">{dummyData.hero.subtitle}</p>
            <p className="text-lg max-w-2xl mx-auto">{dummyData.hero.description}</p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {dummyData.categories.map(category => (
                <Link key={category.id} href={category.link} className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <p className="text-[var(--text-secondary)]">{category.count} items</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Products Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Trending Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {dummyData.products.slice(0, 4).map(product => (
                <div key={`trending-${product.id}`} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 h-70 flex flex-col">
                  <div className="h-20 flex items-center justify-center mb-4">
                    {product.image.startsWith('http') ? (
                      <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded" />
                    ) : (
                      <div className="text-8xl">{product.image}</div>
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      🔥 Trending
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-[var(--text-secondary)] mb-4 flex-grow line-clamp-1">{product.description}</p>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-[var(--text-secondary)]">({product.reviews})</span>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-2xl font-bold text-green-600">{product.price}</span>
                    <Link href={`/product/${product.id}`} className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded hover:bg-[var(--primary-blue-hover)] transition duration-300">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">All Products</h2>
              <div className="flex items-center space-x-4">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {dummyData.products.map(product => (
                <div key={product.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 h-70 flex flex-col">
                  <div className="h-24 flex items-center justify-center mb-4">
                    {product.image.startsWith('http') ? (
                      <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded" />
                    ) : (
                      <div className="text-8xl">{product.image}</div>
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-[var(--text-secondary)] mb-4 flex-grow line-clamp-3">{product.description}</p>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-[var(--text-secondary)]">({product.reviews})</span>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-2xl font-bold text-white">{product.price}</span>
                    <Link href={`/product/${product.id}`} className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded hover:bg-[var(--primary-blue-hover)] transition duration-300">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
