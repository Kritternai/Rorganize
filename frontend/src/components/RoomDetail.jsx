import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { 
  Ruler, Building2, BedDouble, Droplet, Zap, ShieldCheck, X, 
  CalendarCheck, Clock, Wifi, Tv, AirVent, Car, Coffee, ShowerHead,
  Image as ImageIcon, Box, Sofa, LayoutPanelTop, FileText
} from 'lucide-react';

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import '@fontsource/prompt';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOpenBooking, setIsOpenBooking] = useState(false);
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    email: "",
    check_in_date: "",
    duration: "",
    special_requests: ""
  });

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
  
    if (!room?.id) {
      toast.error("ไม่พบข้อมูลห้อง");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3001/api/bookings", {
        room_id: room.id,
        ...booking,
      });
  
      toast.success("จองห้องเรียบร้อยแล้ว!");
      setIsOpenBooking(false);
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      toast.error("ไม่สามารถจองห้องได้");
    }
  };

  useEffect(() => {
    setIsVisible(false);
    axios.get(`http://localhost:3001/api/rooms/${id}`)
      .then(response => {
        const roomData = response.data;

        // ไม่ต้องแสดง cover_image อีกต่อไป
        roomData.images = Array.isArray(roomData.images) ? roomData.images : [];
        setRoom(roomData);
        setLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      })
      .catch((error) => {
        console.error("Error fetching room data:", error);
        setError("ไม่สามารถโหลดข้อมูลห้องพักได้");
        setLoading(false);
      });
  }, [id]);

  const handleImageError = (e) => {
    console.log("Image failed to load:", e.target.src);
    e.target.src = "/assets/placeholder-room.jpg";
    e.target.onerror = null;
  };

