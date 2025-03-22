import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Home, Ruler, Building2 } from 'lucide-react';

// ข้อมูลแท็บ
const tabData = [
  { title: "Apartment", space: "185 m²", floor: "26", rooms: 4, parking: "Yes", payment: "Bank Transfer", image: "/images/apartment.jpg" },
  { title: "Villa", space: "250 m²", floor: "2", rooms: 5, parking: "Yes", payment: "Credit Card", image: "/images/villa.jpg" },
  { title: "Penthouse", space: "320 m²", floor: "34", rooms: 6, parking: "Yes", payment: "Bank Transfer", image: "/images/penthouse.jpg" },
];

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = ["bannermain-01.png", "banner-02.jpg"];

  useEffect(() => {
    axios.get("http://localhost:3001/api/rooms")
      .then(response => { setRooms(response.data); setLoading(false); })
      .catch(() => { setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้"); setLoading(false); });
  }, []);

  // สไลด์อัตโนมัติ
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="font-[Prompt] bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Navbar with hover effects */}
      <nav className="sticky top-0 bg-white shadow-md z-50 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <Link to="/" className="text-3xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-300">
            Rorganize
          </Link>
          <ul className="flex gap-5 items-center">
            <Link to="/" className="text-blue-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-600">หน้าหลัก</Link>
            <Link to="/rooms" className="hover:text-blue-600 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300">ห้องพัก</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all after:duration-300">ติดต่อเรา</Link>
            <Link to="/booking" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg">
              จองห้องพัก
            </Link>
          </ul>
        </div>
      </nav>

      {/* Banner with simplified slider */}
      <div className="relative h-screen overflow-hidden">
        {banners.map((img, idx) => (
          <div 
            key={idx} 
            className={`absolute w-full h-full transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={`/images/${img}`} className="w-full h-full object-cover" alt={`Banner ${idx + 1}`} />
          </div>
        ))}
        
        {/* Simplified pagination dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full ${idx === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <section className="max-w-6xl mx-auto my-16 px-4 grid md:grid-cols-3 gap-8 items-center">
        <div className="relative">
          <img src="/images/featured.jpg" className="rounded-xl shadow-lg w-full" alt="Featured property" />
          <div className="absolute bottom-4 left-4 bg-blue-500 p-3 rounded-full shadow-lg">
            <Home className="text-white" />
          </div>
        </div>
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-blue-600 font-semibold">| FEATURED</h3>
          <h2 className="text-4xl font-bold">Best Apartment & Sea View</h2>
          <p className="text-gray-600">สัมผัสบรรยากาศที่หรูหราและสะดวกสบาย</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto border-t-2 border-gray-200"></div>

      {/* Best Deal Tabs - Simplified */}
      <section className="max-w-6xl mx-auto my-16 px-4">
        <h2 className="text-3xl text-center font-bold mb-10">Find Your Best Deal Right Now!</h2>
        
        {/* Tab buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {tabData.map((tab, idx) => (
            <button
              key={tab.title}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === idx 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
        
        {/* Tab content */}
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="bg-blue-50 p-6 rounded-xl shadow-md">
            <ul className="space-y-2">
              <li className="flex items-center"><span className="font-semibold w-24">Space:</span> {tabData[activeTab].space}</li>
              <li className="flex items-center"><span className="font-semibold w-24">Floor:</span> {tabData[activeTab].floor}</li>
              <li className="flex items-center"><span className="font-semibold w-24">Rooms:</span> {tabData[activeTab].rooms}</li>
              <li className="flex items-center"><span className="font-semibold w-24">Parking:</span> {tabData[activeTab].parking}</li>
              <li className="flex items-center"><span className="font-semibold w-24">Payment:</span> {tabData[activeTab].payment}</li>
            </ul>
          </div>
          <img 
            src={tabData[activeTab].image} 
            className="h-64 w-full object-cover rounded-xl shadow-lg" 
            alt={tabData[activeTab].title} 
          />
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Extra Info About {tabData[activeTab].title}</h3>
            <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Schedule a Visit
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto border-t-2 border-gray-200"></div>

      {/* Room Listings */}
      <section className="max-w-6xl mx-auto my-16 px-4">
        <h3 className="text-center text-3xl font-semibold mb-10">ห้องพักแนะนำ</h3>

        {loading && <p className="text-center text-blue-500">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform">
              <Link to={`/rooms/${room.id}`}>
                <img 
                  src={room.cover_image || "/images/default-room.jpg"} 
                  className="h-56 w-full object-cover" 
                  alt={`ห้อง ${room.room_number}`} 
                />
              </Link>
              <div className="p-5">
                <h4 className="text-xl font-bold mb-3">ห้อง {room.room_number}</h4>
                <div className="flex gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Ruler size={18} className="text-blue-500" /> 
                    <span>{room.size} ตร.ม.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 size={18} className="text-blue-500" /> 
                    <span>ชั้น {room.floor}</span>
                  </div>
                </div>
                <Link 
                  to={`/rooms/${room.id}`} 
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition-colors"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Rorganize</h3>
            <p className="text-gray-400">เว็บไซต์จองห้องพักออนไลน์ที่คุณวางใจ</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">หน้าหลัก</Link></li>
              <li><Link to="/rooms" className="text-gray-400 hover:text-white transition-colors">ห้องพัก</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">ติดต่อเรา</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact</h4>
            <address className="text-gray-400 not-italic">
              123 อาคารใดๆ ถนนสุขุมวิท<br />
              กรุงเทพฯ 10110<br />
              โทร: 02-123-4567<br />
              อีเมล: contact@rorganize.com
            </address>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-700 px-4 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Rorganize. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;