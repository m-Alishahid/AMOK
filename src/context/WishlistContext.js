"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save wishlist to localStorage whenever wishlistItems change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoading]);

  const addToWishlist = (item) => {
    setWishlistItems(prevItems => {
      const existingItem = prevItems.find(
        wishlistItem => wishlistItem.productId === item.productId
      );

      if (existingItem) {
        // Item already in wishlist
        return prevItems;
      } else {
        // Add new item with additional details
        const wishlistItem = {
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          size: item.size || null,
          color: item.color || null,
          stock: item.stock || 10,
          description: item.description || '',
          variants: item.variants || null
        };
        return [...prevItems, wishlistItem];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prevItems =>
      prevItems.filter(item => item.productId !== productId)
    );
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    isLoading
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
