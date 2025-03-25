import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ClipboardList,
  RefreshCw,
  Search,
  Home,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Save,
  CalendarCheck2,
  X
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import "@fontsource/prompt";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StatCard = ({ label, count, icon, color }) => {
  const colorMap = {
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    green: "border-green-500 bg-green-100 text-green-700",
    red: "border-red-500 bg-red-100 text-red-700",
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

const CheckoutManagement = () => {
  const token = localStorage.getItem("admin_token");
  const [rooms, setRooms] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contracts, setContracts] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewCheckout, setViewCheckout] = useState(null);
  const [form, setForm] = useState({
    inspection_date: "",
    damage_note: "",
    water_meter: "",
    electricity_meter: "",
    outstanding_costs: "",
    refund_note: "",
    deduction: "",
    total_refund: "",
    contract_id: ""
  });

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลห้องได้");
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(res.data);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลสัญญาได้");
    }
  };

  const fetchCheckouts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/checkout", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCheckouts(res.data);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลการย้ายออกได้");
    }
  };

  const fetchCheckIns = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/checkin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCheckIns(res.data);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลการเข้าพักได้");
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchRooms();
    await fetchContracts();
    await fetchCheckIns();
    await fetchCheckouts();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const init = async () => {
      await fetchRooms();
      await fetchContracts();
      await fetchCheckIns();
      await fetchCheckouts();
      setLoading(false);
    };
    init();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitCheckout = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/checkout", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      setShowModal(false);
      refreshData();
    } catch (err) {
      toast.error("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.room_number.toString().includes(searchTerm) ||
    (room.floor && room.floor.toString().includes(searchTerm))
  );

  const checkoutStats = {
    total: rooms.length,
    checkedOut: checkouts.length,
    remaining: rooms.length - checkouts.length
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-[Prompt]">
      <AdminSidebar />
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="bg-white shadow-md p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">📦 การจัดการย้ายออก</h2>
            <p className="text-gray-500">ตรวจสอบและคืนเงินประกันหลังการย้ายออก</p>
          </div>
          <button
            onClick={refreshData}
            className={`flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${isRefreshing ? "opacity-75" : ""}`}
          >
            <RefreshCw className={isRefreshing ? "animate-spin" : ""} size={18} />
            <span className="ml-2">รีเฟรช</span>
          </button>
        </header>

        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard label="ห้องทั้งหมด" count={checkoutStats.total} icon={<Home size={20} />} color="blue" />
          <StatCard label="ย้ายออกแล้ว" count={checkoutStats.checkedOut} icon={<CheckCircle size={20} />} color="green" />
          <StatCard label="ยังไม่ย้ายออก" count={checkoutStats.remaining} icon={<XCircle size={20} />} color="red" />
        </div>
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาเลขห้อง หรือชั้น"
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRooms.map(room => {
          const contract = contracts.find(c => c.room_id === room.id);
          const checkout = contract ? checkouts.find(co => co.contract_id == contract.id) : null;
          const checkIn = contract ? checkIns.find(ci => ci.contract_id == contract.id) : null;
          return (
              <div key={room.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-bold text-gray-800">ห้อง {room.room_number}</h3>
                  <p className="text-xs text-gray-500">ชั้น {room.floor} • {room.size} ตร.ม.</p>
                </div>
                <div className="p-4 bg-gray-50">
                  {!checkout && checkIn ? (
                    <button
                      onClick={() => {
                        if (contract) setForm(prev => ({ ...prev, contract_id: contract.id.toString() }));
                        setSelectedRoom(room);
                        setShowModal(true);
                      }}
                      className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={16} className="inline-block mr-1" /> เพิ่มการย้ายออก
                    </button>
                  ) : checkout ? (
                    <button
                      onClick={() => setViewCheckout(checkout)}
                      className="w-full px-3 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                    >
                      <ClipboardList size={16} className="inline-block mr-1" /> ดูรายละเอียด
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Add Checkout */}
        {showModal && selectedRoom && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-xl font-semibold">🚪 ย้ายออกห้อง {selectedRoom.room_number}</h2>
                <p className="text-sm text-blue-100">กรอกข้อมูลการย้ายออกให้ครบถ้วน</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" name="inspection_date" value={form.inspection_date} onChange={handleInputChange} className="border px-3 py-2 rounded-lg w-full" placeholder="วันที่ตรวจสอบ" />
                  <input type="number" name="water_meter" value={form.water_meter} onChange={handleInputChange} className="border px-3 py-2 rounded-lg w-full" placeholder="มิเตอร์น้ำ" />
                  <input type="number" name="electricity_meter" value={form.electricity_meter} onChange={handleInputChange} className="border px-3 py-2 rounded-lg w-full" placeholder="มิเตอร์ไฟฟ้า" />
                  <input type="number" name="outstanding_costs" value={form.outstanding_costs} onChange={handleInputChange} className="border px-3 py-2 rounded-lg w-full" placeholder="ค่าใช้จ่ายคงค้าง" />
                </div>
                <textarea name="damage_note" value={form.damage_note} onChange={handleInputChange} className="w-full border px-3 py-2 rounded-lg" placeholder="รายละเอียดความเสียหาย" rows="2" />
                <textarea name="refund_note" value={form.refund_note} onChange={handleInputChange} className="w-full border px-3 py-2 rounded-lg" placeholder="หมายเหตุการคืนเงิน" rows="2" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" name="deduction" value={form.deduction} onChange={handleInputChange} className="border px-3 py-2 rounded-lg w-full" placeholder="หักค่าเสียหาย" />
                  <input type="number" name="total_refund" value={form.total_refund} onChange={handleInputChange} className="border px-3 py-2 rounded-lg w-full" placeholder="ยอดคืนสุทธิ" />
                </div>
                <div className="flex justify-end gap-2 border-t pt-4">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    ยกเลิก
                  </button>
                  <button onClick={handleSubmitCheckout} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Save size={18} className="inline-block mr-2" /> บันทึกข้อมูล
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Checkout Detail Modal */}
        {viewCheckout && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-xl w-full rounded-xl shadow-xl">
              <div className="bg-gray-700 text-white p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">รายละเอียดการย้ายออก</h2>
                <button onClick={() => setViewCheckout(null)}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-2 text-sm text-gray-700">
                <p><strong>วันที่ตรวจ:</strong> {viewCheckout.inspection_date}</p>
                <p><strong>มิเตอร์น้ำ:</strong> {viewCheckout.water_meter}</p>
                <p><strong>มิเตอร์ไฟฟ้า:</strong> {viewCheckout.electricity_meter}</p>
                <p><strong>ความเสียหาย:</strong> {viewCheckout.damage_note}</p>
                <p><strong>ค่าใช้จ่ายคงค้าง:</strong> {viewCheckout.outstanding_costs}</p>
                <p><strong>หมายเหตุคืนเงิน:</strong> {viewCheckout.refund_note}</p>
                <p><strong>หักค่าเสียหาย:</strong> {viewCheckout.deduction}</p>
                <p><strong>ยอดคืนสุทธิ:</strong> {viewCheckout.total_refund}</p>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default CheckoutManagement;