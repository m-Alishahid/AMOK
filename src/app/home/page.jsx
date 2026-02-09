'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import Footer from "@/components/Footer";
import ParentReviews from "@/components/Reviews";
import { 
  ShoppingBag, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Gift, 
  Snowflake,
  Trees,
  Shirt,
  Baby,
  Gem,
  Zap
} from "lucide-react";

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

  // Helper function to get category icon
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('girl')) return <Shirt className="w-8 h-8 text-pink-500" />;
    if (name.includes('boy')) return <Shirt className="w-8 h-8 text-blue-500" />;
    if (name.includes('baby')) return <Baby className="w-8 h-8 text-yellow-500" />;
    if (name.includes('accessories')) return <Gem className="w-8 h-8 text-purple-500" />;
    return <ShoppingBag className="w-8 h-8 text-gray-500" />;
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Video Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/60 to-gray-900/85" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-28 lg:py-36 min-h-[60vh] flex items-center">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium tracking-wide uppercase">Winter Collection 2025</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-white">
              {slides[0].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
              {slides[0].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-serif font-semibold text-base transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-serif font-semibold text-base transition-all"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collections for every style and occasion
            </p>
          </div>

          {categories.length < 5 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category, index) => (
                <div 
                  key={category._id || category.id} 
                  className="group cursor-pointer"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gray-100 p-6 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 mb-4 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {getCategoryIcon(category.name)}
                          </div>
                        )}
                      </div>
                      <h3 className="text-base md:text-lg font-serif font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Discover our {category.name.toLowerCase()} collection
                      </p>
                      <span className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                        Shop Now
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`overflow-x-auto -mx-4 px-4 scrollbar-hide`}>
              <div 
                className="flex gap-4 snap-x snap-mandatory items-stretch"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {categories.map((category, index) => (
                  <div 
                    key={category._id || category.id} 
                    className="flex-shrink-0 snap-start w-48 md:w-56 group cursor-pointer"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="bg-gray-50 rounded-xl p-4 h-full transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 mb-3 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400">
                              {getCategoryIcon(category.name)}
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm md:text-base font-serif font-semibold text-gray-900 mb-1">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          Discover our {category.name.toLowerCase()} collection
                        </p>
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium text-xs group-hover:gap-2 transition-all">
                          Shop
                          <ArrowRight className="w-3 h-3" />
                        </span>
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
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900">
                  Featured Products
                </h2>
                <p className="text-gray-600 mt-2">Handpicked favorites just for you</p>
              </div>
              <Link 
                href="/product"
                className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link 
                href="/product"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Snowflake className="w-4 h-4" />
              Seasonal Collection
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4 text-white">
              Winter Wonderland
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Discover our exclusive winter collection featuring cozy knits, festive dresses, and holiday-ready outfits for your little ones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Snowflake className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-white">Cozy Winter Wear</h3>
              <p className="text-gray-400">Warm jackets, sweaters, and boots perfect for chilly days.</p>
            </div>
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-green-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trees className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-white">Holiday Collection</h3>
              <p className="text-gray-400">Festive outfits and party dresses for special occasions.</p>
            </div>
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-white">Accessories</h3>
              <p className="text-gray-400">Scarves, hats, and gloves to complete the winter look.</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/product?category=seasonal"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-serif font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Winter Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ParentReviews reviews={reviews} />

      
     

      {/* Newsletter */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              Subscribe & Save
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Stay in Style
            </h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter for the latest luxury kidswear updates and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-6 py-4 rounded-full bg-gray-100 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-serif font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
}