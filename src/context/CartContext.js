"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem =>
          cartItem.productId === item.productId &&
          cartItem.size === item.size &&
          cartItem.color === item.color
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + item.quantity;

        // Check stock limit
        if (newQuantity > updatedItems[existingItemIndex].stock) {
          alert(`Cannot add more than ${updatedItems[existingItemIndex].stock} items to cart`);
          return prevItems;
        }

        updatedItems[existingItemIndex].quantity = newQuantity;
        return updatedItems;
      } else {
        // New item
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCartItems(prevItems =>
      prevItems.filter(item =>
        !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId, size, color, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.productId === productId && item.size === size && item.color === color) {
          if (newQuantity > item.stock) {
            alert(`Cannot set quantity above ${item.stock}`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
