"use client";

import { useAuth } from "@/context/AuthContext";
import { User2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiBox,
  FiShoppingBag,
  FiList,
  FiLink,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {

  const { user, logout } = useAuth();
  const router = useRouter();

  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: <FiHome /> },
    { href: "/users", label: "Users", icon: <FiUsers /> },
    { href: "/category", label: "Categories", icon: <FiList /> },
    { href: "/products", label: "Products", icon: <FiBox /> },
        // { href: "/vendors", label: "Vendors", icon: <User2 /> },
    { href: "/orders", label: "Orders", icon: <FiShoppingBag /> },
    { href: "/api", label: "API", icon: <FiLink /> },
  ];

  // ✅ Proper logout handler
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login"); // redirect user
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* ✅ Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ✅ Toggle Button for Big Screens */}
      {!isOpen && !isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 text-blue-700 hover:text-blue-900 transition-colors"
        >
          <FiMenu className="text-xl" />
        </button>
      )}

      {/* ✅ Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen bg-white text-blue-900 shadow-lg transition-all duration-300 border-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMobile && isOpen ? "w-full" : "w-56"}
      `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-blue-300 ${isOpen ? "" : "justify-center"}`}>
          <div className={`flex items-center gap-2 ${isOpen ? "" : "flex-col gap-1"}`}>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              C
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-base text-blue-800">Child Salon</h1>
                <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5">
                  <FiUser className="text-blue-500" />
                  <span>Admin User</span>
                </div>
              </div>
            )}
          </div>
          {isOpen ? (
            <button
              onClick={toggleSidebar}
              className="text-blue-700 hover:text-blue-900 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="text-blue-700 hover:text-blue-900 transition-colors"
            >
              <FiMenu className="text-xl" />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isOpen ? "gap-3 px-3" : "justify-center px-2"} py-2 rounded-md text-sm font-medium transition-all duration-200
                ${active
                    ? "bg-blue-500 text-white shadow-sm"
                    : "hover:bg-blue-300/60 text-blue-700"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`absolute bottom-0 left-0 right-0 border-t border-blue-300 p-3 text-xs text-blue-600 ${isOpen ? "" : "flex justify-center"}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-2 text-blue-700 hover:text-white hover:bg-blue-500 transition-all py-2 rounded-md text-sm font-medium ${isOpen ? "w-full" : "w-10 h-10"}`}
          >
            <FiLogOut className="text-base" />
            {isOpen && "Logout"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
