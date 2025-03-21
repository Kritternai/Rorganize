import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Ruler, Building2, BedDouble, Droplet, Zap, ShieldCheck, X } from 'lucide-react';
import { Dialog } from "@headlessui/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import '@fontsource/prompt';

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3001/api/rooms/${id}`)
      .then(response => {
        setRoom(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-10 text-blue-500 font-[Prompt]">กำลังโหลดข้อมูล...</div>;
  if (error || !room) return <div className="text-center py-10 text-red-500 font-[Prompt]">{error || "⚠️ ไม่พบข้อมูลห้องพัก"}</div>;

  const images = [room.cover_image, ...(room.images || [])];

  const openModal = (img) => {
    setSelectedImage(img);
    setIsOpen(true);
  };

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

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Swiper and Thumbnail */}
          <div>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              loop
              className="rounded-xl shadow-lg overflow-hidden w-full h-[550px]"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img 
                    src={img} 
                    alt={`Room ${room.room_number}-${idx}`} 
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openModal(img)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto py-3 mt-4">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumbnail ${idx}`}
                  className="w-24 h-16 object-cover rounded-md shadow cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                  onClick={() => openModal(img)}
                />
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-5">
            <h2 className="text-4xl font-bold text-blue-700">ห้อง {room.room_number}</h2>

            <div className="flex flex-wrap gap-5 text-gray-600">
              <Ruler className="text-blue-500" /> {room.size} ตร.ม.
              <Building2 className="text-blue-500" /> ชั้น {room.floor}
              <BedDouble className="text-blue-500" /> {room.type}
            </div>

            <div className="text-2xl font-semibold text-gray-800">
              ค่าเช่า: <span className="text-blue-600 font-bold">{room.rent_price.toLocaleString()} บาท/เดือน</span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-2"><Droplet className="text-blue-500" /> ค่าน้ำ: {room.water_price} บาท/หน่วย</div>
              <div className="flex items-center gap-2"><Zap className="text-yellow-500" /> ค่าไฟ: {room.electricity_price} บาท/หน่วย</div>
              <div className="flex items-center gap-2 col-span-2"><ShieldCheck className="text-green-500" /> ค่ามัดจำ: {room.deposit.toLocaleString()} บาท</div>
            </div>

            <div>
              <h3 className="text-xl font-semibold">รายละเอียดเพิ่มเติม</h3>
              <p className="text-gray-700">{room.description || "ไม่มีข้อมูลเพิ่มเติม"}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">สิ่งอำนวยความสะดวก</h3>
              <ul className="list-disc list-inside text-gray-700">
                {(room.facilities || []).map((facility, idx) => <li key={idx}>{facility}</li>)}
              </ul>
            </div>

            <Link to="/booking" className="block bg-blue-600 text-white text-center py-3 rounded-xl hover:bg-blue-700 transition">จองห้องพักนี้</Link>
            <Link to="/rooms" className="block border text-center py-3 rounded-xl hover:bg-gray-100 transition">กลับไปหน้าห้องพัก</Link>
          </div>
        </div>
      </div>

      {/* Modal Image Viewer */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative mx-auto max-w-5xl rounded-xl overflow-hidden shadow-lg">
            <img src={selectedImage} alt="Room Large View" className="w-full object-cover" />
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-white rounded-full p-1 shadow hover:bg-gray-100">
              <X size={24} />
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default RoomDetail;