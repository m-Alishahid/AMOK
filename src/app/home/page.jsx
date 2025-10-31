'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard"; // Import ProductCard component
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showScrollbar, setShowScrollbar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await categoryService.getAll();
        // const categoriesData = await categoriesRes.json();
        if (categoriesRes.success) {
          setCategories(categoriesRes.data || []);
        }

        // Fetch products
        const productsRes = await productService.getAll();
        console.log('Products', productsRes);

        // const productsData = await productsRes.json();
        if (productsRes.success) {
          setProducts(productsRes.data?.products || productsRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const slides = [
    {
      video: "/video1.mp4",
      title: "It's Snuggle Season",
      subtitle: "As the nights draw in, our cosiest collections come out to play."
    }
  ];

  const newInProducts = products.slice(0, 12);
  const featuredProducts = products.slice(0, 8);

  const reviews = [
    {
      name: "Sarah M.",
      role: "Mother of 2",
      rating: 5,
      text: "The quality of these clothes is outstanding. My kids look so stylish and the fabrics are incredibly soft. Worth every penny!"
    },
    {
      name: "James L.",
      role: "Father of 3",
      rating: 5,
      text: "Amazing customer service and beautiful designs. The winter collection kept my kids warm and fashionable all season."
    },
    {
      name: "Emma R.",
      role: "Mother of 1",
      rating: 5,
      text: "I love how Childrensalon combines luxury with comfort. The attention to detail in every piece is remarkable."
    }
  ];

  const filteredProducts = selectedCategory === "All"
    ? newInProducts
    : newInProducts.filter(product => {
      const catName = (product.category?.name || '').toLowerCase();
      if (selectedCategory === "Girls") return catName.includes("girl");
      if (selectedCategory === "Boys") return catName.includes("boy");
      if (selectedCategory === "Baby") return catName.includes("baby");
      if (selectedCategory === "Accessories") return catName.includes("accessories");
      return true;
    });

  // Touch handlers for scrollbar visibility
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setShowScrollbar(true);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    setShowScrollbar(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-serif">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      {/* Hero Video Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={slides[0].video} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-28 lg:py-36 min-h-[60vh] flex items-center">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-3 text-[var(--primary-blue)]">
              {slides[0].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 max-w-2xl mx-auto font-serif text-gray-200">
              {slides[0].subtitle}
            </p>
            <div className="flex justify-center">
              <Link
                href="/product"
                className="inline-block bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white px-6 py-3 rounded-full font-serif font-semibold text-base transition transform hover:scale-105 shadow-lg"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="bg-blue-100 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-black mb-6">
            Shop by Category
          </h2>

          {categories.length < 5 ? (
            <div className="flex justify-center gap-6">
              {categories.map((category, index) => (
                <div key={category._id || category.id} className="flex-shrink-0 w-64 md:w-72 bg-blue-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div
                    role="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className="flex flex-col items-center justify-between h-full cursor-pointer"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 mb-3 rounded-full overflow-hidden bg-white flex items-center justify-center">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-3xl md:text-4xl">
                          {category.name.toLowerCase().includes('girl') ? '👗' :
                            category.name.toLowerCase().includes('boy') ? '👔' :
                              category.name.toLowerCase().includes('baby') ? '🍼' :
                                category.name.toLowerCase().includes('accessories') ? '🧣' : '👕'}
                        </div>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-serif font-semibold text-center">{category.name}</h3>
                    <p className="text-sm text-gray-600 text-center mt-2">Discover our {category.name.toLowerCase()} collection</p>
                    <div className="mt-4 w-full">
                      <button className="w-full bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white px-4 py-3 rounded-full text-base font-serif transition-colors duration-300">
                        Shop
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`overflow-x-auto  -mx-4 px-4`}>
              <div
                className="flex gap-4 snap-x snap-mandatory items-stretch "
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* "All" Category Card - Same size as other categories */}

                {categories.map((category, index) => (
                  <div key={category._id || category.id} className="flex-shrink-0 snap-start w-48 md:w-56 bg-blue-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div
                      role="button"
                      onClick={() => setSelectedCategory(category.name)}
                      className="flex flex-col items-center justify-between h-full cursor-pointer"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 mb-2 rounded-full overflow-hidden bg-white flex items-center justify-center">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-2xl md:text-3xl">
                            {category.name.toLowerCase().includes('girl') ? '👗' :
                              category.name.toLowerCase().includes('boy') ? '👔' :
                                category.name.toLowerCase().includes('baby') ? '🍼' :
                                  category.name.toLowerCase().includes('accessories') ? '🧣' : '👕'}
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm md:text-base font-serif font-semibold text-center">{category.name}</h3>
                      <p className="text-xs text-gray-600 text-center mt-2">Discover our {category.name.toLowerCase()} collection</p>
                      <div className="mt-3 w-full">
                        <button className="w-full bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white px-3 py-2 rounded-full text-sm font-serif transition-colors duration-300">
                          Shop
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-center text-black mb-6">
              Featured Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold mb-3 md:mb-4 text-gray-800">
              Winter Wonderland
            </h2>
            <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto font-serif">
              Discover our exclusive winter collection featuring cozy knits, festive dresses, and holiday-ready outfits for your little ones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-5xl mb-3">❄️</div>
              <h3 className="text-xl font-serif font-semibold mb-1 text-gray-800">Cozy Winter Wear</h3>
              <p className="text-gray-600 font-serif">Warm jackets, sweaters, and boots perfect for chilly days.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-5xl mb-3">🎄</div>
              <h3 className="text-xl font-serif font-semibold mb-1 text-gray-800">Holiday Collection</h3>
              <p className="text-gray-600 font-serif">Festive outfits and party dresses for special occasions.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-5xl mb-3">🧣</div>
              <h3 className="text-xl font-serif font-semibold mb-1 text-gray-800">Accessories</h3>
              <p className="text-gray-600 font-serif">Scarves, hats, and gloves to complete the winter look.</p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/product?category=seasonal"
              className="inline-block bg-black text-white px-6 py-3 rounded font-serif hover:bg-gray-800 transition-colors duration-300"
            >
              Explore Winter Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-center mb-6 text-gray-800">
            What Parents Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4 text-[var(--primary-blue)]">{"⭐".repeat(review.rating)}</div>
                  <div>
                    <h4 className="font-serif font-semibold text-gray-800">{review.name}</h4>
                    <p className="text-sm text-gray-600 font-serif">{review.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 font-serif italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-black text-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-serif font-bold mb-3">
            Stay in Style
          </h2>
          <p className="text-base md:text-lg mb-6 max-w-2xl mx-auto font-serif text-gray-300">
            Subscribe to our newsletter for the latest luxury kidswear updates and exclusive offers.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 rounded-lg sm:rounded-l-lg bg-white sm:rounded-r-none text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] font-serif"
              />
              <button
                onClick={() => {
                  const email = document.querySelector('input[type="email"]').value;
                  if (email) {
                    alert(`Thank you for subscribing! We'll send updates to ${email}`);
                    document.querySelector('input[type="email"]').value = '';
                  } else {
                    alert('Please enter a valid email address');
                  }
                }}
                className="bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white px-6 py-3 rounded-lg sm:rounded-r-lg sm:rounded-l-none font-serif transition-colors duration-300"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--primary-blue)] mb-2">
                Childrensalon Clone
              </h3>
              <p className="text-gray-300 text-sm font-serif">
                Luxury kidswear for the discerning child.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-serif font-semibold mb-2">Shop</h4>
              <ul className="space-y-1 text-gray-300 text-sm font-serif">
                <li><Link href="/product?category=girls" className="hover:text-[var(--primary-blue)] transition-colors duration-300">Girls</Link></li>
                <li><Link href="/product?category=boys" className="hover:text-[var(--primary-blue)] transition-colors duration-300">Boys</Link></li>
                <li><Link href="/product?category=new-in" className="hover:text-[var(--primary-blue)] transition-colors duration-300">New In</Link></li>
                <li><Link href="/product?category=designers" className="hover:text-[var(--primary-blue)] transition-colors duration-300">Designers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-serif font-semibold mb-2">Support</h4>
              <ul className="space-y-1 text-gray-300 text-sm font-serif">
                <li><Link href="/size-guide" className="hover:text-[var(--primary-blue)] transition-colors duration-300">Size Guide</Link></li>
                <li><Link href="/shipping" className="hover:text-[var(--primary-blue)] transition-colors duration-300">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-[var(--primary-blue)] transition-colors duration-300">Returns</Link></li>
                <li><Link href="/faq" className="hover:text-[var(--primary-blue)] transition-colors duration-300">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-serif font-semibold mb-2">Contact</h4>
              <ul className="space-y-1 text-gray-300 text-sm font-serif">
                <li>📧 hello@childrensalon.com</li>
                <li>📞 +44 (20) 123-4567</li>
                <li>📍 123 Luxury St, London</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
            <p className="text-sm font-serif">
              © 2025 Childrensalon Clone. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}