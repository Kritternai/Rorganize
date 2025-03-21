import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Ruler, Building2, Search,BedDouble } from "lucide-react";
import '@fontsource/prompt';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3001/api/rooms")
      .then(response => {
        setRooms(response.data);
        setLoading(false);
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
    <div className="font-[Prompt] bg-white min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white shadow z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <Link to="/" className="text-3xl font-bold">Rorganize</Link>
          <ul className="flex gap-5 items-center">
            <Link to="/">หน้าหลัก</Link>
            <Link to="/rooms">ห้องพัก</Link>
            <Link to="/contact">ติดต่อเรา</Link>
            <Link to="/booking" className="bg-blue-600 text-white px-4 py-2 rounded-lg">จองห้องพัก</Link>
          </ul>
        </div>
      </nav>

      {/* Banner */}
      <div className="bg-[url('/images/banner-room.jpg')] bg-cover bg-center py-20 text-center">
        <h1 className="text-4xl font-bold black-white drop-shadow-lg">ค้นหาห้องพักของคุณ</h1>
      </div>

      {/* Search Filter */}
      <div className="container mx-auto py-8 px-2">
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="ค้นหาตามเลขห้อง, ชั้น หรือประเภทห้องพัก"
              className="w-full border border-gray-300 rounded-full py-3 pl-5 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loading && <p className="text-center text-blue-500">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        <hr className="my-6 border-t-2 border-gray-300 w-3/4 mx-auto rounded-full" />
        {/* Room Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map(room => (
              <div key={room.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Link to={`/rooms/${room.id}`}>
                  <img
                    src={room.cover_image || "/images/default-room.jpg"}
                    alt={`ห้อง ${room.room_number}`}
                    className="w-full h-64 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <h5 className="text-xl font-bold mb-2">ห้อง {room.room_number}</h5>
                  <div className="flex gap-4 text-gray-600 mb-2">
                    <Ruler className="text-blue-500" /> {room.size} ตร.ม.              
                    <Building2 className="text-blue-500" /> ชั้น {room.floor}
                    <BedDouble className="text-blue-500" /> {room.type}
                  </div>
                  <br></br>
                  <div className="text-blue-600 font-bold text-xl text-right">
                  {room.rent_price.toLocaleString()} บาท/เดือน
                  </div>
                  <Link to={`/rooms/${room.id}`} className="mt-4 block bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-full transition">
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))
          ) : (!loading && <p className="text-center text-gray-500 col-span-full">ไม่มีห้องพักในระบบ</p>)}
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;