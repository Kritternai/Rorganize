import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Home, Users, Bed, Calendar, Edit, Trash, Plus, Search, Filter, RefreshCw, ArrowUpDown, CheckCircle, XCircle, Clock, Wrench } from "lucide-react";
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
                          <button className="p-1 rounded-md hover:bg-blue-50 text-blue-600 transition-colors duration-150">
                            <Edit size={18} />
                          </button>
                          <button className="p-1 rounded-md hover:bg-red-50 text-red-600 transition-colors duration-150">
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
    </AdminSidebar>
  );
};

export default RoomListStatus;