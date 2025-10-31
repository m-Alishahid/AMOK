// "use client";

// import { createContext, useContext, useState, useEffect } from 'react';
// import { authService } from '@/services/authService';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Check if user is logged in on app start
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const response = await authService.getCurrentUser();
//       if (response.success) {
//         setUser(response.data.user);
//         setIsAuthenticated(true);
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       // Clear any invalid tokens
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       setLoading(true);
//       const response = await authService.login(email, password);

//       if (response.success) {
//         setUser(response.data.user);
//         setIsAuthenticated(true);
//         // Store token in localStorage for client-side API calls
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('token', response.data.token);
//         }
//         return { success: true, message: response.message };
//       }
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.error || 'Login failed'
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       await authService.logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       // Clear token from localStorage
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('token');
//       }
//       setUser(null);
//       setIsAuthenticated(false);
//     }
//   };

//   const updateUser = (userData) => {
//     setUser(prev => ({ ...prev, ...userData }));
//   };

//   const hasPermission = (module, action) => {
//     if (!user || !user.permissions) return false;
//     return user.permissions[module]?.[action] || false;
//   };

//   const value = {
//     user,
//     loading,
//     isAuthenticated,
//     login,
//     logout,
//     updateUser,
//     hasPermission,
//     checkAuthStatus
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };




// context/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        // Invalid token
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
        }
        
        return { 
          success: true, 
          message: response.message,
          user: userData 
        };
      } else {
        return {
          success: false,
          message: response.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        sessionStorage.clear();
      }
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const hasPermission = (module, action) => {
    if (!user || !user.permissions) return false;
    return user.permissions[module]?.[action] || false;
  };

  // Check if user is vendor
  const isVendor = () => {
    return user?.isVendor || user?.roleType === 'vendor' || user?.role === 'vendor';
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'super_admin' || user?.roleType === 'admin';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasPermission,
    isVendor,
    isAdmin,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};