import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { Users, Home, PieChart, Activity, FileText, TrendingUp, Bell, RefreshCw } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import "@fontsource/prompt";
import "tailwindcss/tailwind.css";

ChartJS.register(...registerables);

const AdminDashboard = ({ token }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("day");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
        setError("");
      } catch (error) {
        setError("❌ ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, navigate]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get("http://localhost:3001/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
      setError("");
      
      // แสดงอนิเมชั่นประมาณ 1 วินาที
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      setError("❌ ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      setIsRefreshing(false);
    }
  };

  // สมมุติข้อมูลกราฟ
  const revenueData = {
    labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
    datasets: [
      {
        label: "รายได้ (บาท)",
        data: [30000, 32000, 31000, 34000, 36000, 39000, 41000, 40000, 38000, 42000, 45000, 47000],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "#3B82F6",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const occupancyData = {
    labels: ["เช่าแล้ว", "ห้องว่าง"],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ["#3B82F6", "#E5E7EB"],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const visitorData = {
    labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค."],
    datasets: [
      {
        label: "ผู้เข้าชม",
        data: [1200, 1500, 1800, 2200, 2800, 3000, 3200],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // คำนวณตัวเลขจาก dashboardData หรือใช้ค่า default
  const totalRooms = dashboardData?.total_rooms || 50;
  const occupiedRooms = dashboardData?.occupied_rooms || 35;
  const availableRooms = dashboardData?.available_rooms || 15;
  const occupancyRate = dashboardData?.occupancy_rate || "70%";

  const summaryCards = [
    { title: "ห้องทั้งหมด", value: totalRooms, icon: <Home className="text-blue-500" size={36} />, color: "blue", trend: "+2%" },
    { title: "ห้องมีผู้เช่า", value: occupiedRooms, icon: <Users className="text-green-500" size={36} />, color: "green", trend: "+5%" },
    { title: "ห้องว่าง", value: availableRooms, icon: <PieChart className="text-yellow-500" size={36} />, color: "yellow", trend: "-1%" },
    { title: "อัตราการเช่า", value: occupancyRate, icon: <Activity className="text-red-500" size={36} />, color: "red", trend: "+3%" },
  ];

  return (
    <div className="flex bg-gray-50 font-[Prompt]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Dashboard Content */}
      <div className="flex-1 p-6 bg-gray-50 min-h-screen transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="bg-white shadow-md p-6 rounded-xl flex justify-between items-center mb-8 transition-all duration-300 hover:shadow-lg">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">📊 แดชบอร์ดผู้ดูแลระบบ</h2>
            <p className="text-gray-500">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <button 
              onClick={refreshData}
              className={`flex items-center space-x-2 p-2 pl-3 pr-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 ${isRefreshing ? 'opacity-75' : ''}`}
              disabled={isRefreshing}
            >
              <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </header>

        {/* ตัวเลือกช่วงเวลา */}
        <div className="bg-white shadow-md p-4 rounded-xl mb-6 flex justify-between items-center">
          <div className="font-medium text-gray-700">ภาพรวมระบบ</div>
          
          <div className="flex bg-gray-100 rounded-lg">
            <button 
              onClick={() => setActiveTab("day")}
              className={`px-4 py-2 rounded-lg ${activeTab === "day" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200"} transition-colors duration-200`}
            >
              วันนี้
            </button>
            <button 
              onClick={() => setActiveTab("week")}
              className={`px-4 py-2 rounded-lg ${activeTab === "week" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200"} transition-colors duration-200`}
            >
              สัปดาห์นี้
            </button>
            <button 
              onClick={() => setActiveTab("month")}
              className={`px-4 py-2 rounded-lg ${activeTab === "month" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200"} transition-colors duration-200`}
            >
              เดือนนี้
            </button>
          </div>
        </div>

        {/* แสดงข้อความโหลดหรือข้อผิดพลาด */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-500 p-4 rounded-xl mb-6 text-center animate-pulse">
            {error}
          </div>
        ) : (
          <>
            {/* สรุปข้อมูล */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {summaryCards.map((card, index) => (
                <div 
                  key={index}
                  className="bg-white shadow-md rounded-xl p-6 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `rgba(${card.color === 'blue' ? '59, 130, 246' : card.color === 'green' ? '16, 185, 129' : card.color === 'yellow' ? '245, 158, 11' : '239, 68, 68'}, 0.1)` }}>
                      {card.icon}
                    </div>
                    <div className={`flex items-center text-sm font-medium ${card.trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                      <TrendingUp size={16} className="mr-1" />
                      {card.trend}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-gray-500 text-lg">{card.title}</h5>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Financial Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">📅 รายได้ค่าเช่าประจำเดือน</h3>
              <p className="text-3xl font-bold text-blue-600">฿{dashboardData?.rent_income?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">💧 รายได้ค่าน้ำ-ไฟ</h3>
              <p className="text-3xl font-bold text-blue-600">฿{dashboardData?.utility_income?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">💼 รายได้ค่าบริการอื่นๆ</h3>
              <p className="text-3xl font-bold text-blue-600">฿{dashboardData?.service_income?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">❗ ยอดค้างชำระรวม</h3>
              <p className="text-3xl font-bold text-red-500">฿{dashboardData?.total_due?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">💰 เงินประกันรวม</h3>
              <p className="text-3xl font-bold text-green-500">฿{dashboardData?.total_deposit?.toLocaleString() || 0}</p>
              </div>
            </div>

            {/* ส่วนของกราฟ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* กราฟแท่งรายได้ */}
              <div className="bg-white shadow-md rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">📈 กราฟรายได้ย้อนหลัง 12 เดือน</h3>
                  <div className="text-sm text-gray-500 px-3 py-1 bg-blue-50 rounded-full">+12.5%</div>
                </div>
                <div className="w-full h-64">
                  <Bar data={revenueData} options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          display: true,
                          drawBorder: false,
                        }
                      },
                      x: {
                        grid: {
                          display: false,
                          drawBorder: false,
                        }
                      }
                    },
                    animation: {
                      duration: 1000,
                    }
                  }} />
                </div>
              </div>

              {/* กราฟโดนัทอัตราการเช่า */}
              <div className="bg-white shadow-md rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">🏠 อัตราการเช่าห้องพัก</h3>
                  <div className="text-sm text-gray-500 px-3 py-1 bg-blue-50 rounded-full">{occupancyRate}</div>
                </div>
                <div className="w-full h-64 flex justify-center items-center">
                  <Doughnut 
                    data={occupancyData} 
                    options={{
                      cutout: '70%',
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      },
                      animation: {
                        animateRotate: true,
                        animateScale: true
                      }
                    }} 
                  />
                </div>
              </div>

              {/* กราฟเส้นผู้เข้าชม */}
              <div className="bg-white shadow-md rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">👥 จำนวนผู้เข้าชมเว็บไซต์</h3>
                  <div className="text-sm text-gray-500 px-3 py-1 bg-green-50 rounded-full">+8.3%</div>
                </div>
                <div className="w-full h-64">
                  <Line
                    data={visitorData}
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            display: true,
                            drawBorder: false,
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                            drawBorder: false,
                          }
                        }
                      },
                      animation: {
                        duration: 1000,
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;