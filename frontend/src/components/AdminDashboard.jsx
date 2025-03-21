import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import AdminSidebar from "./AdminSidebar"; // ✅ ใช้ Sidebar แยกไฟล์
import "../styles/AdminDashboard.css"; // Import CSS

ChartJS.register(...registerables);

const AdminDashboard = ({ token }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
      } catch (error) {
        setError("❌ ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      }
    };

    fetchDashboardData();
  }, [token, navigate]);

  // ข้อมูลสำหรับกราฟ
  const chartData = {
    labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
    datasets: [
      {
        label: "รายได้ (บาท)",
        data: [30000, 32000, 31000, 34000, 36000, 39000, 41000, 40000, 38000, 42000, 45000, 47000],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar /> {/* ✅ Sidebar ที่แยกออกมา */}

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <h2>📊 แดชบอร์ดผู้ดูแลระบบ</h2>
        {error && <p className="text-danger">{error}</p>}

        {/* สรุปข้อมูล */}
        {dashboardData ? (
          <div className="summary">
            <div className="card">
              <h5>ห้องทั้งหมด</h5>
              <p>{dashboardData.total_rooms}</p>
            </div>
            <div className="card">
              <h5>ห้องมีผู้เช่า</h5>
              <p>{dashboardData.occupied_rooms}</p>
            </div>
            <div className="card">
              <h5>ห้องว่าง</h5>
              <p>{dashboardData.available_rooms}</p>
            </div>
          </div>
        ) : (
          <p>🔄 กำลังโหลดข้อมูล...</p>
        )}

        {/* กราฟรายได้ */}
        <div className="chart-container">
          <h3>📈 รายได้ย้อนหลัง 12 เดือน</h3>
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;