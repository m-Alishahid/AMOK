"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Globe, Heart, ShoppingBag, User, Search, Menu, X } from "lucide-react";
import categoryService from "@/services/categoryService";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <header className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
      {/* --- Top Reward Bar --- */}
      <div className="bg-gradient-to-b from-[#f8f4eb] to-[#fffdf9] text-xs text-center text-gray-600 py-2 border-b font-serif">
        Join Childrensalon Rewards and unlock exclusive treats as you shop.
        <span className="font-semibold text-[#cda434]"> NEW REWARD </span> — Convert your
        points into vouchers.
      </div>

      {/* --- Main Navbar --- */}
      <div className="relative flex items-center justify-center px-4 md:px-6 py-3 max-w-7xl mx-auto">
        {/* Right Options - Absolute positioned */}
       

        {/* Left Side Buttons - Absolute positioned */}
        <div className="absolute left-4 md:left-6 flex items-center gap-2 md:gap-3 text-sm text-gray-700">
          <button className="border border-[#d4b26e] rounded-full px-3 py-1 flex items-center gap-1 hover:bg-[#f8f4eb] transition-colors font-serif">
            👑 Rewards
          </button>
          <button className="border border-[#d4b26e] rounded-full px-3 py-1 flex items-center gap-1 hover:bg-[#f8f4eb] transition-colors font-serif">
            <User size={14} /> Sign In
          </button>
        </div>

        {/* Center Logo */}
        <div className="flex flex-col items-center">
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="/next.svg"
              alt="Childrensalon Logo"
              width={80}
              height={60}
              className="object-contain"
            />
            <h1 className="font-bold text-[18px] md:text-[22px] tracking-[2px] md:tracking-[3px] font-serif">
              <span className="text-[#cda434]">C</span>
              <span className="text-[#f07b7b]">H</span>
              <span className="text-[#8cc5c0]">I</span>
              <span className="text-[#dca8b6]">L</span>
              <span className="text-[#b7b3d0]">D</span>
              <span className="text-[#f1b74a]">R</span>
              <span className="text-[#f07b7b]">E</span>
              <span className="text-[#8cc5c0]">N</span>
              <span className="text-[#dca8b6]">S</span>
              <span className="text-[#b7b3d0]">A</span>
              <span className="text-[#f1b74a]">L</span>
              <span className="text-[#cda434]">O</span>
              <span className="text-[#f07b7b]">N</span>
            </h1>
          </Link>
        </div>
      </div>

      {/* --- Navigation Menu --- */}
      <nav className="hidden md:flex justify-center gap-6 text-[15px] font-medium tracking-wide text-gray-800 border-t py-3 uppercase font-serif">
        {categories.map((category) => (
          <Link key={category.id} href={`/product?category=${category.name.toLowerCase().replace(" ", "-")}`}
            className="hover:text-[#cda434] transition-colors">
            {category.name}
          </Link>
        ))}
      </nav>

      {/* --- Mobile Navigation Menu --- */}
      <div className="md:hidden border-t">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center justify-center py-3 text-gray-800 font-serif"
        >
          <Menu size={20} className="mr-2" />
          Menu
        </button>
        {isMenuOpen && (
          <div className="bg-white border-t shadow-lg">
            <div className="flex flex-col py-2">
              {categories.map((category) => (
                <Link key={category.id} href={`/product?category=${category.name.toLowerCase().replace(" ", "-")}`}
                  className="px-6 py-3 text-gray-800 hover:bg-gray-50 hover:text-[#cda434] transition-colors font-serif uppercase text-sm"
                  onClick={() => setIsMenuOpen(false)}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- Utility Icons --- */}
      <div className="absolute right-4 md:right-6 top-[72px] flex items-center gap-3 md:gap-4 text-gray-600">
        <button className="hidden md:flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors font-serif">
          <Search size={16} /> Search
        </button>
        <Link href="/account" className="flex items-center gap-1 hover:text-[#cda434] transition-colors">
          <User size={18} />
          <span className="hidden md:inline font-serif">Account</span>
        </Link>
        <Link href="/wishlist" className="flex items-center gap-1 hover:text-[#cda434] transition-colors">
          <Heart size={18} />
          <span className="hidden md:inline font-serif">Wishlist</span>
        </Link>
        <Link href="/cart" className="flex items-center gap-1 hover:text-[#cda434] transition-colors">
          <ShoppingBag size={18} />
          <span className="hidden md:inline font-serif">Bag</span>
        </Link>
      </div>
    </header>
  );
}
