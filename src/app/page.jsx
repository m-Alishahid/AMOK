"use client";

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getAll({ limit: 4 }),
          categoryService.getAll()
        ]);
        setTrendingProducts(productsResponse.data?.products || []);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-gray-800">FashionHub</div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-800">Home</Link>
              <Link href="/product" className="text-gray-600 hover:text-gray-800">Shop</Link>
              <Link href="/women" className="text-gray-600 hover:text-gray-800">Women</Link>
              <Link href="/men" className="text-gray-600 hover:text-gray-800">Men</Link>
              <Link href="/kids" className="text-gray-600 hover:text-gray-800">Kids</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-800">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-800">Contact</Link>
            </nav>
            <div className="flex space-x-4">
              <button className="text-gray-600 hover:text-gray-800">🔍</button>
              <button className="text-gray-600 hover:text-gray-800">🛒</button>
              <button className="text-gray-600 hover:text-gray-800">👤</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Fashion Forward
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover the latest trends in clothing and accessories. Style your life with our curated collection.
            </p>
            <Link href="/product" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300">
              Shop Collection
            </Link>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">Our Story</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              At FashionHub, we believe fashion is more than just clothing—it's a way to express yourself and feel confident in your own skin. Our carefully curated collection brings together the latest trends with timeless pieces that you'll love wearing season after season.
            </p>
          </div>
        </section>

        {/* Shop by Category */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-6xl mb-4">👩</div>
                <h3 className="text-xl font-semibold text-gray-800">Women</h3>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">👨</div>
                <h3 className="text-xl font-semibold text-gray-800">Men</h3>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">👶</div>
                <h3 className="text-xl font-semibold text-gray-800">Kids</h3>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">👜</div>
                <h3 className="text-xl font-semibold text-gray-800">Accessories</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Featured Products</h2>
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading featured products...</p>
              </div>
            ) : trendingProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {trendingProducts.slice(0, 4).map((product, index) => {
                  const featuredProducts = [
                    { emoji: "👗", category: "Women", name: "Summer Dress", price: "$49.99" },
                    { emoji: "👕", category: "Men", name: "Casual T-Shirt", price: "$19.99" },
                    { emoji: "👖", category: "Unisex", name: "Denim Jeans", price: "$79.99" },
                    { emoji: "👟", category: "Footwear", name: "Sneakers", price: "$89.99" }
                  ];
                  const featured = featuredProducts[index] || {};

                  return (
                    <div key={product._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                      <div className="text-6xl mb-4 text-center">{featured.emoji}</div>
                      <div className="mb-2">
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                          {featured.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{featured.name}</h3>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">{featured.price}</span>
                        <Link href={`/product/${product._id}`} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300">
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg text-gray-600">No featured products available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Stay in Style</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest fashion updates and exclusive offers.
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 rounded-l-lg text-gray-800 focus:outline-none"
              />
              <button className="bg-pink-500 text-white px-6 py-3 rounded-r-lg font-semibold hover:bg-pink-600 transition duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">FashionHub</h3>
              <p className="text-gray-400">Your ultimate destination for trendy fashion and style.</p>
              <div className="flex space-x-4 mt-4">
                <span className="text-2xl">📘</span>
                <span className="text-2xl">🐦</span>
                <span className="text-2xl">📷</span>
                <span className="text-2xl">💼</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/women" className="hover:text-white">Women</Link></li>
                <li><Link href="/men" className="hover:text-white">Men</Link></li>
                <li><Link href="/kids" className="hover:text-white">Kids</Link></li>
                <li><Link href="/accessories" className="hover:text-white">Accessories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/size-guide" className="hover:text-white">Size Guide</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 hello@fashionhub.com</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>📍 123 Fashion St, Style City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FashionHub. All rights reserved. Made with ❤️ for fashion lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
