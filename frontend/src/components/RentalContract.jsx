import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText, RefreshCw, Search, User, Calendar, Home, 
  CheckCircle, XCircle, AlertTriangle, Plus, Save, Printer
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import "@fontsource/prompt";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RentalContract = ({ token }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    tenant_id: "",
    room_id: "",
    start_date: "",
    end_date: "",
    rent_amount: "",
    deposit_amount: "",
    status: "active",
    guarantor_name: "",
    contract_note: ""
  });
  const [tenantForm, setTenantForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    emergency_contact: ""
  });

  useEffect(() => {
    fetchRooms();
  }, [token]);

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

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchRooms();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleOpenModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      ...formData,
      room_id: room.id,
      rent_amount: room.rent_price,
      deposit_amount: room.deposit
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTenantInputChange = (e) => {
    const { name, value } = e.target;
    setTenantForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTenant = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/tenants", {
        fullname: tenantForm.fullname,
        email: tenantForm.email,
        phone: tenantForm.phone,
        emergency_contact: tenantForm.emergency_contact
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newTenant = res.data;
      toast.success("✅ เพิ่มผู้เช่าสำเร็จ", { position: "top-right", autoClose: 3000 });

      // นำ tenant_id ที่ได้มาใส่ใน formData
      setFormData((prev) => ({ ...prev, tenant_id: newTenant.id }));
    } catch (error) {
      console.error("❌ Error creating tenant:", error);
      toast.error("ไม่สามารถเพิ่มผู้เช่าได้", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleSubmitContract = async () => {
    try {
      if (!formData.start_date || !formData.end_date) {
        toast.warning("กรุณากรอกข้อมูลให้ครบถ้วน", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      
      if (!formData.tenant_id) {
        const tenantRes = await axios.post("http://localhost:3001/api/tenants", tenantForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        formData.tenant_id = tenantRes.data.id;
      }

      // สร้าง object ข้อมูลเพื่อส่งไปยัง API แทนการใช้ FormData
      const contractData = {
        tenant_id: formData.tenant_id,
        room_id: formData.room_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        rent_amount: formData.rent_amount,
        deposit_amount: formData.deposit_amount,
        status: formData.status,
        guarantor_name: formData.guarantor_name,
        contract_note: formData.contract_note
      };

      await axios.post("http://localhost:3001/api/contracts", {
        ...contractData,
        tenant_id: formData.tenant_id
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("บันทึกสัญญาเช่าสำเร็จ", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowModal(false);
      refreshData();
    } catch (error) {
      console.error("❌ Error saving contract:", error);
      toast.error("ไม่สามารถบันทึกสัญญาได้ กรุณาตรวจสอบข้อมูล", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // กรองห้องพักตามคำค้นหา
  const filteredRooms = rooms.filter(room => 
    room.room_number.toString().includes(searchTerm) ||
    (room.floor && room.floor.toString().includes(searchTerm))
  );

  // สถิติห้องพัก
  const roomStats = {
    total: rooms.length,
    available: rooms.filter(r => !r.is_occupied).length,
    occupied: rooms.filter(r => r.is_occupied).length
  };

  // สถานะสัญญา
  const statusConfig = {
    active: { label: "กำลังใช้งาน", color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} /> },
    completed: { label: "สิ้นสุด", color: "bg-gray-100 text-gray-800", icon: <CheckCircle size={16} /> },
    terminated: { label: "ยกเลิก", color: "bg-red-100 text-red-800", icon: <XCircle size={16} /> }
  };
  
  const [contracts, setContracts] = useState([]);
  
  useEffect(() => {
    if (token) {
      fetchContracts();
    }
  }, [token]);
  
  const fetchContracts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        setContracts(res.data);
      } else {
        console.warn("Unexpected contracts response:", res.data);
        setContracts([]);
      }
    } catch (err) {
      console.error("❌ Error fetching contracts:", err);
      setContracts([]);
    }
  };
  
  const contractStats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    completed: contracts.filter(c => c.status === "completed").length,
    terminated: contracts.filter(c => c.status === "terminated").length
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-[Prompt] overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 p-6 ml-[0] max-w-full md:max-w-[calc(100% - 260px)]">
        {/* หัวข้อ */}
        <header className="bg-white shadow-md p-4 md:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">📋 จัดการสัญญาเช่า</h2>
            <p className="text-gray-500">สร้างและจัดการสัญญาเช่าสำหรับห้องพัก</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="สัญญาทั้งหมด" count={contractStats.total} icon={<FileText size={20} />} color="blue" />
          <StatCard label="สถานะสัญญา (กำลังใช้งาน)" count={contractStats.active} icon={<CheckCircle size={20} />} color="green" />
          <StatCard label="สถานะสัญญา (สิ้นสุด)" count={contractStats.completed} icon={<CheckCircle size={20} />} color="gray" />
          <StatCard label="สถานะสัญญา (ยกเลิก)" count={contractStats.terminated} icon={<XCircle size={20} />} color="red" />
        </div>

        {/* ค้นหา */}
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
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
            onClick={() => {
              if (rooms.length > 0) {
                handleOpenModal(rooms[0]);
              }
            }}
          >
            <Plus size={18} className="mr-2" />
            สร้างสัญญาใหม่
          </button>
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
              filteredRooms.map((room) => (
                <div key={room.id} className="bg-white p-0 rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-100">
                  <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${room.is_occupied ? 'bg-gray-100' : 'bg-green-100'}`}>
                        <Home size={20} className={room.is_occupied ? 'text-gray-600' : 'text-green-600'} />
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
                    <div className="flex justify-between text-sm text-gray-700 mb-4">
                      <div>ค่าเช่า: <span className="font-bold text-blue-700">{room.rent_price.toLocaleString()} บาท</span></div>
                      <div>ประกัน: <span className="font-medium">{room.deposit.toLocaleString()} บาท</span></div>
                    </div>

                    <button
                      onClick={() => handleOpenModal(room)}
                      className="w-full flex items-center justify-center text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus size={16} className="mr-1" />
                      {room.is_occupied ? 'สร้างสัญญาใหม่' : 'เพิ่มสัญญาเช่า'}
                    </button>
                  </div>
                </div>
              ))
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

      {/* Modal for creating contract */}
      {showModal && selectedRoom && (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FileText size={20} className="mr-2" />
          สร้างสัญญาเช่าสำหรับห้อง {selectedRoom.room_number}
        </h2>
        <p className="text-blue-100 text-sm mt-1">กรอกข้อมูลให้ครบเพื่อบันทึกและสร้างสัญญา</p>
      </div>

      <div className="p-6 overflow-y-auto max-h-[80vh]">
        <div className="bg-blue-50 p-3 rounded-lg mb-6 flex items-center">
          <AlertTriangle size={20} className="text-blue-600 mr-2" />
          <p className="text-sm text-blue-800">
            ข้อมูลสัญญาจะถูกบันทึกลงในฐานข้อมูลหลังจากกด "บันทึกสัญญา"
          </p>
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้เช่า</label>
                <input
                  type="text"
                  name="fullname"
                  value={tenantForm.fullname}
                  onChange={handleTenantInputChange}
                  placeholder="ชื่อ-นามสกุล"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={tenantForm.email}
                  onChange={handleTenantInputChange}
                  placeholder="example@email.com"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  name="phone"
                  value={tenantForm.phone}
                  onChange={handleTenantInputChange}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์ติดต่อฉุกเฉิน</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={tenantForm.emergency_contact}
                  onChange={handleTenantInputChange}
                  placeholder="กรอกเบอร์ติดต่อฉุกเฉิน"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <button
                onClick={handleCreateTenant}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                บันทึกผู้เช่า
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะสัญญา</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
              >
                <option value="active">กำลังใช้งาน</option>
                <option value="completed">สิ้นสุด</option>
                <option value="terminated">ยกเลิก</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มสัญญา</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุดสัญญา</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ค่าเช่า (บาท)</label>
              <input
                type="number"
                name="rent_amount"
                value={formData.rent_amount}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ค่าประกัน (บาท)</label>
              <input
                type="number"
                name="deposit_amount"
                value={formData.deposit_amount}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">เงื่อนไขพิเศษ (ถ้ามี)</label>
          <textarea
            name="special_terms"
            placeholder="เช่น ค่าน้ำ/ไฟเพิ่มเติม การต่ออายุ ฯลฯ"
            rows="3"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ค้ำประกัน</label>
            <input
              type="text"
              name="guarantor_name"
              value={formData.guarantor_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg"
              placeholder="กรอกชื่อผู้ค้ำประกัน"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุสัญญา</label>
            <textarea
              name="contract_note"
              value={formData.contract_note}
              onChange={handleInputChange}
              rows="3"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg"
              placeholder="รายละเอียดอื่น ๆ เช่น เงื่อนไขเพิ่มเติม"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">แนบเอกสารสัญญา (PDF)</label>
          <input
            type="file"
            name="document"
            accept=".pdf"
            className="block w-full border border-gray-300 px-3 py-2 rounded-lg file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <XCircle size={18} className="inline-block mr-2" />
            ยกเลิก
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              window.print();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Printer size={18} className="inline-block mr-2" />
            พิมพ์
          </button>
          <button
            onClick={handleSubmitContract}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save size={18} className="inline-block mr-2" />
            บันทึกสัญญา
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// Component แสดงการ์ดสถิติ
const StatCard = ({ label, count, icon, color }) => {
  const colorMap = {
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    gray: "border-gray-500 bg-gray-100 text-gray-700",
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

export default RentalContract;