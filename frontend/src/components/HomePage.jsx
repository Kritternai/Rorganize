import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import banner1 from "./images/banner1.png";
import banner2 from "./images/banner2.png";
import {
  Home,
  Ruler,
  Building2,
  Star,
  KeyRound,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const tabData = [
  {
    title: "เฟอร์นิเจอร์ครบ",
    space: "32 ตร.ม.",
    floor: "5",
    rooms: 1,
    image: "/images/high.png",
    description:
      "ห้องสวยพร้อมอยู่ มาพร้อมเฟอร์นิเจอร์ครบชุด เหมาะสำหรับคนเมืองที่ต้องการความสะดวกสบายในทุกวัน",
  },
  {
    title: "เฟอร์นิเจอร์บางส่วน",
    space: "38 ตร.ม.",
    floor: "8",
    rooms: 1,
    image: "/images/medium.png",
    description:
      "ห้องตกแต่งบางส่วนให้คุณเติมแต่งในสไตล์ของตัวเอง พร้อมวิวชั้นสูงและบรรยากาศเงียบสงบ",
  },
  {
    title: "ห้องเปล่า",
    space: "28 ตร.ม.",
    floor: "3",
    rooms: 1,
    image: "/images/low.png",
    description:
      "เริ่มต้นชีวิตใหม่กับห้องเปล่าโล่งกว้าง ให้คุณออกแบบการใช้ชีวิตได้อย่างอิสระ",
  },
];

const testimonials = [
  { name: "คุณพลอย", text: "ที่พักสะอาด เงียบสงบ บริการดีมาก ประทับใจสุดๆ!" },
  { name: "คุณธนภัทร", text: "ห้องสวยเกินคาด บรรยากาศเหมือนโรงแรมหรู ใจกลางเมือง" },
  { name: "คุณณัฐ", text: "ประทับใจตั้งแต่วันแรกที่เข้าพัก ทีมงานดูแลดีมาก" },
];

const HomePage = () => {
  const location = useLocation();
  const banners = [banner1, banner2];
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    const timer = setTimeout(() => setIsFirstLoad(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3001/api/rooms")
      .then(res => { setRooms(res.data); setLoading(false); })
      .catch(() => { setError("\u274C ไม่สามารถโหลดข้อมูลห้องพักได้"); setLoading(false); });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="font-[Prompt] bg-gradient-to-b from-white to-blue-50 text-gray-800 scroll-smooth">
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
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "text-blue-600 font-semibold" : ""}`}>หน้าหลัก</Link>
            <Link to="/rooms" className={`nav-link ${location.pathname === "/rooms" ? "text-blue-600 font-semibold" : ""}`}>ห้องพัก</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === "/contact" ? "text-blue-600 font-semibold" : ""}`}>ติดต่อเรา</Link>
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
      <div className="relative h-screen overflow-hidden">
        <img
          src={banners[currentSlide]}
          alt={`Banner ${currentSlide}`}
          className={`absolute inset-0 w-full h-full object-cover ${isFirstLoad ? "animate-fadeZoom" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        <div className={`absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4 ${isFirstLoad ? "opacity-0 animate-fadeIn" : "opacity-100"}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">ยินดีต้อนรับสู่ The Luxe</h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl drop-shadow">ห้องพักหรูใจกลางเมือง บริการเหนือระดับ สำหรับคุณ</p>
          <div className="flex gap-4">
            <Link to="/rooms" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all">สำรวจห้องพัก</Link>
            <Link to="/contact" className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all">ติดต่อเรา</Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-20 bg-transparent" data-aos="fade-up">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-blue-900">สิ่งที่ทำให้เราแตกต่าง</h2>
          <div className="grid md:grid-cols-4 gap-10">
            {[
              { icon: <Home />, title: "ห้องหรู", desc: "ตกแต่งทันสมัย พร้อมวิวเมือง" },
              { icon: <ShieldCheck />, title: "ปลอดภัย", desc: "ระบบรักษาความปลอดภัย 24 ชม." },
              { icon: <Star />, title: "บริการระดับ 5 ดาว", desc: "บริการครบวงจรจากทีมงานมืออาชีพ" },
              { icon: <KeyRound />, title: "เข้าอยู่ได้ทันที", desc: "ห้องพร้อมอยู่ พร้อมเฟอร์นิเจอร์ครบ" }
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-2 group">
                <div className="text-blue-700 mb-4 group-hover:text-blue-900 transition">{icon}</div>
                <h4 className="font-semibold text-xl mb-2 text-blue-900">{title}</h4>
                <p className="text-gray-700">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabbed Room Selector */}
      <section className="max-w-6xl mx-auto py-20 px-4" data-aos="fade-up">
        <h2 className="text-3xl text-center font-bold mb-10 text-blue-900">ค้นหาห้องที่ใช่สำหรับคุณ</h2>
        <div className="flex justify-center gap-4 mb-8">
          {tabData.map((tab, idx) => (
            <button 
              key={tab.title}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                activeTab === idx
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100 hover:shadow-sm'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg" data-aos="fade-right" data-aos-delay="100">
            <ul className="space-y-3 text-gray-700">
              <li><strong className="text-blue-900">พื้นที่:</strong> {tabData[activeTab].space}</li>
              <li><strong className="text-blue-900">ชั้น:</strong> {tabData[activeTab].floor}</li>
              <li><strong className="text-blue-900">ห้อง:</strong> {tabData[activeTab].rooms}</li>
            </ul>
          </div>
          <div data-aos="zoom-in" data-aos-delay="200">
            <button onClick={() => setLightboxImage(tabData[activeTab].image)}>
              <img 
                src={tabData[activeTab].image} 
                className="h-64 w-full object-cover rounded-xl shadow-lg border-4 border-blue-100" 
                alt={tabData[activeTab].title} 
              />
            </button>
          </div>
          <div data-aos="fade-left" data-aos-delay="300">
            <h3 className="text-xl font-bold mb-2 text-blue-900">รายละเอียด {tabData[activeTab].title}</h3>
            <p className="text-gray-700">{tabData[activeTab].description}</p>
          </div>
        </div>
      </section>

        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70"
            onClick={() => setLightboxImage(null)}
          >
            <img
              src={lightboxImage}
              alt="Zoomed"
              className="max-w-3xl max-h-[90vh] rounded-lg shadow-2xl border-4 border-white"
            />
          </div>
        )}

      <section className="max-w-7xl mx-auto py-24 px-6" data-aos="fade-up">
        <h3 className="text-center text-4xl font-bold mb-14 text-blue-900">ห้องพักแนะนำ</h3>
        {loading && <p className="text-center text-blue-700 text-lg">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-xl group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <button onClick={() => setLightboxImage(room.cover_image || "/images/default-room.jpg")} className="block w-full h-72 overflow-hidden">
                <img
                  src={room.cover_image || "/images/default-room.jpg"}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  alt={`ห้อง ${room.room_number}`}
                />
              </button>
              <div className="p-6">
                <h4 className="text-2xl font-semibold text-blue-900 mb-2">ห้อง {room.room_number}</h4>
                <div className="flex gap-6 text-gray-600 text-sm mb-4">
                  <div className="flex items-center gap-1"><Ruler size={18} className="text-blue-700" /> <span>{room.size} ตร.ม.</span></div>
                  <div className="flex items-center gap-1"><Building2 size={18} className="text-blue-700" /> <span>ชั้น {room.floor}</span></div>
                </div>
                <Link
                  to={`/rooms/${room.id}`}
                  className="inline-block bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-blue-50 py-20" data-aos="fade-up">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10 text-blue-900">เสียงจากผู้เข้าพัก</h2>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000 }}
            pagination={{ clickable: true }}
            spaceBetween={20}
            className="!overflow-visible"
          >
            {testimonials.map((t, idx) => (
              <SwiperSlide key={idx}>
                <div className="bg-white p-6 rounded-xl shadow-lg max-w-xl mx-auto border-b-4 border-blue-700">
                  <p className="text-gray-700 italic mb-4">"{t.text}"</p>
                  <p className="font-semibold text-blue-900">– {t.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-700 text-white text-center relative overflow-hidden" data-aos="zoom-in">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-90 -z-10"></div>
        <h2 className="text-3xl font-bold mb-4 relative z-10">พร้อมแล้วที่จะเริ่มต้นชีวิตใหม่?</h2>
        <p className="mb-6 text-lg relative z-10">ติดต่อเราวันนี้ เพื่อดูห้องพักที่เหมาะกับคุณ</p>
        <Link 
          to="/contact" 
          className="bg-white text-blue-700 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg relative z-10"
        >
          ติดต่อเรา
        </Link>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-blue-900 text-blue-100 text-xs py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-2">
          <p>The Luxe – ที่พักหรูสำหรับชีวิตเมืองระดับพรีเมียม</p>
          <p className="text-[11px] text-blue-300">&copy; {new Date().getFullYear()} The Luxe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;