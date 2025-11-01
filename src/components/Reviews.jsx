"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Star, ChevronLeft, ChevronRight, Heart, Shield, Award } from "lucide-react";

const defaultReviews = [
  {
    name: "Sarah Johnson",
    role: "Mother of 2",
    rating: 5,
    image: "/customer1.jpg",
    text: "Absolutely love the quality! My kids look adorable and the clothes are super comfortable. The attention to detail is remarkable."
  },
  {
    name: "David Kim",
    role: "Father",
    rating: 5,
    image: "/customer2.jpg",
    text: "Fast delivery and great customer service. My son loves his new jacket! The winter collection kept him warm all season."
  },
  {
    name: "Emma Williams",
    role: "Mom Blogger",
    rating: 5,
    image: "/customer3.jpg",
    text: "Stylish designs with amazing fabric quality. Highly recommended for parents who care about comfort and style!"
  },
  {
    name: "Michael Chen",
    role: "Father of 3",
    rating: 5,
    image: "/customer4.jpg",
    text: "Outstanding customer service and beautiful designs. The quality exceeds expectations. Will definitely shop again!"
  },
  {
    name: "Lisa Park",
    role: "Mother of 1",
    rating: 4,
    image: "/customer5.jpg",
    text: "Great products and fast shipping. My daughter loves her new outfit!"
  },
  {
    name: "John Smith",
    role: "Father",
    rating: 5,
    image: "/customer6.jpg",
    text: "Excellent quality and customer service. Highly recommend!"
  }
];

export default function ParentReviews({ reviews: propReviews }) {
  const reviews = useMemo(
    () => (propReviews && propReviews.length > 0 ? propReviews : defaultReviews),
    [propReviews]
  );

  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide every 5s
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length, isAutoPlaying]);

  const nextReview = () => setCurrent((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);

  const goToReview = (index) => setCurrent(index);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") prevReview();
    if (e.key === "ArrowRight") nextReview();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (reviews.length === 0) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-800">
            What Parents Say
          </h2>
          <p className="text-lg text-gray-600 font-serif">No reviews yet. Be the first!</p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-16 overflow-hidden relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-800">
            What Parents Say
          </h2>
          <p className="text-lg text-gray-600 font-serif max-w-2xl mx-auto">
            Discover why thousands of parents trust us with their children's fashion
          </p>
        </motion.div>

        {/* Reviews Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl min-h-[420px] flex items-center justify-center">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                className="absolute w-full"
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: index === current ? 1 : 0,
                  x: index === current ? 0 : index < current ? -100 : 100,
                  zIndex: index === current ? 10 : 0,
                }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              >
                <motion.div
                  className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer max-w-3xl mx-auto"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Rating Stars */}
                  <div className="flex justify-center mb-6">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 transition-all duration-300 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current drop-shadow-sm"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-gray-700 text-lg md:text-xl font-serif italic text-center mb-8 leading-relaxed">
                    “{review.text}”
                  </blockquote>

                  {/* Reviewer Info */}
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={review.image || "/placeholder-user.jpg"}
                      alt={review.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-yellow-200 shadow-md"
                    />
                    <div className="text-center">
                      <h4 className="font-serif font-semibold text-gray-800 text-lg">
                        {review.name}
                      </h4>
                      <p className="text-sm text-gray-500 font-serif">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevReview}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 border border-gray-200 focus:outline-none"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 border border-gray-200 focus:outline-none"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center mt-8 space-x-3">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => goToReview(i)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                i === current ? "bg-blue-600 scale-125 shadow-md" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to review ${i + 1}`}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm text-gray-600 font-serif">
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <span className="font-medium">10,000+ Happy Parents</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Premium Quality</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Award className="w-5 h-5 text-purple-500 fill-current" />
              <span className="font-medium">5-Star Reviews</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
