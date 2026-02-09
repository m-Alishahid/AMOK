"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FiMenu } from "react-icons/fi";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Close sidebar by default on mobile and tablet
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Always close sidebar on mobile for cleaner UX
      if (mobile) {
        setIsOpen(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Show loader if still loading authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show loader (will be redirected by ProtectedRoute)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile Header with Toggle Button */}
        {isMobile && (
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="px-3 py-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 truncate">Admin Panel</h2>
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 touch-manipulation active:bg-gray-200"
                aria-label="Toggle sidebar"
              >
                <FiMenu className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full h-full px-2 sm:px-3 md:px-4 lg:px-8 py-2 sm:py-3 md:py-4 lg:py-8">
            {children}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
};



export default Layout;
