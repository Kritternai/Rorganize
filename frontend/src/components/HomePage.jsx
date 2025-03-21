import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Home, Ruler, Building2 } from 'lucide-react';
import { Tab } from "@headlessui/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import '@fontsource/prompt';

const tabData = [
  { title: "Apartment", space: "185 m²", floor: "26", rooms: 4, parking: "Yes", payment: "Bank Transfer", image: "/images/apartment.jpg" },
  { title: "Villa", space: "250 m²", floor: "2", rooms: 5, parking: "Yes", payment: "Credit Card", image: "/images/villa.jpg" },
  { title: "Penthouse", space: "320 m²", floor: "34", rooms: 6, parking: "Yes", payment: "Bank Transfer", image: "/images/penthouse.jpg" },
];

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/api/rooms")
      .then(response => { setRooms(response.data); setLoading(false); })
      .catch(() => { setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้"); setLoading(false); });
  }, []);

  return (
    <div className="font-[Prompt] bg-white text-gray-800">
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
      <Swiper modules={[Navigation, Pagination, Autoplay]} slidesPerView={1} navigation pagination={{ clickable: true }} autoplay={{ delay: 3000 }} loop>
        {["bannermain-01.png", "banner-02.jpg"].map((img, idx) => (
          <SwiperSlide key={idx}>
            <img src={`/images/${img}`} className="w-full h-[845px] object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Featured Section */}
      <section className="container mx-auto my-16 grid lg:grid-cols-3 gap-6 items-center">
        <div className="relative">
          <img src="/images/featured.jpg" className="rounded-xl shadow" />
          <div className="absolute bottom-4 left-4 bg-blue-500 p-3 rounded-full shadow-lg">
            <Home className="text-white" />
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-blue-600 font-semibold">| FEATURED</h3>
          <h2 className="text-4xl font-bold">Best Apartment & Sea View</h2>
          <p className="text-gray-600">สัมผัสบรรยากาศที่หรูหราและสะดวกสบาย</p>
        </div>
      </section>


      <hr className="my-6 border-t-2 border-gray-300 w-3/4 mx-auto rounded-full" />
      {/* Best Deal Tabs */}
      <section className="container mx-auto my-16">
        <h2 className="text-3xl text-center font-bold mb-8">Find Your Best Deal Right Now!</h2>
        <Tab.Group>
          <Tab.List className="flex justify-center gap-4 mb-8">
            {tabData.map(tab => (
              <Tab key={tab.title} className={({ selected }) => selected ? "bg-blue-600 text-white px-4 py-2 rounded-full" : "bg-gray-200 px-4 py-2 rounded-full"}>{tab.title}</Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {tabData.map(tab => (
              <Tab.Panel key={tab.title} className="grid md:grid-cols-3 gap-6 items-center">
                <div className="bg-blue-50 p-6 rounded-xl shadow">
                  <ul>
                    <li>Space: {tab.space}</li>
                    <li>Floor: {tab.floor}</li>
                    <li>Rooms: {tab.rooms}</li>
                    <li>Parking: {tab.parking}</li>
                    <li>Payment: {tab.payment}</li>
                  </ul>
                </div>
                <img src={tab.image} className="h-64 object-cover rounded-xl shadow-lg" />
                <div>
                  <h3 className="text-xl font-bold">Extra Info About {tab.title}</h3>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Schedule a Visit</button>
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </section>
      <hr className="my-6 border-t-2 border-gray-300 w-3/4 mx-auto rounded-full" />
      {/* Room Listings */}
      <section className="container mx-auto my-12">
        <h3 className="text-center text-3xl font-semibold mb-10">ห้องพักแนะนำ</h3>

        {loading && <p className="text-center text-blue-500">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div key={room.id} className="bg-white shadow-lg rounded-xl overflow-hidden">
              <Link to={`/rooms/${room.id}`}>
                <img src={room.cover_image || "/images/default-room.jpg"} className="h-56 w-full object-cover" alt={`ห้อง ${room.room_number}`} />
              </Link>
              <div className="p-5">
                <h4 className="text-xl font-bold mb-2">ห้อง {room.room_number}</h4>
                <div className="flex gap-3 text-gray-600">
                  <Ruler size={20} className="text-blue-500" /> {room.size} ตร.ม.
                  <Building2 size={20} className="text-blue-500" /> ชั้น {room.floor}
                </div>
                <Link to={`/rooms/${room.id}`} className="inline-block bg-blue-500 text-white px-5 py-2 rounded-full mt-3">ดูรายละเอียด</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;