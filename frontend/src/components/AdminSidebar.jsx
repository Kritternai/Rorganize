import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ChartBarIcon,
  UserIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import "../styles/AdminDashboard.css"; // ใช้ CSS เดียวกัน

const AdminSidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <div
      className={`sidebar ${isHovered ? "expanded" : "collapsed"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="logo">
        <span>🛠</span>
        {isHovered && <span className="logo-text">Admin</span>}
      </div>

      {/* เมนูหลัก */}
      <ul>
        <li>
          <Link to="/admin" className="sidebar-item">
            <HomeIcon className="icon" />
            {isHovered && <span>แดชบอร์ด</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/reports" className="sidebar-item">
            <ChartBarIcon className="icon" />
            {isHovered && <span>รายงาน</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/users" className="sidebar-item">
            <UserIcon className="icon" />
            {isHovered && <span>ผู้ใช้</span>}
          </Link>
        </li>
        <li>
          <Link to="/add-room" className="sidebar-item">
            <PlusCircleIcon className="icon" />
            {isHovered && <span>เพิ่มห้องพัก</span>}
          </Link>
        </li>
      </ul>

      {/* ปุ่มออกจากระบบ */}
      <li className="logout-btn">
        <button onClick={handleLogout} className="logout-button">
          ออกจากระบบ
        </button>
      </li>
    </div>
  );
};

export default AdminSidebar;