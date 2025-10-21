"use client";

import Link from "next/link";

const Navbar = () => (
  <header className="bg-white shadow">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">Brand</div>
      <nav className="space-x-4">
        <Link href="/" className="text-gray-700 hover:text-pink-600">
          Home
        </Link>
        <Link href="/product" className="text-gray-700 hover:text-pink-600">
          Shop
        </Link>
        <Link href="/about" className="text-gray-700 hover:text-pink-600">
          About
        </Link>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-100 py-8 mt-8">
    <div className="container mx-auto px-4 text-center text-sm text-gray-600">
      © {new Date().getFullYear()} My Store. All rights reserved.
    </div>
  </footer>
);

export default function HomePage() {
  const featuredProducts = [
    { id: 1, name: "Summer Dress", price: "$49.99", image: "👗", category: "Women" },
    { id: 2, name: "Casual T-Shirt", price: "$19.99", image: "👕", category: "Men" },
    { id: 3, name: "Denim Jeans", price: "$79.99", image: "👖", category: "Unisex" },
    { id: 4, name: "Sneakers", price: "$89.99", image: "👟", category: "Footwear" }
  ];

  const categories = [
    { name: "Women", icon: "👩", link: "/product?category=women" },
    { name: "Men", icon: "👨", link: "/product?category=men" },
    { name: "Kids", icon: "👶", link: "/product?category=kids" },
    { name: "Accessories", icon: "👜", link: "/product?category=accessories" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Fashion Forward</h1>
            <p className="text-xl mb-8">
              Discover the latest trends in clothing and accessories. Style your life with our curated collection.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/product"
                className="bg-white text-pink-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition duration-300"
              >
                Shop Collection
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-pink-600 transition duration-300"
              >
                Our Story
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={category.link}
                  className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300"
                >
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="text-8xl mb-4 text-center">{product.image}</div>
                  <div className="mb-2">
                    <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-4">{product.price}</p>
                  <Link
                    href={`/product/${product.id}`}
                    className="bg-pink-600 text-white px-4 py-2 rounded w-full text-center hover:bg-pink-700 transition duration-300 block"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-pink-600 text-white">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">Stay in Style</h2>
            <p className="text-xl mb-8">
              Subscribe to our newsletter for the latest fashion updates and exclusive offers.
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-l-lg text-gray-900"
              />
              <button className="bg-white text-pink-600 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
