import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Home, UserPlus, Save, XCircle, RefreshCw
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fontsource/prompt";

const UserSettings = () => {
  const token = localStorage.getItem("admin_token");
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      toast.error("ไม่สามารถดึงข้อมูลห้องพักได้");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchRooms();
    await fetchUsers();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    refreshData();
  }, [token]);

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:3001/api/users/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ แก้ไขผู้ใช้สำเร็จ");
      } else {
        await axios.post("http://localhost:3001/api/register", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ เพิ่มผู้ใช้สำเร็จ");
      }
      setShowModal(false);
      refreshData();
    } catch (err) {
      toast.error("❌ ไม่สามารถบันทึกผู้ใช้ได้");
    }
  };

  const openModal = (room) => {
    setSelectedRoom(room);
    const existingUser = users.find(u => u.username === `room${room.room_number}`);
    if (existingUser) {
      setForm({ ...existingUser, password: "" });
      setIsEditMode(true);
    } else {
      setForm({ username: `room${room.room_number}`, password: "123456", role: "user" });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const findUserByRoom = (roomNumber) => {
    return users.find(user => user.username === `room${roomNumber}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-[Prompt]">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">👤 ตั้งค่าผู้ใช้งาน</h2>
          <button
            onClick={refreshData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <RefreshCw className={isRefreshing ? "animate-spin" : ""} size={18} />
            <span>รีเฟรช</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const existingUser = findUserByRoom(room.room_number);
            return (
              <div key={room.id} className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Home size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-800">
                        ห้อง {room.room_number}
                      </div>
                      <div className="text-sm text-gray-500">ชั้น {room.floor}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openModal(room)}
                  className={`w-full flex items-center justify-center text-sm px-3 py-2 text-white rounded-lg transition ${existingUser ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  <UserPlus size={16} className="mr-1" />
                  {existingUser ? "แก้ไขผู้ใช้ห้องนี้" : "เพิ่มผู้ใช้ให้ห้องนี้"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {showModal && selectedRoom && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-lg font-semibold">
                  {isEditMode ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานให้ห้อง"} {selectedRoom.room_number}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">ชื่อผู้ใช้</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">รหัสผ่าน</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-4 flex justify-end space-x-2 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Save size={16} className="inline mr-1" /> {isEditMode ? "บันทึกการแก้ไข" : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default UserSettings;