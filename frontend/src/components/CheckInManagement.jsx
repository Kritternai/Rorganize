import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ClipboardList, RefreshCw, Search, Home, CheckCircle, XCircle, AlertTriangle, Plus, Save, Camera
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import "@fontsource/prompt";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CheckInManagement = () => {
    const token = localStorage.getItem("admin_token");
  const [rooms, setRooms] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewCheckIn, setViewCheckIn] = useState(null);

  const [form, setForm] = useState({
    tenantName: "",
    contractId: "",
    waterMeter: "",
    electricityMeter: "",
    keyCardDelivered: false,
    assetNote: "",
    rulesAcknowledged: false,
    propertyCondition: "",
    roomPhotos: [],
    handoverNote: ""
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      console.error("❌ Error fetching rooms:", err);
      toast.error("ไม่สามารถดึงข้อมูลห้องพักได้", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckIns = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/checkin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCheckIns(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching check-ins:", err);
      toast.error("ไม่สามารถดึงข้อมูลการเช็คอินได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching contracts:", err);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchRooms();
    await fetchCheckIns();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchRooms();
      await fetchContracts();
      await fetchCheckIns();
    };
    fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handlePhotoUpload = (e) => {
    setForm({
      ...form,
      roomPhotos: Array.from(e.target.files)
    });
  };

  const handleSubmitCheckIn = async () => {
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === "roomPhotos") {
          form[key].forEach(photo => formData.append("roomPhotos", photo));
        } else {
          formData.append(key, form[key]);
        }
      });

      const response = await axios.post("http://localhost:3001/api/checkin", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });

      toast.success("✅ " + response.data.message, {
        position: "top-right",
        autoClose: 3000,
      });
      setShowModal(false);
      refreshData();
    } catch (error) {
      console.error("❌ Error submitting check-in:", error);
      toast.error("ไม่สามารถบันทึกการเช็คอินได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Check-in statistics
  const checkInStats = {
    total: rooms.length,
    checkedIn: checkIns.length,
    available: rooms.length - checkIns.length
  };

  // Filtered rooms
  const filteredRooms = rooms.filter(room => 
    room.room_number.toString().includes(searchTerm) ||
    (room.floor && room.floor.toString().includes(searchTerm))
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-[Prompt] overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 p-6 ml-[0] max-w-full md:max-w-[calc(100% - 260px)]">
        {/* Header */}
        <header className="bg-white shadow-md p-4 md:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">📋 การจัดการเช็คอิน</h2>
            <p className="text-gray-500">ติดตามและจัดการการเช็คอินของผู้เช่า</p>
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

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard label="ห้องทั้งหมด" count={checkInStats.total} icon={<Home size={20} />} color="blue" />
          <StatCard label="เช็คอินแล้ว" count={checkInStats.checkedIn} icon={<CheckCircle size={20} />} color="green" />
          <StatCard label="ห้องว่าง" count={checkInStats.available} icon={<XCircle size={20} />} color="red" />
        </div>

        {/* Search and Add */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="relative md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาเลขห้อง หรือชั้น"
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-xl shadow-md flex justify-center items-center">
            <div className="flex flex-col items-center text-gray-500">
              <RefreshCw className="animate-spin mb-3" size={32} />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const contract = contracts.find(c => c.room_id === room.id);
                const checkInData = contract ? checkIns.find(ci => ci.contract_id == contract.id) : null;
                return (
                  <div key={room.id} className="bg-white p-0 rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-100">
                    <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${checkInData ? 'bg-gray-100' : 'bg-green-100'}`}>
                          <Home size={20} className={checkInData ? 'text-gray-600' : 'text-green-600'} />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            ห้อง {room.room_number}
                          </h2>
                          <p className="text-xs text-gray-500">รหัสห้อง: {room.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50">
                      <div className="flex justify-between text-sm mb-2">
                        <div className="flex items-center">
                          <Home size={14} className="mr-1 text-gray-500" />
                          <span className="text-gray-700">ชั้น {room.floor}</span>
                        </div>
                        <div className="text-gray-700">{room.size} ตร.ม.</div>
                      </div>

                      {checkInData ? (
                        <button
                          onClick={() => setViewCheckIn(checkInData)}
                          className="w-full flex items-center justify-center text-sm px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                        >
                          <ClipboardList size={16} className="mr-1" />
                          ดูข้อมูลเช็คอิน
                        </button>
                      ) : (
                      <button
                          onClick={() => {
                            const contract = contracts.find(c => c.room_id === room.id);
                            if (contract) {
                              setForm(prev => ({
                                ...prev,
                                tenantName: contract.tenant_name || "",
                                contractId: contract.id.toString()
                              }));
                            }
                            setSelectedRoom(room);
                            setShowModal(true);
                          }}
                          className="w-full flex items-center justify-center text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                          <Plus size={16} className="mr-1" />
                          เพิ่มการเช็คอิน
                      </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 bg-white p-8 rounded-xl shadow text-center text-gray-500">
                <AlertTriangle size={40} className="mx-auto mb-2 text-yellow-500" />
                <p className="text-lg">ไม่พบข้อมูลห้องพักที่ต้องการ</p>
                <p className="text-sm mt-1">ลองค้นหาด้วยคำอื่น หรือล้างการค้นหา</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h2 className="text-xl font-semibold flex items-center">
                <ClipboardList size={20} className="mr-2" />
                เช็คอินห้อง {selectedRoom.room_number}
              </h2>
              <p className="text-blue-100 text-sm mt-1">กรอกข้อมูลการเช็คอินให้ครบถ้วน</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้เช่า</label>
                  <input
                    type="text"
                    name="tenantName"
                    value={form.tenantName}
                    onChange={handleInputChange}
                    placeholder="ชื่อ-นามสกุล"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสสัญญา</label>
                  <input
                    type="text"
                    name="contractId"
                    value={form.contractId}
                    onChange={handleInputChange}
                    placeholder="รหัสสัญญาเช่า"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">มิเตอร์น้ำ</label>
                  <input
                    type="text"
                    name="waterMeter"
                    value={form.waterMeter}
                    onChange={handleInputChange}
                    placeholder="เลขมิเตอร์น้ำ"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">มิเตอร์ไฟฟ้า</label>
                  <input
                    type="text"
                    name="electricityMeter"
                    value={form.electricityMeter}
                    onChange={handleInputChange}
                    placeholder="เลขมิเตอร์ไฟฟ้า"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">สภาพห้อง</label>
                <textarea
                  name="propertyCondition"
                  value={form.propertyCondition}
                  onChange={handleInputChange}
                  placeholder="บันทึกสภาพห้องพัก"
                  rows="3"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อัปโหลดรูปภาพห้อง</label>
                  <input
                    type="file"
                    name="roomPhotos"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full border border-gray-300 px-3 py-2 rounded-lg file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="keyCardDelivered"
                        checked={form.keyCardDelivered}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      <span className="ml-2">ส่งคีย์การ์ดแล้ว</span>
                    </label>
                  </div>
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="rulesAcknowledged"
                        checked={form.rulesAcknowledged}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      <span className="ml-2">รับทราบกฎระเบียบ</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">บันทึกการส่งมอบ</label>
                <textarea
                  name="handoverNote"
                  value={form.handoverNote}
                  onChange={handleInputChange}
                  placeholder="บันทึกเพิ่มเติมในการส่งมอบ"
                  rows="3"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmitCheckIn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save size={18} className="inline-block mr-2" />
                  บันทึกการเช็คอิน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Check-in Modal */}
      {viewCheckIn && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gray-700 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <ClipboardList size={20} className="mr-2" />
                รายละเอียดการเช็คอิน
              </h2>
              <button onClick={() => setViewCheckIn(null)} className="text-white hover:text-gray-300">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 text-sm text-gray-700 space-y-3">
              <p><strong>ห้อง:</strong> {rooms.find(r => r.id === viewCheckIn.contract_id)?.room_number || "ไม่ทราบ"}</p>
              <p><strong>ผู้เช่า:</strong> {viewCheckIn.tenant_name}</p>
              <p><strong>วันที่เช็คอิน:</strong> {new Date(viewCheckIn.check_in_date).toLocaleDateString()}</p>
              <p><strong>มิเตอร์น้ำ:</strong> {viewCheckIn.water_meter}</p>
              <p><strong>มิเตอร์ไฟฟ้า:</strong> {viewCheckIn.electricity_meter}</p>
              <p><strong>สภาพห้อง:</strong> {viewCheckIn.property_condition || "ไม่มีบันทึก"}</p>
              {viewCheckIn.room_photos && viewCheckIn.room_photos.length > 0 && (
                <div>
                  <strong>รูปภาพห้อง:</strong>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {viewCheckIn.room_photos.map((photo, index) => (
                      <img 
                        key={index} 
                        src={`http://localhost:3001/uploads/${photo}`} 
                        alt={`Room photo ${index + 1}`} 
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// Reusable StatCard component
const StatCard = ({ label, count, icon, color }) => {
  const colorMap = {
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    green: "border-green-500 bg-green-100 text-green-700",
    red: "border-red-500 bg-red-100 text-red-700"
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 ${colorMap[color]} flex items-center justify-between`}>
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <div className="p-3 rounded-full bg-white shadow-sm">{icon}</div>
    </div>
  );
};

export default CheckInManagement;