import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles/App.css";
import "./styles/villa.css";
import "./styles/owl.css";
import "./styles/fontawesome.css";
import "./styles/flex-slider.css";
import "./styles/animate.css";

// 🔹 Import Components
import HomePage from "./components/HomePage";
import RoomsPage from "./components/RoomsPage";
import RoomDetail from "./components/RoomDetail";
import BookingPage from "./components/BookingPage";
import ContactPage from "./components/ContactPage";
import TenantsPage from "./components/TenantsPage";
import PaymentsPage from "./components/PaymentsPage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AddRoom from "./components/AddRoom";

function App() {
  // ✅ เก็บ Token ของ Admin ใน localStorage
  const [adminToken, setAdminToken] = useState(localStorage.getItem("admin_token"));

  // ✅ โหลดข้อมูลห้องพักจาก Backend
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:3001/api/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => console.error("โหลดห้องพักล้มเหลว:", err));
  }, []);

  // ✅ ฟังก์ชัน Login -> รับ Token และบันทึกลง Local Storage
  const handleLogin = (token) => {
    setAdminToken(token);
    localStorage.setItem("admin_token", token);
  };

  // ✅ ฟังก์ชัน Logout -> ล้าง Token
  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("admin_token");
  };

  return (
    <Router>
      {/* 🔹 Full Screen HomePage */}
      <Routes>
        <Route path="/" element={<HomePage rooms={rooms} />} />
        <Route path="/rooms" element={<RoomsPage rooms={rooms} />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route path="/admin" element={<AdminDashboard token={adminToken} />} />
        <Route path="/add-room" element={<AddRoom token={adminToken} />} />
      </Routes>
    </Router>
  );
}

export default App;