'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Heart, ShoppingBag, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { theme, logoColors } from '@/lib/theme';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { getWishlistCount } = useWishlist();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data || response || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // handle scroll for navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const accountHref = isAuthenticated
    ? user?.roleType === 'customer'
      ? '/account'
      : '/dashboard'
    : '/login';

  return (
    <header className="w-full navbar sticky top-0 z-50">
      {/* Rewards Banner */}
      <div className="navbar-rewards text-[11px] sm:text-xs text-center py-2 font-serif px-2">
        Join <span className="font-semibold highlight">TinyFashion Rewards</span> and unlock exclusive treats as you shop.
        <span className="font-semibold highlight"> NEW REWARD </span> — Convert your points into vouchers.
      </div>

      {/* Navbar Container */}
      <div className={`flex items-center px-3 sm:px-4 md:px-8 py-2 md:py-3 max-w-9x1 mx-auto transition-all duration-500 ease-in-out ${isScrolled ? 'justify-start' : 'justify-between'}`}>
        {/* Left Section (Rewards + User) */}
        <div className={`flex items-center gap-1 sm:gap-3 transition-all duration-500 ease-in-out ${isScrolled ? 'order-1' : ''}`}>
          <button className={`hidden sm:flex border border-[var(--primary-blue)] bg-[var(--primary-blue)] text-white rounded-full hover:bg-[var(--primary-blue-hover)] transition-colors font-serif ${isScrolled ? 'px-0.1 py-0.1' : 'px-3 py-1 text-[12px] sm:text-sm'}`}>
            👑{!isScrolled && ' Rewards'}
          </button>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((s) => !s)}
                className={`border border-gray-300 rounded-full flex items-center hover:bg-gray-50 transition-colors font-serif ${isScrolled ? 'px-1 py-0.5' : 'px-2 sm:px-3 py-1 gap-1 text-[12px] sm:text-sm'}`}
              >
                <User size={16} />
                {!isScrolled && (
                  <>
                    <span className="hidden sm:inline">{user?.firstName || 'Account'}</span>
                    <ChevronDown size={13} className="ml-1 hidden sm:inline" />
                  </>
                )}
              </button>

              {profileOpen && (
                <div className="absolute left-0 mt-2 w-40 sm:w-44 bg-white border rounded-md shadow-lg py-2 z-50 text-sm">
                  <Link
                    href={accountHref}
                    className="block px-4 py-2 hover:bg-gray-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  {user?.roleType === 'customer' && (
                    <>
                      <Link
                        href="/order"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Orders
                      </Link>
                      <Link
                        href="/order-tracking"
                        className="block px-4 py-2 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Track Order
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={`border border-[var(--primary-blue)] bg-[var(--primary-blue)] text-white rounded-full flex items-center hover:bg-[var(--primary-blue-hover)] transition-colors font-serif ${isScrolled ? 'px-0.1 py-0.1' : 'px-2 sm:px-3 py-1 text-[12px] sm:text-sm'}`}
            >
              <User size={14} /> {!isScrolled && <span className="hidden sm:inline">Sign In</span>}
            </Link>
          )}
        </div>

        {/* Center Logo */}
        <Link href="/" className={`flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${isScrolled ? 'order-2 transform -translate-x-1 ml-10' : 'flex-1'}`}>
          <Image
            src="next.svg"
            alt="TinyFashion Logo"
            width={65}
            height={45}
            className="object-contain"
          />
          <h1 className={`font-bold text-[16px] sm:text-[18px] tracking-[1.5px] font-serif text-center transition-all duration-500 ease-in-out ${isScrolled ? 'transform -translate-x-4' : ''}`}>
            <span style={{ color: logoColors[0] }}>T</span>
            <span style={{ color: logoColors[1] }}>I</span>
            <span style={{ color: logoColors[2] }}>N</span>
            <span style={{ color: logoColors[3] }}>Y</span>
            <span style={{ color: logoColors[4] }}>F</span>
            <span style={{ color: logoColors[5] }}>A</span>
            <span style={{ color: logoColors[6] }}>S</span>
            <span style={{ color: logoColors[7] }}>H</span>
            <span style={{ color: logoColors[8] }}>I</span>
            <span style={{ color: logoColors[9] }}>O</span>
            <span style={{ color: logoColors[10] }}>N</span>
          </h1>
        </Link>

        {/* Right Icons */}
        <div className={`flex items-center gap-2 sm:gap-3 transition-all duration-500 ease-in-out ${isScrolled ? 'order-3' : ''}`}>
          {/* Search Button */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`hidden md:flex items-center gap-1 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-serif ${isScrolled ? 'px-1 py-0.5' : 'px-3 py-1 text-sm'}`}
            >
              <Search size={15} /> {!isScrolled && 'Search'}
            </button>

            {/* Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg p-4 z-50">
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#1e40af] text-white py-2 rounded-md hover:bg-[#b8932a] transition-colors font-serif font-semibold"
                  >
                    Search
                  </button>
                </form>
                <div className="mt-3 text-xs text-gray-500">
                  <p>Popular searches: dresses, shoes, accessories</p>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <Link href="/wishlist" className="relative flex items-center hover:text-primary-blue-hover transition-colors">
            <Heart size={18} />
            {getWishlistCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#1e40af] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {getWishlistCount()}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <Link href="/cart" className="relative flex items-center hover:text-primary-blue-hover transition-colors">
            <ShoppingBag size={18} />
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#1e40af] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {getCartItemCount()}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden border rounded-full p-1 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Desktop Categories */}
      {/* <nav className="navbar-categories hidden md:flex justify-center gap-5 text-[13.5px] font-medium tracking-wide py-3 uppercase font-serif">
        {categories.map((category) => (
          <Link
            key={category._id || category.id}
            href={`/categories/${category._id || category.id}`}
            className="hover:text-[var(--primary-blue)] transition-colors"
          >
            {category.name}
          </Link>
        ))}
      </nav> */}

      {/* Desktop Categories */}
<nav className="navbar-categories hidden md:flex justify-center gap-5 text-[13.5px] font-medium tracking-wide py-3 uppercase font-serif">
  {categories.map((category) => (
    <Link
      key={category._id}
      // href={`/categories/${category.slug}`} // ✅ use slug here
            href={`/categories/${category.slug || category._id}`}
      className="hover:text-[var(--primary-blue)] transition-colors"
    >
      {category.name}
    </Link>
  ))}
</nav>


      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col py-2">
            {categories.map((category) => (
              <Link
                key={category._id || category.id}
                href={`/categories/${category._id || category.id}`}
                className="px-6 py-3 text-gray-800 hover:bg-gray-50 hover:text-[#cda434] transition-colors font-serif uppercase text-[13px]"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}

            <div className="border-t mt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-6 py-3 hover:bg-gray-50 text-sm font-serif text-red-500"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block text-center py-3 hover:bg-gray-50 font-serif text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}