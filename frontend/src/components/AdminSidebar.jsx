import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Home, FileText, Users, ClipboardList, Settings, LogOut,
  Calendar, BarChart, ChevronDown, ChevronRight, Menu, Building, Key, CreditCard
} from "lucide-react";
import "@fontsource/prompt";
import "tailwindcss/tailwind.css";

const AdminSidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Active route checker
  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (parentPath) => location.pathname.startsWith(parentPath);

  // Close dropdown when route changes
  useEffect(() => {
    setOpenMenu(null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  // Menu item component to reduce repetitive code
  const MenuItem = ({ to, icon: Icon, label, isActiveItem }) => (
    <Link 
      to={to} 
      className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} p-3 rounded-lg 
        ${isActiveItem ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-blue-50"}`}
    >
      <Icon className={isActiveItem ? "text-blue-600" : "text-gray-600"} size={isCollapsed ? 24 : 20} />
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </Link>
  );

  // Dropdown menu component
  const DropdownMenu = ({ id, icon: Icon, label, isActiveMenu, children }) => (
    <div className="relative">
      <button 
        onClick={() => setOpenMenu(openMenu === id ? null : id)} 
        className={`flex w-full rounded-lg p-3 
          ${isActiveMenu ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-blue-50"}
          ${isCollapsed ? "justify-center" : "items-center justify-between"}`}
      >
        <div className={`flex items-center ${isCollapsed ? "" : "space-x-3"}`}>
          <Icon 
            className={isActiveMenu ? "text-blue-600" : "text-gray-600"} 
            size={isCollapsed ? 24 : 20} 
          />
          {!isCollapsed && <span className="font-medium">{label}</span>}
        </div>
        {!isCollapsed && (
          openMenu === id ? <ChevronDown size={18} /> : <ChevronRight size={18} />
        )}
      </button>

      <AnimatePresence>
        {((openMenu === id && !isCollapsed) || (isCollapsed && isActiveMenu)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`space-y-1 mt-1 overflow-hidden
              ${isCollapsed ? "absolute left-20 top-0 bg-white shadow-lg rounded-lg p-3 min-w-40 z-20" : "pl-10"}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Submenu item component
  const SubMenuItem = ({ to, label }) => (
    <Link 
      to={to} 
      className={`block py-2 px-3 rounded-md ${isActive(to) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex h-screen font-['Prompt']">
      {/* Sidebar */}
      <motion.div 
        className={`bg-white shadow-lg h-screen fixed top-0 left-0 z-10
        flex flex-col justify-between`}
        animate={{ 
          width: isCollapsed ? 80 : 288,
          padding: isCollapsed ? 12 : 16
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Logo + Toggle Button */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-8`}>
          <div className="flex items-center space-x-3">
            <LayoutGrid className="text-blue-600" size={isCollapsed ? 32 : 28} />
            {!isCollapsed && <h2 className="text-xl font-bold text-gray-800">RorganizeAdmin</h2>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={`p-1 hover:bg-gray-200 rounded ${isCollapsed ? "mt-4" : ""}`}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Main Menu */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          <MenuItem 
            to="/admin" 
            icon={Home} 
            label="แดชบอร์ด"
            isActiveItem={isActive("/admin")}
          />

          {/* จัดการห้องพัก */}
          <DropdownMenu 
            id="rooms" 
            icon={Building} 
            label="จัดการห้องพัก" 
            isActiveMenu={isSubmenuActive("/admin/rooms")}
          >
            <SubMenuItem to="/admin/room-status" label="สถานะห้องพัก" />
            <SubMenuItem to="/admin/add-room" label="เพิ่มห้องพัก" />
          </DropdownMenu>

          {/* การจองและทำสัญญาเช่า */}
          <DropdownMenu 
            id="contracts" 
            icon={FileText} 
            label="การจองและสัญญา" 
            isActiveMenu={isSubmenuActive("/admin/booking") || isSubmenuActive("/admin/contracts")}
          >
            <SubMenuItem to="/admin/bookings" label="การจองห้องพัก" />
            <SubMenuItem to="/admin/contracts" label="สัญญาเช่า" />
          </DropdownMenu>

          {/* การรับผู้เช่าเข้าพักและย้ายออก */}
          <DropdownMenu 
            id="checkin" 
            icon={Key} 
            label="เข้าพักและย้ายออก" 
            isActiveMenu={isSubmenuActive("/admin/checkin") || isSubmenuActive("/admin/checkout")}
          >
            <SubMenuItem to="/admin/checkin" label="การเข้าพัก" />
            <SubMenuItem to="/admin/checkout" label="การย้ายออก" />
          </DropdownMenu>

          {/* การจัดการผู้เช่า */}
          <MenuItem 
            to="/admin/tenants" 
            icon={Users} 
            label="จัดการผู้เช่า"
            isActiveItem={isActive("/admin/tenants")}
          />

          {/* การจัดเก็บค่าเช่าและค่าบริการ */}
          <DropdownMenu 
            id="payments" 
            icon={CreditCard} 
            label="การเงินและบริการ" 
            isActiveMenu={isSubmenuActive("/admin/payments") || isSubmenuActive("/admin/utilities")}
          >
            <SubMenuItem to="/admin/payments" label="ค่าเช่าและบริการ" />
            <SubMenuItem to="/admin/utilities" label="ค่าสาธารณูปโภค" />
          </DropdownMenu>

          {/* รายงาน */}
          <MenuItem 
            to="/admin/reports" 
            icon={FileText} 
            label="ออกรายงาน"
            isActiveItem={isActive("/admin/reports")}
          />

          {/* ปฏิทินและการนัดหมาย */}
          <MenuItem 
            to="/admin/calendar" 
            icon={Calendar} 
            label="ปฏิทิน"
            isActiveItem={isActive("/admin/calendar")}
          />

          {/* ตั้งค่า */}
          <MenuItem 
            to="/admin/settings" 
            icon={Settings} 
            label="ตั้งค่า"
            isActiveItem={isActive("/admin/settings")}
          />
        </nav>

        {/* Logout Button */}
        <motion.button 
          onClick={handleLogout} 
          className="flex items-center w-full rounded-lg 
            bg-red-500 text-white hover:bg-red-600 transition-colors mt-auto"
          animate={{ 
            justifyContent: isCollapsed ? "center" : "flex-start",
            padding: isCollapsed ? 16 : 12
          }}
        >
          <LogOut size={isCollapsed ? 24 : 20} />
          {!isCollapsed && <span className="font-medium ml-3">ออกจากระบบ</span>}
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="flex-1"
        animate={{ 
          marginLeft: isCollapsed ? 80 : 288
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <main className="p-6">
          {children}
        </main>
      </motion.div>
    </div>
  );
};

export default AdminSidebar;