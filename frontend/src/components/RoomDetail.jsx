import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { 
  Ruler, Building2, BedDouble, Droplet, Zap, ShieldCheck, X, 
  CalendarCheck, Clock, Wifi, Tv, AirVent, Car, Coffee, ShowerHead,
  Image as ImageIcon
} from 'lucide-react';
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import '@fontsource/prompt';


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

// ✅ ฟังก์ชันยืนยันการจอง
const handleBookingSubmit = async (e) => {
  e.preventDefault();

  if (!room?.id) {
    alert("ไม่พบข้อมูลห้อง");
    return;
  }

  try {
    const response = await axios.post("http://localhost:3001/api/bookings", {
      room_id: room.id,
      ...booking,
    });

    alert("✅ จองห้องเรียบร้อยแล้ว!");
    setIsOpenBooking(false);
  } catch (err) {
    console.error("❌ Booking error:", err.response?.data || err.message);
    alert("❌ ไม่สามารถจองห้องได้");
  }
};

  // เพิ่มรูปภาพ fallback
  const fallbackImage = "/assets/placeholder-room.jpg"; // ปรับตาม path ที่ถูกต้องในโปรเจคของคุณ

  useEffect(() => {
    // เพิ่ม animation เมื่อโหลดข้อมูลเสร็จ
    setIsVisible(false);
    
    axios.get(`http://localhost:3001/api/rooms/${id}`)
      .then(response => {
        // ตรวจสอบและเตรียมข้อมูลรูปภาพ
        const roomData = response.data;
        
        // ตรวจสอบว่ามีรูปภาพหรือไม่ และกำหนดค่า default ถ้าไม่มี
        if (!roomData.cover_image) {
          roomData.cover_image = fallbackImage;
        }
        
        // ตรวจสอบว่า images เป็น array และมีข้อมูลหรือไม่
        if (!roomData.images || !Array.isArray(roomData.images)) {
          roomData.images = [];
        }
        
        setRoom(roomData);
        setLoading(false);
        // Trigger animation after data is loaded
        setTimeout(() => setIsVisible(true), 100);
      })
      .catch((error) => {
        console.error("Error fetching room data:", error);
        setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้");
        setLoading(false);
      });
  }, [id]);

  // ฟังก์ชันสำหรับจัดการเมื่อรูปภาพโหลดไม่สำเร็จ
  const handleImageError = (e) => {
    console.log("Image failed to load:", e.target.src);
    e.target.src = fallbackImage;
    e.target.onerror = null; // ป้องกัน loop ถ้า fallback ก็โหลดไม่สำเร็จ
  };

  const getFacilityIcon = (facility) => {
    const facilityMap = {
      'เครื่องปรับอากาศ': <AirVent className="w-5 h-5" />,
      'อินเทอร์เน็ต': <Wifi className="w-5 h-5" />,
      'ทีวี': <Tv className="w-5 h-5" />,
      'ที่จอดรถ': <Car className="w-5 h-5" />,
      'เครื่องทำน้ำอุ่น': <ShowerHead className="w-5 h-5" />,
      'เครื่องชงกาแฟ': <Coffee className="w-5 h-5" />
    };
    
    return facilityMap[facility] || <ShieldCheck className="w-5 h-5" />;
  };

  const openModal = (img) => {
    setSelectedImage(img);
    setIsOpen(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white font-[Prompt]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 mt-4 text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  if (error || !room) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white font-[Prompt]">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md border-l-4 border-red-500">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
        <p className="text-gray-600">{error || "⚠️ ไม่พบข้อมูลห้องพัก"}</p>
        <Link to="/rooms" className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          กลับไปหน้าห้องพัก
        </Link>
      </div>
    </div>
  );

  // เตรียมรายการรูปภาพและตรวจสอบความถูกต้อง
  let images = [];
  if (room.cover_image) {
    images.push(room.cover_image);
  }
  
  if (room.images && Array.isArray(room.images) && room.images.length > 0) {
    images = [...images, ...room.images];
  }
  
  // หากไม่มีรูปภาพเลย ให้ใส่รูปภาพ placeholder
  if (images.length === 0) {
    images = [fallbackImage];
  }
  
  const facilityList = room.facilities ? (typeof room.facilities === 'string' ? JSON.parse(room.facilities) : room.facilities) : [];

  return (
    <div className="font-[Prompt] bg-gradient-to-b from-blue-50 to-white min-h-screen">
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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
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
        <Dialog.Panel className="w-full max-w-xl bg-white rounded-xl p-6 shadow-xl space-y-6">
          <Dialog.Title className="text-xl font-bold text-blue-700">
            📋 จองห้อง {room.room_number}
          </Dialog.Title>

          {/* ✅ จองห้อง */}
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อ - นามสกุล</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={booking.name}
                onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <input
                  type="email"
                  value={booking.email}
                  onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">เบอร์โทร</label>
                <input
                  type="tel"
                  value={booking.phone}
                  onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">วันที่ต้องการเข้าพัก</label>
              <input
                type="date"
                value={booking.check_in_date}
                onChange={(e) => setBooking({ ...booking, check_in_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ระยะเวลาเข้าพัก (เดือน)</label>
              <input
                type="number"
                min="1"
                value={booking.duration}
                onChange={(e) => setBooking({ ...booking, duration: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">คำขอเพิ่มเติม (ถ้ามี)</label>
              <textarea
                rows="3"
                value={booking.special_requests}
                onChange={(e) => setBooking({ ...booking, special_requests: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsOpenBooking(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                ยกเลิก
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                ยืนยันการจอง
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Transition.Child>
    </div>
  </Dialog>
</Transition>
    </div>
  );
};

export default RoomDetail;