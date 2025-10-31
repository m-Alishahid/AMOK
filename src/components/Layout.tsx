"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FiMenu } from "react-icons/fi";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Close sidebar by default on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-600 transition-colors"
        >
          <FiMenu />
        </button>
      )}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
      <div className={`flex-1 bg-white min-h-screen transition-all duration-300 ${
        isMobile && isOpen ? "ml-0" : isOpen ? "ml-56" : "ml-16"
      }`}>
        {/* Main content with responsive padding */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
      <Toaster />
    </div>
  );
};



export default Layout;
