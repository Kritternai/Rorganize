import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Ruler, Building2, Search, BedDouble } from "lucide-react";
import '@fontsource/prompt';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch rooms data
    axios.get("http://localhost:3001/api/rooms")
      .then(response => {
        // กรองเฉพาะห้องที่ยังไม่ถูกจอง (status เป็น 'available')
        const availableRooms = response.data.filter(room => room.status === 'available');
        setRooms(availableRooms);
        setLoading(false);
        // Trigger animation after data is loaded
        setTimeout(() => setIsVisible(true), 100);
      })
      .catch(() => {
        setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้");
        setLoading(false);
      });
  }, []);

  const filteredRooms = rooms.filter(room =>
    room.room_number.toLowerCase().includes(search.toLowerCase()) ||
    room.floor.toString().includes(search.toLowerCase()) ||
    room.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="font-[Prompt] bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Navbar with hover effects */}
      <nav className="sticky top-0 bg-white shadow-md z-50 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <Link to="/" className="text-3xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-300">
            Rorganize
          </Link>
          <ul className="flex gap-5 items-center">
            <Link to="/" className="hover:text-blue-600 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300">หน้าหลัก</Link>
            <Link to="/rooms" className="text-blue-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-600">ห้องพัก</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300">ติดต่อเรา</Link>
            <Link to="/booking" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg">
              จองห้องพัก
            </Link>
          </ul>
        </div>
      </nav>

      {/* Banner with zoom effect */}
      <div className="bg-[url('/images/banner-room.jpg')] bg-cover bg-center py-24 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('/images/banner-room.jpg')] bg-cover bg-center transform scale-100 group-hover:scale-105 transition-transform duration-3000"></div>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <h1 className="text-5xl font-bold text-white drop-shadow-lg relative z-10 transform transition-transform duration-700 translate-y-0">
          ค้นหาห้องพักที่ว่างอยู่
        </h1>
      </div>

      {/* Search Filter with animation */}
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center mb-10 transform transition-all duration-500 ease-out opacity-0 translate-y-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="ค้นหาตามเลขห้อง, ชั้น หรือประเภทห้องพัก"
              className="w-full border border-gray-300 rounded-full py-4 pl-6 pr-14 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-blue-100 transition-all duration-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-300">
              <Search size={20} />
            </div>
          </div>
        </div>

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
        
        {!loading && !error && (
          <hr className="my-8 border-t-2 border-gray-200 w-2/3 mx-auto rounded-full" />
        )}
        
        {/* Room Listings with staggered animation */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, index) => (
              <div 
                key={room.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link to={`/rooms/${room.id}`} className="block overflow-hidden">
                  <div className="overflow-hidden">
                    <img
                      src={room.cover_image || "/images/default-room.jpg"}
                      alt={`ห้อง ${room.room_number}`}
                      className="w-full h-64 object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <h5 className="text-2xl font-bold mb-3 text-gray-800">ห้อง {room.room_number}</h5>
                  <div className="flex flex-wrap gap-5 text-gray-600 mb-3">
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
                  <div className="text-blue-600 font-bold text-2xl text-right mt-4 mb-4">
                    {room.rent_price.toLocaleString()} บาท/เดือน
                  </div>
                  <Link 
                    to={`/rooms/${room.id}`} 
                    className="mt-4 block bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="text-center text-gray-500 col-span-full py-10 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-xl">ไม่พบห้องพักที่ว่างอยู่ตรงกับการค้นหาของคุณ</p>
              </div>
            )
          )}
        </div>
      </div>
      {!loading && !error && (
          <div className="text-center mb-8">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              🏠 กำลังแสดงเฉพาะห้องพักที่ว่างอยู่เท่านั้น
            </span>
          </div>
        )}
      {/* Add CSS animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s forwards;
        }
      `}</style>
    </div>
  );
};

export default RoomsPage;