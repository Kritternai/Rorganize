import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Home, Users, Bed, Calendar, Edit, Trash, Plus, Search, Filter, RefreshCw, ArrowUpDown, CheckCircle, XCircle, Clock, Wrench, X, CreditCard, ClipboardList, FileText, Trash2, Save, Image as ImageIcon, AlertTriangle } from "lucide-react";
import "@fontsource/prompt";
import "tailwindcss/tailwind.css";
import AdminSidebar from "./AdminSidebar";
import { Link } from "react-router-dom";

const RoomListStatus = ({ token }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("room_number");
  const [sortDirection, setSortDirection] = useState("asc");
  const navigate = useNavigate();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: "",
    type: "",
    floor: "",
    size: "",
    rent_price: "",
    deposit: "",
    water_price: "",
    electricity_price: "",
    status: "available",
    facilities: "",
    description: ""
  });
  // Define facilityOptions array to be used throughout the component
  const facilityOptions = [
    "เครื่องปรับอากาศ",
    "เครื่องทำน้ำอุ่น",
    "ตู้เย็น",
    "โทรทัศน์",
    "โต๊ะทำงาน",
    "เตียง",
    "ตู้เสื้อผ้า",
    "อินเทอร์เน็ต",
    "โซฟา"
  ];

  // สถานะห้องพักและสีที่เกี่ยวข้อง
  const roomStatusConfig = {
    available: {
      label: "ว่าง",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      icon: <CheckCircle size={16} className="text-green-500" />
    },
    occupied: {
      label: "มีผู้เช่า",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      icon: <Users size={16} className="text-blue-500" />
    },
    reserved: {
      label: "จองแล้ว",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      icon: <Clock size={16} className="text-yellow-500" />
    },
    maintenance: {
      label: "กำลังซ่อม",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      icon: <Wrench size={16} className="text-red-500" />
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchRooms();
  }, [token, navigate]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
      setError("");
    } catch (error) {
      setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้");
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchRooms();
      // แสดงอนิเมชั่นประมาณ 1 วินาที
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setIsRefreshing(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // จัดการกรองและการเรียงลำดับข้อมูล
  const filteredAndSortedRooms = () => {
    let result = [...rooms];

    // กรองตามคำค้นหา
    if (searchTerm) {
      result = result.filter(room => 
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // กรองตามสถานะ
    if (filterStatus !== "all") {
      result = result.filter(room => room.status === filterStatus);
    }

    // เรียงลำดับ
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // จัดการกับค่า null หรือ undefined
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // ตรวจสอบประเภทข้อมูลและเปรียบเทียบ
      if (typeof aValue === 'string') {
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        if (sortDirection === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    });

    return result;
  };

  // สถิติห้องตามสถานะ
  const roomStats = {
    total: rooms.length,
    available: rooms.filter(room => room.status === "available").length,
    occupied: rooms.filter(room => room.status === "occupied").length,
    reserved: rooms.filter(room => room.status === "reserved").length,
    maintenance: rooms.filter(room => room.status === "maintenance").length
  };
// ✅ จัดการ Form แก้ไขห้องพักและรูปภาพใน Modal

// 👉 ใช้ในไฟล์ที่มีการแก้ไขห้องพัก เช่น AdminRoomList.jsx หรือ AdminRoomManagement.jsx

// ✅ การจัดการ input และ form data
const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleEditFacilityChange = (e) => {
    const facility = e.target.value;
  
    if (formData.facilities?.includes(facility)) {
      setFormData({
        ...formData,
        facilities: formData.facilities.filter(item => item !== facility)
      });
    } else {
      setFormData({
        ...formData,
        facilities: [...(formData.facilities || []), facility]
      });
    }
  };
  
  // ✅ จัดการแสดงข้อมูลเมื่อกดไอคอนแก้ไข
  const handleEditClick = (room) => {
    setSelectedRoom(room);
    setFormData({
      room_number: room.room_number,
      type: room.type,
      floor: room.floor,
      size: room.size,
      rent_price: room.rent_price,
      deposit: room.deposit || "",
      water_price: room.water_price || "",
      electricity_price: room.electricity_price || "",
      status: room.status,
      facilities: Array.isArray(room.facilities) ? room.facilities : JSON.parse(room.facilities || "[]"),
      description: room.description || "",
      images: [],
      cover_image: null
    });
  
    setCurrentImages({
      cover: room.cover_image,
      images: Array.isArray(room.images) ? room.images : JSON.parse(room.images || "[]")
    });
  
    setIsEditModalOpen(true);
  };
  
  // ✅ จัดการอัปเดตข้อมูลห้องพัก
  const handleUpdateRoom = async () => {
    try {
      const data = new FormData();
  
      for (const key in formData) {
        if (key === "facilities") {
          data.append("facilities", JSON.stringify(formData.facilities || []));
        } else if (key === "images") {
          formData.images.forEach((img) => img && data.append("images", img));
        } else if (key === "cover_image") {
          if (formData.cover_image) data.append("cover_image", formData.cover_image);
        } else {
          data.append(key, formData[key]);
        }
      }
  
      await axios.put(`http://localhost:3001/api/rooms/${selectedRoom.id}`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
  
      setIsEditModalOpen(false);
      fetchRooms();
    } catch (error) {
      console.error("Error updating room:", error);
      setError("❌ ไม่สามารถอัปเดตข้อมูลห้องพักได้");
    }
  };
  
  const handleDeleteClick = (room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteRoom = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/rooms/${selectedRoom.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleteModalOpen(false);
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      setError("❌ ไม่สามารถลบข้อมูลห้องพักได้");
    }
  };
  
  // ✅ การจัดการรูปภาพ
  const [currentImages, setCurrentImages] = useState({
    cover: null,
    images: []
  });
  
  const handleAddImageField = () => {
    setCurrentImages((prev) => ({
      ...prev,
      images: [...prev.images, null]
    }));
  };
  
  const handleEditImageChange = (e, index) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
  
      reader.onload = (event) => {
        if (index === "cover") {
          setCurrentImages((prev) => ({ ...prev, cover: event.target.result }));
          setFormData((prev) => ({ ...prev, cover_image: file }));
        } else {
          const newPreviews = [...currentImages.images];
          newPreviews[index] = event.target.result;
          setCurrentImages((prev) => ({ ...prev, images: newPreviews }));
  
          const formImgs = formData.images || [];
          formImgs[index] = file;
          setFormData((prev) => ({ ...prev, images: formImgs }));
        }
      };
  
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = (index) => {
    if (index === "cover") {
      setCurrentImages((prev) => ({ ...prev, cover: null }));
      setFormData((prev) => {
        const updated = { ...prev };
        delete updated.cover_image;
        return updated;
      });
    } else {
      const updatedPreviews = currentImages.images.filter((_, i) => i !== index);
      setCurrentImages((prev) => ({ ...prev, images: updatedPreviews }));
  
      const updatedFormImgs = (formData.images || []).filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: updatedFormImgs }));
    }
  };

  return (
    <AdminSidebar>
    <div className="p-6 bg-gray-50 min-h-screen font-[Prompt]">
      {/* หัวข้อ */}
      <header className="bg-white shadow-md p-6 rounded-xl flex justify-between items-center mb-8 transition-all duration-300 hover:shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">🏢 ข้อมูลห้องพัก</h2>
          <p className="text-gray-500">จัดการข้อมูลห้องพักและสถานะการเช่า</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={refreshData}
            className={`flex items-center space-x-2 p-2 pl-3 pr-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 ${isRefreshing ? 'opacity-75' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
          
          <Link
  to="/admin/add-room"
  className="flex items-center space-x-2 p-2 pl-3 pr-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
>
  <Plus size={18} />
  <span>เพิ่มห้องใหม่</span>
</Link>
        </div>
      </header>

      {/* แสดงสถิติห้องพัก */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white shadow-sm rounded-xl p-4 flex items-center justify-between border-l-4 border-gray-500">
          <div>
            <div className="text-sm text-gray-500">ห้องทั้งหมด</div>
            <div className="text-2xl font-bold">{roomStats.total}</div>
          </div>
          <div className="p-3 rounded-full bg-gray-100">
            <Home size={20} className="text-gray-500" />
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl p-4 flex items-center justify-between border-l-4 border-green-500">
          <div>
            <div className="text-sm text-gray-500">ห้องว่าง</div>
            <div className="text-2xl font-bold">{roomStats.available}</div>
          </div>
          <div className="p-3 rounded-full bg-green-100">
            <CheckCircle size={20} className="text-green-500" />
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl p-4 flex items-center justify-between border-l-4 border-blue-500">
          <div>
            <div className="text-sm text-gray-500">มีผู้เช่า</div>
            <div className="text-2xl font-bold">{roomStats.occupied}</div>
          </div>
          <div className="p-3 rounded-full bg-blue-100">
            <Users size={20} className="text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl p-4 flex items-center justify-between border-l-4 border-yellow-500">
          <div>
            <div className="text-sm text-gray-500">จองแล้ว</div>
            <div className="text-2xl font-bold">{roomStats.reserved}</div>
          </div>
          <div className="p-3 rounded-full bg-yellow-100">
            <Clock size={20} className="text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl p-4 flex items-center justify-between border-l-4 border-red-500">
          <div>
            <div className="text-sm text-gray-500">กำลังซ่อม</div>
            <div className="text-2xl font-bold">{roomStats.maintenance}</div>
          </div>
          <div className="p-3 rounded-full bg-red-100">
            <Wrench size={20} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* ค้นหาและกรอง */}
      <div className="bg-white shadow-md p-4 rounded-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="ค้นหาห้องพัก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">สถานะ:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value="all">ทั้งหมด</option>
                <option value="available">ว่าง</option>
                <option value="occupied">มีผู้เช่า</option>
                <option value="reserved">จองแล้ว</option>
                <option value="maintenance">กำลังซ่อม</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* แสดงข้อความโหลดหรือข้อผิดพลาด */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-500 p-4 rounded-xl mb-6 text-center animate-pulse">
          {error}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("room_number")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>เลขห้อง</span>
                      {sortField === "room_number" && (
                        <ArrowUpDown size={14} className={sortDirection === "asc" ? "transform rotate-0" : "transform rotate-180"} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ประเภท</span>
                      {sortField === "type" && (
                        <ArrowUpDown size={14} className={sortDirection === "asc" ? "transform rotate-0" : "transform rotate-180"} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("floor")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ชั้น</span>
                      {sortField === "floor" && (
                        <ArrowUpDown size={14} className={sortDirection === "asc" ? "transform rotate-0" : "transform rotate-180"} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("size")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ขนาด (ตร.ม.)</span>
                      {sortField === "size" && (
                        <ArrowUpDown size={14} className={sortDirection === "asc" ? "transform rotate-0" : "transform rotate-180"} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("rent_price")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ค่าเช่า (บาท)</span>
                      {sortField === "rent_price" && (
                        <ArrowUpDown size={14} className={sortDirection === "asc" ? "transform rotate-0" : "transform rotate-180"} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>สถานะ</span>
                      {sortField === "status" && (
                        <ArrowUpDown size={14} className={sortDirection === "asc" ? "transform rotate-0" : "transform rotate-180"} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRooms().length > 0 ? (
                  filteredAndSortedRooms().map((room, index) => (
                    <tr key={room.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-50 text-blue-600">
                            <Home size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{room.room_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.floor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.size}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Intl.NumberFormat('th-TH').format(room.rent_price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roomStatusConfig[room.status]?.bgColor} ${roomStatusConfig[room.status]?.textColor}`}>
                          {roomStatusConfig[room.status]?.icon}
                          <span className="ml-1">{roomStatusConfig[room.status]?.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                        <button 
                            className="p-1 rounded-md hover:bg-blue-50 text-blue-600 transition-colors duration-150"
                            onClick={() => handleEditClick(room)}
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            className="p-1 rounded-md hover:bg-red-50 text-red-600 transition-colors duration-150"
                            onClick={() => handleDeleteClick(room)}
                        >
                            <Trash size={18} />
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      ไม่พบข้อมูลห้องพัก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

{/* โมดัลแก้ไขห้องพัก */}
{isEditModalOpen && (
  <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/10 backdrop-blur-sm">
    <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
      <div className="p-5 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Edit className="mr-2" size={20} /> แก้ไขข้อมูลห้องพัก #{formData.room_number}
        </h3>
        <button 
          onClick={() => setIsEditModalOpen(false)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-5">
        {/* Room Details Section */}
        <div className="p-4 bg-blue-50 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <Home className="mr-2" size={20} /> ข้อมูลห้องพัก
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">หมายเลขห้อง *</label>
              <input
                type="text"
                name="room_number"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.room_number}
                onChange={handleInputChange}
                placeholder="เช่น 301"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ชั้น</label>
              <input
                type="number"
                name="floor"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.floor}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ประเภทห้อง *</label>
              <select
                name="type"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">เลือกประเภทห้อง</option>
                <option value="ห้องเปล่า">ห้องเปล่า</option>
                <option value="เฟอร์นิเจอร์บางส่วน">เฟอร์นิเจอร์บางส่วน</option>
                <option value="เฟอร์นิเจอร์ครบ">เฟอร์นิเจอร์ครบ</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ขนาดห้อง (ตร.ม.) *</label>
              <input
                type="number"
                name="size"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="เช่น 24"
                required
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">สถานะห้อง *</label>
            <select
              name="status"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="available">ว่าง</option>
              <option value="occupied">มีผู้เช่า</option>
              <option value="reserved">จองแล้ว</option>
              <option value="maintenance">กำลังซ่อม</option>
            </select>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="p-4 bg-green-50 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <CreditCard className="mr-2" size={20} /> ราคาและค่าบริการ
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ค่าเช่า (บาท/เดือน) *</label>
              <input
                type="number"
                name="rent_price"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.rent_price}
                onChange={handleInputChange}
                placeholder="เช่น 4500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ค่ามัดจำ (บาท) *</label>
              <input
                type="number"
                name="deposit"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.deposit}
                onChange={handleInputChange}
                placeholder="เช่น 8000"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ค่าน้ำ (บาท/หน่วย) *</label>
              <input
                type="number"
                name="water_price"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.water_price}
                onChange={handleInputChange}
                placeholder="เช่น 18"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ค่าไฟ (บาท/หน่วย) *</label>
              <input
                type="number"
                name="electricity_price"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.electricity_price}
                onChange={handleInputChange}
                placeholder="เช่น 7"
                required
              />
            </div>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="p-4 bg-purple-50 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
            <ClipboardList className="mr-2" size={20} /> สิ่งอำนวยความสะดวก
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {facilityOptions.map((facility, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`edit-facility-${index}`}
                  value={facility}
                  checked={formData.facilities && formData.facilities.includes(facility)}
                  onChange={handleEditFacilityChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`edit-facility-${index}`} className="ml-2 text-sm text-gray-700">
                  {facility}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Description Section */}
        <div className="p-4 bg-amber-50 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
            <FileText className="mr-2" size={20} /> รายละเอียดเพิ่มเติม
          </h3>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">คำอธิบายห้องพัก *</label>
            <textarea
              name="description"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับห้องพัก..."
              required
            />
          </div>
        </div>

        {/* Images Section */}
        <div className="p-4 bg-rose-50 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-rose-800 mb-3 flex items-center">
            <ImageIcon className="mr-2" size={20} /> รูปภาพห้องพัก
          </h3>
          
          {/* Cover Image */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">รูปหน้าปก *</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1">
                <input
                  type="file"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  onChange={(e) => handleEditImageChange(e, "cover")}
                  accept="image/*"
                />
              </div>
              {currentImages.cover && (
                <div className="flex gap-2 items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                    <img 
                      src={currentImages.cover} 
                      alt="Cover" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage("cover")}
                    className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Room Images */}
          <div className="grid grid-cols-1 gap-4">
            <h4 className="text-md font-medium text-gray-700">รูปห้องพัก</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentImages.images.map((img, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                    <img 
                      src={img} 
                      alt={`Room ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">รูปที่ {index + 1}</div>
                    <input
                      type="file"
                      className="w-full text-sm"
                      onChange={(e) => handleEditImageChange(e, index)}
                      accept="image/*"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add More Images Button */}
            {currentImages.images.length < 5 && (
              <button
                type="button"
                onClick={handleAddImageField}
                className="flex items-center justify-center px-4 py-2 mt-2 border border-dashed border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus size={18} className="mr-1" /> เพิ่มรูปภาพ
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-5 border-t flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          onClick={() => setIsEditModalOpen(false)}
        >
          <X size={18} className="mr-1" /> ยกเลิก
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          onClick={handleUpdateRoom}
        >
          <Save size={18} className="mr-1" /> บันทึกการแก้ไข
        </button>
      </div>
    </div>
  </div>
)}

{/* โมดัลยืนยันการลบห้องพัก */}
{isDeleteModalOpen && (
  <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/10 backdrop-blur-sm">
    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-center mb-4 text-red-500">
          <AlertTriangle size={48} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-800 mb-2">ยืนยันการลบห้องพัก</h3>
        <p className="text-center text-gray-600 mb-6">
          คุณต้องการลบห้องพัก <span className="font-bold">#{selectedRoom?.room_number}</span> ใช่หรือไม่? 
          <span className="block mt-1 text-red-500 text-sm">การกระทำนี้ไม่สามารถเรียกคืนได้</span>
        </p>
        <div className="flex justify-center space-x-3">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <X size={18} className="mr-1" /> ยกเลิก
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
            onClick={handleDeleteRoom}
          >
            <Trash2 size={18} className="mr-1" /> ยืนยันการลบ
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </AdminSidebar>
  );
};

export default RoomListStatus;