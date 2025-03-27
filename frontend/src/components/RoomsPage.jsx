import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Ruler, Building2, Search, BedDouble, Filter, X } from "lucide-react";
import '@fontsource/prompt';

const RoomsPage = () => {
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    roomType: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3001/api/rooms")
      .then(response => {
        const availableRooms = response.data.filter(room => room.status === 'available');
        setRooms(availableRooms);
        setLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      })
      .catch(() => {
        setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้");
        setLoading(false);
      });
  }, []);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(search.toLowerCase()) ||
      room.floor.toString().includes(search.toLowerCase()) ||
      room.type.toLowerCase().includes(search.toLowerCase());
    
    const matchesMinPrice = filters.minPrice === "" || room.rent_price >= parseFloat(filters.minPrice);
    const matchesMaxPrice = filters.maxPrice === "" || room.rent_price <= parseFloat(filters.maxPrice);
    const matchesRoomType = filters.roomType === "" || room.type.toLowerCase() === filters.roomType.toLowerCase();

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesRoomType;
  });

  const roomTypes = [...new Set(rooms.map(room => room.type))];

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      roomType: "",
    });
  };

  return (
    <div className="font-[Prompt] bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md shadow-md z-50 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <Link 
            to="/" 
            className="text-3xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            The Luxe
          </Link>
          <ul className="flex gap-5 items-center">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}>หน้าหลัก</Link>
          <Link to="/rooms" className={`nav-link ${location.pathname === '/rooms' ? 'text-blue-600 font-semibold' : ''}`}>ห้องพัก</Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'text-blue-600 font-semibold' : ''}`}>ติดต่อเรา</Link>
            <Link 
              to="/login/user" 
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 
              transform hover:-translate-y-0.5 transition-all duration-300 
              shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              เข้าสู่ระบบ
            </Link>
          </ul>
        </div>
      </nav>

      {/* Banner */}
      <div className="relative bg-cover bg-center py-24 text-center overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-100 
          group-hover:scale-105 transition-transform duration-500 
          brightness-50 group-hover:brightness-75"
          style={{backgroundImage: "url('/images/banner-room.jpg')"}}
        />
        <div className="relative z-10 text-white px-4">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4 animate-fadeIn">
            ค้นหาห้องพักที่ว่างอยู่
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-80">
            ค้นหาห้องพักที่เหมาะสมกับคุณ พร้อมตัวกรองที่หลากหลาย เพื่อประสบการณ์การค้นหาที่ง่ายและตรงใจ
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="ค้นหาตามเลขห้อง, ชั้น หรือประเภทห้องพัก"
              className="w-full border border-gray-300 rounded-full py-3 pl-6 pr-14 
              shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 
              transition-all duration-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Search size={20} className="text-blue-500" />
            </div>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-100 text-blue-600 px-4 py-3 rounded-full 
            flex items-center gap-2 hover:bg-blue-200 transition-colors"
          >
            {showFilters ? <X size={20} /> : <Filter size={20} />}
            {showFilters ? 'ปิดตัวกรอง' : 'ตัวกรอง'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-blue-50 p-6 rounded-lg mb-8 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-gray-700">ราคาต่ำสุด</label>
              <input 
                type="number" 
                placeholder="ราคาต่ำสุด" 
                className="w-full p-2 border rounded"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700">ราคาสูงสุด</label>
              <input 
                type="number" 
                placeholder="ราคาสูงสุด" 
                className="w-full p-2 border rounded"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700">ประเภทห้อง</label>
              <select 
                className="w-full p-2 border rounded"
                value={filters.roomType}
                onChange={(e) => setFilters({...filters, roomType: e.target.value})}
              >
                <option value="">ทุกประเภท</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {(filters.minPrice || filters.maxPrice || filters.roomType) && (
              <div className="md:col-span-3 text-right">
                <button 
                  onClick={clearFilters} 
                  className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-full"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500 bg-red-50 py-4 rounded-lg border border-red-200 animate-pulse">
            {error}
          </div>
        )}    

        {/* Room Listings */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 
          transition-opacity duration-1000 ease-out 
          ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, index) => (
              <div 
                key={room.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl 
                transition-all transform hover:-translate-y-2 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link to={`/rooms/${room.id}`} className="block">
                  <div className="relative overflow-hidden">
                    <img
                      src={room.cover_image || "/images/room-placeholder.jpg"}
                      alt={`ห้อง ${room.room_number}`}
                      className="h-72 w-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <h5 className="text-2xl font-bold mb-3 text-blue-900 flex items-center justify-between">
                    ห้อง {room.room_number}
                    <span className="text-xl text-blue-600">{room.rent_price.toLocaleString()} ฿/เดือน</span>
                  </h5>
                  <div className="grid grid-cols-3 gap-3 text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Ruler className="text-blue-500" /> 
                      <span>{room.size} ตร.ม.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="text-blue-500" /> 
                      <span>ชั้น {room.floor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble className="text-blue-500" /> 
                      <span>{room.type}</span>
                    </div>
                  </div>
                  <Link
                    to={`/rooms/${room.id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white 
                    text-center py-3 rounded-full transition-all 
                    transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="text-center text-gray-500 col-span-full py-16 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xl mb-4">ไม่พบห้องพักที่ว่างอยู่ตรงกับการค้นหาของคุณ</p>
                <button 
                  onClick={clearFilters} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            )
          )}
        </div>

        {!loading && filteredRooms.length > 0 && (
          <div className="text-center mt-8">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              กำลังแสดงเฉพาะห้องพักที่ว่างอยู่เท่านั้น
            </span>
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s forwards;
        }
        .nav-link {
          @apply hover:text-blue-600 transition-colors duration-200 relative 
          after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 
          hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RoomsPage;