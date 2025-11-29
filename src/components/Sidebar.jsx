// "use client";

// import { useAuth } from "@/context/AuthContext";
// import { DiscIcon, User2 } from "lucide-react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   FiHome,
//   FiUsers,
//   FiBox,
//   FiShoppingBag,
//   FiList,
//   FiLink,
//   FiMenu,
//   FiX,
//   FiLogOut,
//   FiUser,
// } from "react-icons/fi";

// const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {

//   const { user, logout } = useAuth();
//   const router = useRouter();

//   const pathname = usePathname();

//   const menuItems = [
//     { href: "/dashboard", label: "Dashboard", icon: <FiHome /> },
//     { href: "/users", label: "Users", icon: <FiUsers /> },
//     { href: "/category", label: "Categories", icon: <FiList /> },
//     { href: "/products", label: "Products", icon: <FiBox /> },
//     { href: "/discount", label: "DiscountManager", icon: <DiscIcon /> },
//     // { href: "/vendors", label: "Vendors", icon: <User2 /> },
//     { href: "/orders", label: "Orders", icon: <FiShoppingBag /> },
//   ];

//   // ✅ Proper logout handler
//   const handleLogout = async () => {
//     try {
//       await logout();
//       router.push("/login"); // redirect user
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isOpen && isMobile && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
//           onClick={toggleSidebar}
//           aria-hidden="true"
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed lg:static top-0 left-0 z-50 h-screen bg-white text-blue-900 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out flex flex-col backdrop-blur-sm bg-white/95
//           ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//           ${isMobile ? "w-full sm:w-72" : "w-56"}
//         `}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-3 sm:p-4 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg text-sm transform hover:scale-105 transition-transform duration-200">
//               C
//             </div>
//             {(isOpen || !isMobile) && (
//               <div className="min-w-0 flex-1">
//                 <h1 className="font-bold text-sm sm:text-base text-blue-900 truncate">Child Salon</h1>
//                 <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
//                   <FiUser className="w-3 h-3 flex-shrink-0" />
//                   <span className="truncate">Admin</span>
//                 </div>
//               </div>
//             )}
//           </div>
//           {isOpen && (
//             <button
//               onClick={toggleSidebar}
//               className="p-1 text-blue-700 hover:bg-blue-100 rounded-md transition-all duration-200 lg:hidden flex-shrink-0 touch-manipulation active:bg-blue-200 hover:scale-110"
//               aria-label="Close sidebar"
//             >
//               <FiX className="w-5 h-5" />
//             </button>
//           )}
//         </div>

//         {/* Menu */}
//         <nav className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
//           {menuItems.map((item) => {
//             const active = pathname === item.href;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`group flex items-center ${isOpen ? "gap-3 px-3" : "justify-center px-2"} py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation transform hover:scale-[1.02] hover:shadow-sm
//                 ${active
//                     ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
//                     : "text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 active:bg-blue-200 hover:shadow-md"
//                   }`}
//               >
//                 <span className={`text-lg flex-shrink-0 transition-all duration-300 ${active ? "text-white" : "text-blue-600 group-hover:scale-110 group-hover:rotate-3"}`}>{item.icon}</span>
//                 {isOpen && <span className={`truncate transition-all duration-300 ${active ? "text-white" : "text-blue-900 group-hover:text-blue-800"}`}>{item.label}</span>}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Footer */}
//         <div className="border-t border-blue-200 p-2 sm:p-3 bg-blue-50">
//           <button
//             onClick={handleLogout}
//             className={`w-full flex items-center justify-center gap-2 px-3 py-2 sm:py-3 text-blue-700 hover:bg-blue-200 active:bg-blue-300 transition-all duration-150 rounded-lg font-medium text-sm touch-manipulation ${isOpen ? "" : "p-2"}`}
//             title="Logout"
//           >
//             <FiLogOut className="w-5 h-5 flex-shrink-0" />
//             {isOpen && <span className="truncate">Logout</span>}
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;


"use client";

import { useAuth } from "@/context/AuthContext";
import { DiscIcon, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiBox,
  FiShoppingBag,
  FiList,
  FiLogOut,
  FiUser,
  FiX,
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
    { href: "/discount", label: "DiscountManager", icon: <DiscIcon /> },
    { href: "/orders", label: "Orders", icon: <FiShoppingBag /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Mobile Background Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50 h-screen 
          flex flex-col bg-white/80 backdrop-blur-xl 
          border-r border-blue-100 shadow-xl lg:shadow-none
          transition-all duration-300 ease-in-out 

          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isMobile ? "w-72" : "w-60"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white font-bold flex items-center justify-center shadow-md">
              C
            </div>

            {(isOpen || !isMobile) && (
              <div>
                <h1 className="font-bold text-base text-blue-900">Child Salon</h1>
                <div className="flex items-center text-blue-600 gap-1 text-xs mt-1">
                  <FiUser className="w-3 h-3" />
                  Admin
                </div>
              </div>
            )}
          </div>

          {isMobile && isOpen && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition"
            >
              <FiX className="w-5 h-5 text-blue-700" />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (isMobile) toggleSidebar(); }}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl
                  font-medium text-sm transition-all duration-300 relative

                  ${
                    active
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-blue-700 hover:bg-blue-100 hover:shadow-sm"
                  }
                `}
              >
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-lg shadow-md"></span>
                )}

                <span className={`text-xl ${active ? "text-white" : "text-blue-600"}`}>
                  {item.icon}
                </span>

                <span className={`${active ? "text-white" : "group-hover:text-blue-900"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t bg-blue-50 border-blue-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-3 py-3 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl font-medium transition"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