const getFacilityIcon = (facility) => {
  const facilityMap = {
    'เครื่องปรับอากาศ': <AirVent className="w-5 h-5" />,
    'เครื่องทำน้ำอุ่น': <ShowerHead className="w-5 h-5" />,
    'ตู้เย็น': <Box className="w-5 h-5" />,            // ใช้ Box แทน Refrigerator
    'โทรทัศน์': <Tv className="w-5 h-5" />,
    'โต๊ะทำงาน': <FileText className="w-5 h-5" />,      // ใช้ FileText หรือ LayoutPanelTop
    'เตียง': <BedDouble className="w-5 h-5" />,
    'ตู้เสื้อผ้า': <Box className="w-5 h-5" />,        // ใช้ Box แทน Wardrobe
    'อินเทอร์เน็ต': <Wifi className="w-5 h-5" />,
    'โซฟา': <Sofa className="w-5 h-5" />               // ใช้ Sofa จาก lucide-react
  };

  return facilityMap[facility] || <ShieldCheck className="w-5 h-5" />;
};

  const openModal = (img) => {
    setSelectedImage(img);
    setIsOpen(true);
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error || !room) return <div>{error || "ไม่พบข้อมูลห้องพัก"}</div>;

  const images = Array.isArray(room.images) && room.images.length > 0 ? room.images : ["/assets/placeholder-room.jpg"];
  const facilityList = room.facilities ? (typeof room.facilities === 'string' ? JSON.parse(room.facilities) : room.facilities) : [];

  return (
    <div className="font-[Prompt] bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {/* Navbar */}
      <nav className="sticky top-0 bg-white shadow-md z-50 backdrop-blur-md bg-white/90">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <Link to="/" className="text-3xl font-bold text-blue-700 hover:text-blue-800 transition">
            Rorganize
          </Link>
          <ul className="hidden md:flex gap-8 items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">หน้าหลัก</Link>
            <Link to="/rooms" className="text-gray-700 hover:text-blue-600 transition">ห้องพัก</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">ติดต่อเรา</Link>
            <Link to="/booking" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
              จองห้องพัก
            </Link>
          </ul>
          {/* Mobile menu button would go here */}
        </div>
      </nav>

      {/* Main Content */}
      <div className={`container mx-auto py-12 px-4 lg:px-6 transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Room Status Badge */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/rooms" className="flex items-center text-blue-600 hover:text-blue-800 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับไปหน้าห้องพัก
          </Link>
          <div className={`px-4 py-1 rounded-full text-sm font-medium ${
            room.status === 'available' ? 'bg-green-100 text-green-800' : 
            room.status === 'booked' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {room.status === 'available' ? 'ว่าง' : 
             room.status === 'booked' ? 'จองแล้ว' : 'ไม่ว่าง'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Swiper and Thumbnail */}
          <div className="space-y-6">
            {images.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                effect="fade"
                loop={images.length > 1}
                className="rounded-2xl overflow-hidden w-full h-[500px] shadow-xl"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx} className="bg-gray-100">
                    <div className="relative w-full h-full group">
                      <img 
                        src={img} 
                        alt={`ห้อง ${room.room_number} รูปที่ ${idx+1}`} 
                        onError={handleImageError}
                        className="w-full h-full object-cover cursor-pointer transition duration-300 group-hover:brightness-90"
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 cursor-pointer"
                        onClick={() => openModal(img)}
                      >
                        <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300 bg-white p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="rounded-2xl overflow-hidden w-full h-[500px] shadow-xl bg-gray-100 flex flex-col items-center justify-center">
                <ImageIcon size={64} className="text-gray-400 mb-4" />
                <p className="text-gray-500">ไม่มีรูปภาพ</p>
              </div>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`ภาพตัวอย่างที่ ${idx+1}`}
                    onError={handleImageError}
                    className="w-24 h-16 object-cover rounded-lg shadow hover:shadow-md cursor-pointer hover:ring-2 hover:ring-blue-400 transition transform hover:scale-105"
                    onClick={() => openModal(img)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-blue-700">ห้อง {room.room_number}</h1>
              <p className="text-gray-500">รหัสห้อง: #{id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm">
                <Ruler className="text-blue-500 w-5 h-5" /> <span className="font-medium">{room.size} ตร.ม.</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm">
                <Building2 className="text-blue-500 w-5 h-5" /> <span className="font-medium">ชั้น {room.floor}</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm">
                <BedDouble className="text-blue-500 w-5 h-5" /> <span className="font-medium">{room.type}</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm">
                <CalendarCheck className="text-blue-500 w-5 h-5" /> <span className="font-medium">
                  {new Date(room.created_at).toLocaleDateString('th-TH', {year: 'numeric', month: 'long', day: 'numeric'})}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">ค่าเช่าและค่าใช้จ่าย</h2>
                <div className="h-1 w-20 bg-blue-600 rounded"></div>
              </div>
              
              <div className="text-3xl font-bold text-blue-700">
                ฿{room.rent_price.toLocaleString()} <span className="text-lg font-normal text-gray-600">/ เดือน</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Droplet className="text-blue-500 w-5 h-5" /> <span>ค่าน้ำ</span>
                  </div>
                  <div className="text-xl font-semibold mt-1">฿{room.water_price} <span className="text-sm font-normal">/ หน่วย</span></div>
                </div>
                
                <div className="flex flex-col bg-yellow-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Zap className="text-yellow-500 w-5 h-5" /> <span>ค่าไฟ</span>
                  </div>
                  <div className="text-xl font-semibold mt-1">฿{room.electricity_price} <span className="text-sm font-normal">/ หน่วย</span></div>
                </div>
                
                <div className="flex flex-col bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-700">
                    <ShieldCheck className="text-green-500 w-5 h-5" /> <span>เงินมัดจำ</span>
                  </div>
                  <div className="text-xl font-semibold mt-1">฿{room.deposit.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {room.description && (
              <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-800">รายละเอียดเพิ่มเติม</h2>
                  <div className="h-1 w-20 bg-blue-600 rounded"></div>
                </div>
                <p className="text-gray-700 leading-relaxed">{room.description}</p>
              </div>
            )}

            {facilityList.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-800">สิ่งอำนวยความสะดวก</h2>
                  <div className="h-1 w-20 bg-blue-600 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {facilityList.map((facility, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                      <div className="text-blue-600">
                        {getFacilityIcon(facility)}
                      </div>
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

<div className="space-y-4 pt-4">
              <button
                onClick={() => setIsOpenBooking(true)}
                disabled={room.status !== 'available'}
                className={`block w-full text-center py-4 rounded-xl font-medium text-lg transition transform hover:-translate-y-1 duration-300 ${
                  room.status === 'available' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {room.status === 'available' ? 'จองห้องพักนี้' : 'ห้องพักนี้ไม่ว่าง'}
              </button>
              <Link 
                to="/rooms" 
                className="block border border-gray-300 text-center py-4 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
              >
                ดูห้องพักทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* โมดัลแสดงรูปภาพ */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative mx-auto max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl">
                <div className="flex justify-center items-center bg-white p-2">
                  <div className="relative w-full h-full max-h-[80vh] flex justify-center items-center">
                    <img 
                      src={selectedImage} 
                      alt="ภาพขยาย" 
                      className="max-w-full max-h-[75vh] object-contain"
                      onError={handleImageError}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition transform hover:rotate-90 duration-300"
                >
                  <X size={24} />
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <Transition show={isOpenBooking} as={Fragment}>
  <Dialog onClose={() => setIsOpenBooking(false)} className="relative z-50">
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-blue-900/80 backdrop-blur-sm" />
    </Transition.Child>

    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Dialog.Panel className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto font-prompt">
          {/* Header with decorative elements */}
          <div className="relative mb-5">
            <div className="absolute -top-3 -left-3 w-16 h-16 bg-blue-50 rounded-full opacity-70"></div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-blue-50 rounded-full opacity-70"></div>
            
            <Dialog.Title className="relative text-xl font-bold text-blue-800 flex items-center">
              <span className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3">📋</span>
              จองห้อง {room.room_number}
              <div className="h-1 w-20 bg-blue-600 absolute -bottom-2 left-0 rounded-full"></div>
            </Dialog.Title>
          </div>
          
          {/* Rental Information Section - Redesigned */}
          <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-xl shadow-sm border border-blue-100 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                ค่าเช่าและค่าใช้จ่าย
              </h2>
              <div className="text-xl font-bold text-blue-700 flex items-baseline">
                ฿{room.rent_price.toLocaleString()}
                <span className="text-sm ml-1 text-gray-600">/ เดือน</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center bg-blue-100/50 p-3 rounded-lg border border-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
                <div>
                  <div className="text-xs text-gray-600">ค่าน้ำ</div>
                  <div className="font-bold text-blue-800">฿{room.water_price}<span className="text-xs font-normal ml-1">/ หน่วย</span></div>
                </div>
              </div>
              
              <div className="flex items-center bg-yellow-100/50 p-3 rounded-lg border border-yellow-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-yellow-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <div>
                  <div className="text-xs text-gray-600">ค่าไฟ</div>
                  <div className="font-bold text-yellow-800">฿{room.electricity_price}<span className="text-xs font-normal ml-1">/ หน่วย</span></div>
                </div>
              </div>
              
              <div className="flex items-center bg-green-100/50 p-3 rounded-lg border border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <div>
                  <div className="text-xs text-gray-600">เงินมัดจำ</div>
                  <div className="font-bold text-green-800">฿{room.deposit.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div className="group">
              <label className="block text-sm font-medium text-blue-900 mb-1">ชื่อ - นามสกุล</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="pl-10 w-full rounded-lg border-blue-200 bg-blue-50 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                  value={booking.name}
                  onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  placeholder="กรุณากรอกชื่อและนามสกุล"
                  required
                />
              </div>
            </div>

            {/* Email and Phone in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-medium text-blue-900 mb-1">อีเมล</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    className="pl-10 w-full rounded-lg border-blue-200 bg-blue-50 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                    value={booking.email}
                    onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-blue-900 mb-1">เบอร์โทร</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    className="pl-10 w-full rounded-lg border-blue-200 bg-blue-50 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                    value={booking.phone}
                    onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                    placeholder="0XXXXXXXXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Check-in Date and Duration in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check-in Date */}
              <div className="group">
                <label className="block text-sm font-medium text-blue-900 mb-1">วันที่ต้องการเข้าพัก</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    className="pl-10 w-full rounded-lg border-blue-200 bg-blue-50 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                    value={booking.check_in_date}
                    onChange={(e) => setBooking({ ...booking, check_in_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Duration Dropdown */}
              <div className="group">
                <label className="block text-sm font-medium text-blue-900 mb-1">ระยะเวลาเข้าพัก</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    className="pl-10 w-full rounded-lg border-blue-200 bg-blue-50 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 appearance-none text-sm"
                    value={booking.duration}
                    onChange={(e) => setBooking({ ...booking, duration: e.target.value })}
                    required
                  >
                    <option value="" disabled>เลือกระยะเวลา</option>
                    <option value="1">1 เดือน</option>
                    <option value="3">3 เดือน</option>
                    <option value="6">6 เดือน</option>
                    <option value="12">12 เดือน</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="group">
              <label className="block text-sm font-medium text-blue-900 mb-1">คำขอเพิ่มเติม (ถ้ามี)</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <textarea
                  rows="3"
                  className="pl-10 w-full rounded-lg border-blue-200 bg-blue-50 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                  value={booking.special_requests}
                  onChange={(e) => setBooking({ ...booking, special_requests: e.target.value })}
                  placeholder="กรุณาระบุหากมีความต้องการพิเศษ"
                />
              </div>
            </div>

            {/* Action Buttons with gradients */}
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsOpenBooking(false)} 
                className="px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition duration-200 font-medium text-sm"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg transition duration-200 font-medium flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                ยืนยันการจอง
              </button>
            </div>
          </form>
          
          {/* Decorative element */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 h-1 w-12 bg-blue-200 rounded-full"></div>
        </Dialog.Panel>
      </Transition.Child>
    </div>
  </Dialog>
</Transition>
    </div>
  );
};

export default RoomDetail;