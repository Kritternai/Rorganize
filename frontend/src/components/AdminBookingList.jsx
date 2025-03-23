import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ClipboardList, RefreshCw, Search, User, Phone, Mail, Calendar,
  Clock, Home, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";
import "@fontsource/prompt";
import AdminSidebar from "./AdminSidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminBookingList = ({ token }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง:", error);
    } finally {
      setLoading(false);
    }
  };
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const filteredBookings = bookings.filter(b =>
    (b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "all" || b.status === filterStatus)
  );

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length
  };

  const statusConfig = {
    pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle size={16} /> },
    confirmed: { label: "ยืนยันแล้ว", color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} /> },
    cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800", icon: <XCircle size={16} /> }
  };

  return (
    <>
      <div className="flex font-[Prompt]">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {/* หัวข้อ */}
        <header className="bg-white shadow-md p-6 rounded-xl flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">📋 ข้อมูลการจอง</h2>
            <p className="text-gray-500">จัดการและติดตามข้อมูลการจองห้องพัก</p>
          </div>
          <button
            onClick={refreshData}
            className={`flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${
              isRefreshing ? "opacity-75" : ""
            }`}
          >
            <RefreshCw className={isRefreshing ? "animate-spin" : ""} size={18} />
            <span>รีเฟรช</span>
          </button>
        </header>

        {/* สถิติ */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="การจองทั้งหมด" count={bookingStats.total} icon={<ClipboardList size={20} />} color="gray" />
          <StatCard label="รอดำเนินการ" count={bookingStats.pending} icon={<AlertTriangle size={20} />} color="yellow" />
          <StatCard label="ยืนยันแล้ว" count={bookingStats.confirmed} icon={<CheckCircle size={20} />} color="green" />
          <StatCard label="ยกเลิก" count={bookingStats.cancelled} icon={<XCircle size={20} />} color="red" />
        </div>

        {/* ค้นหา + ฟิลเตอร์ */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อหรืออีเมล"
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">ทุกสถานะ</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="confirmed">ยืนยันแล้ว</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        {/* ตาราง */}
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">ชื่อผู้จอง</th>
                <th className="px-6 py-3 text-left">ข้อมูลติดต่อ</th>
                <th className="px-6 py-3 text-left">รายละเอียดการจอง</th>
                <th className="px-6 py-3 text-left">ข้อมูลห้องพัก</th>
                <th className="px-6 py-3 text-left">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{booking.name}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex items-center gap-2"><Phone size={14} /> {booking.phone}</div>
                      <div className="flex items-center gap-2 text-gray-500"><Mail size={14} /> {booking.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex items-center gap-2"><Calendar size={14} /> {booking.check_in_date}</div>
                      <div className="flex items-center gap-2 text-gray-500"><Clock size={14} /> {booking.duration} เดือน</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex items-center gap-2"><Home size={14} /> ห้อง {booking.room_number || "-"}</div>
                      <div className="text-xs text-gray-500 mt-1">ชั้น {booking.floor || "-"}, {booking.size || "-"} ตร.ม. ({booking.type || "-"})</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsStatusModalOpen(true);
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status]?.color} hover:opacity-80 transition`}
                      >
                        {statusConfig[booking.status]?.icon}
                        {statusConfig[booking.status]?.label}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    ไม่พบข้อมูลการจอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      <ToastContainer position="top-right" autoClose={3000} />
      </div>
      {isStatusModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">อัปเดตสถานะการจอง</h3>
            <p className="text-gray-600 mb-4">
              เปลี่ยนสถานะของ <span className="font-semibold">{selectedBooking.name}</span> สำหรับห้อง {selectedBooking.room_number}
            </p>
            <select
              className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedBooking.status}
            onChange={async (e) => {
              const newStatus = e.target.value;
              if (!selectedBooking?.id) {
                toast(
                  <div className="flex items-center space-x-2 font-[Prompt] text-yellow-700">
                    <AlertTriangle size={20} className="text-yellow-500" />
                    <span>ไม่พบข้อมูลการจองที่เลือก</span>
                  </div>
                );
                return;
              }

              console.log("📦 Updating status for booking ID:", selectedBooking.id);

              try {
                await axios.put(
                  `http://localhost:3001/api/bookings/${selectedBooking.id}/status`,
                  { status: newStatus },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
                fetchBookings();
                setIsStatusModalOpen(false);
                toast(
                  <div className="flex items-center space-x-2 font-[Prompt] text-green-700">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>อัปเดตสถานะเรียบร้อย</span>
                  </div>
                );
              } catch (error) {
                console.error("Error updating status:", error);
                toast(
                  <div className="flex items-center space-x-2 font-[Prompt] text-red-700">
                    <XCircle size={20} className="text-red-500" />
                    <span>ไม่สามารถอัปเดตสถานะได้</span>
                  </div>
                );
              }
            }}
            >
              <option value="pending">รอดำเนินการ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

// 🔹 Component แสดงการ์ดสถิติ
const StatCard = ({ label, count, icon, color }) => {
  const colorMap = {
    gray: "border-gray-500 bg-gray-100 text-gray-700",
    yellow: "border-yellow-500 bg-yellow-100 text-yellow-700",
    green: "border-green-500 bg-green-100 text-green-700",
    red: "border-red-500 bg-red-100 text-red-700"
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 ${colorMap[color]} flex items-center justify-between`}>
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <div className="p-3 rounded-full bg-white shadow">{icon}</div>
    </div>
  );
};

export default AdminBookingList;