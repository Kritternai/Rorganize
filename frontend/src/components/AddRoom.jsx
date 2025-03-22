import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import { motion } from "framer-motion";
import { Image, Home, Ruler, CreditCard, ClipboardList, PlusCircle } from "lucide-react";
import "@fontsource/prompt";
import "tailwindcss/tailwind.css";

const AddRoom = ({ token }) => {
  const navigate = useNavigate();
  const [newRoom, setNewRoom] = useState({
    room_number: "",
    floor: "",
    type: "",
    size: "",
    rent_price: "",
    deposit: "",
    water_price: "",
    electricity_price: "",
    status: "available",
    facilities: [],
    description: "",
    cover_image: null,
    images: [null, null, null, null, null],
  });

  const [previewImages, setPreviewImages] = useState({ cover: null, images: [] });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "room_number") {
      const onlyNumbers = value.replace(/\D/g, "");
      const floor = onlyNumbers.length >= 3 ? onlyNumbers.charAt(0) : "";
      setNewRoom({ ...newRoom, room_number: onlyNumbers, floor });
    } else {
      setNewRoom({ ...newRoom, [name]: value });
    }
  };

  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      facilities: checked ? [...prev.facilities, value] : prev.facilities.filter((item) => item !== value),
    }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    if (index === "cover") {
      setNewRoom({ ...newRoom, cover_image: file });
      setPreviewImages({ ...previewImages, cover: fileURL });
    } else {
      const updatedImages = [...newRoom.images];
      const updatedPreviews = [...previewImages.images];

      updatedImages[index] = file;
      updatedPreviews[index] = fileURL;

      setNewRoom({ ...newRoom, images: updatedImages });
      setPreviewImages({ ...previewImages, images: updatedPreviews });
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(newRoom).forEach((key) => {
      if (key === "images") {
        newRoom.images.forEach((img) => img && formData.append("images", img));
      } else if (key === "facilities") {
        formData.append("facilities", JSON.stringify(newRoom.facilities));
      } else {
        formData.append(key, newRoom[key]);
      }
    });

    try {
      await axios.post("http://localhost:3001/api/rooms", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      navigate("/admin", { state: { message: "✅ เพิ่มห้องพักเรียบร้อยแล้ว!" } });
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      alert("❌ เกิดข้อผิดพลาดในการเพิ่มห้องพัก");
    } finally {
      setLoading(false);
    }
  };

  // Facilities options for checkboxes
  const facilityOptions = [
    "เครื่องปรับอากาศ", "เครื่องทำน้ำอุ่น", "ตู้เย็น", "โทรทัศน์", 
    "โต๊ะทำงาน", "เตียง", "ตู้เสื้อผ้า", "อินเทอร์เน็ต", "โซฟา"
  ];

  return (
    <div className="flex min-h-screen font-[Prompt] bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
            <PlusCircle size={28} className="text-blue-600" /> เพิ่มห้องพักใหม่
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-5 md:p-6">
              <form onSubmit={handleAddRoom} encType="multipart/form-data" className="space-y-5">
                {/* Room Details Section */}
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <Home className="mr-2" size={20} /> ข้อมูลห้องพัก
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">หมายเลขห้อง *</label>
                      <input
                        type="text"
                        name="room_number"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newRoom.room_number}
                        onChange={handleInputChange}
                        placeholder="เช่น 301"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">ชั้น</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                        value={newRoom.floor}
                        placeholder="ระบบจะกำหนดให้อัตโนมัติ"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">ประเภทห้อง *</label>
                      <select
                        name="type"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newRoom.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">เลือกประเภทห้อง</option>
                        <option value="ห้องเดี่ยว">ห้องเดี่ยว</option>
                        <option value="ห้องคู่">ห้องคู่</option>
                        <option value="ห้องพิเศษ">ห้องพิเศษ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">ขนาดห้อง (ตร.ม.) *</label>
                      <input
                        type="number"
                        name="size"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newRoom.size}
                        onChange={handleInputChange}
                        placeholder="เช่น 24"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="p-4 bg-green-50 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <CreditCard className="mr-2" size={20} /> ราคาและค่าบริการ
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">ค่าเช่า (บาท/เดือน) *</label>
                      <input
                        type="number"
                        name="rent_price"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newRoom.rent_price}
                        onChange={handleInputChange}
                        placeholder="เช่น 4500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">ค่ามัดจำ (บาท) *</label>
                      <input
                        type="number"
                        name="deposit"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newRoom.deposit}
                        onChange={handleInputChange}
                        placeholder="เช่น 8000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">ค่าน้ำ (บาท/หน่วย) *</label>
                      <input
                        type="number"
                        name="water_price"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newRoom.water_price}
                        onChange={handleInputChange}
                        placeholder="เช่น 18"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">ค่าไฟ (บาท/หน่วย) *</label>
                      <input
                        type="number"
                        name="electricity_price"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newRoom.electricity_price}
                        onChange={handleInputChange}
                        placeholder="เช่น 7"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Facilities Section */}
                <div className="p-4 bg-purple-50 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <ClipboardList className="mr-2" size={20} /> สิ่งอำนวยความสะดวก
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {facilityOptions.map((facility, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`facility-${index}`}
                          value={facility}
                          checked={newRoom.facilities.includes(facility)}
                          onChange={handleFacilityChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`facility-${index}`} className="ml-2 text-sm text-gray-700">
                          {facility}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description Section */}
                <div className="p-4 bg-amber-50 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-amber-800 mb-3">รายละเอียดเพิ่มเติม</h3>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">คำอธิบายห้องพัก *</label>
                    <textarea
                      name="description"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows="3"
                      value={newRoom.description}
                      onChange={handleInputChange}
                      placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับห้องพัก..."
                      required
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div className="p-4 bg-rose-50 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-rose-800 mb-3 flex items-center">
                    <Image className="mr-2" size={20} /> รูปภาพห้องพัก
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">รูปหน้าปก *</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        onChange={(e) => handleImageChange(e, "cover")}
                        accept="image/*"
                        required
                      />
                      {previewImages.cover && (
                        <div className="ml-2 w-12 h-12 bg-gray-200 rounded overflow-hidden">
                          <img src={previewImages.cover} alt="Cover preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index}>
                        <label className="block text-gray-700 text-sm font-medium mb-1">รูปห้อง {index + 1} *</label>
                        <div className="flex items-center">
                          <input
                            type="file"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            onChange={(e) => handleImageChange(e, index)}
                            accept="image/*"
                            required
                          />
                          {previewImages.images[index] && (
                            <div className="ml-2 w-10 h-10 bg-gray-200 rounded overflow-hidden">
                              <img src={previewImages.images[index]} alt={`Room ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังเพิ่มห้องพัก...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={20} className="mr-2" /> เพิ่มห้องพัก
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <motion.div 
                className="bg-white p-5 shadow-lg rounded-xl sticky top-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                  <Ruler className="mr-2" size={20} /> ตัวอย่างห้องพัก
                </h3>
                
                {/* Cover Image Preview */}
                {previewImages.cover ? (
                  <div className="mb-4 rounded-lg overflow-hidden h-48 bg-gray-100">
                    <img src={previewImages.cover} alt="Room cover" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="mb-4 rounded-lg overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
                    <Image size={40} className="text-gray-300" />
                  </div>
                )}
                
                {/* Room Details Preview */}
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center py-1 border-b border-gray-100">
                    <span className="font-medium w-36">หมายเลขห้อง:</span>
                    <span className="text-blue-600 font-bold">{newRoom.room_number || "ยังไม่ได้ระบุ"}</span>
                  </div>
                  <div className="flex items-center py-1 border-b border-gray-100">
                    <span className="font-medium w-36">ชั้น:</span>
                    <span>{newRoom.floor || "ยังไม่ได้ระบุ"}</span>
                  </div>
                  <div className="flex items-center py-1 border-b border-gray-100">
                    <span className="font-medium w-36">ประเภท:</span>
                    <span>{newRoom.type || "ยังไม่ได้ระบุ"}</span>
                  </div>
                  <div className="flex items-center py-1 border-b border-gray-100">
                    <span className="font-medium w-36">ขนาด:</span>
                    <span>{newRoom.size ? `${newRoom.size} ตร.ม.` : "ยังไม่ได้ระบุ"}</span>
                  </div>
                  <div className="flex items-center py-1 border-b border-gray-100">
                    <span className="font-medium w-36">ค่าเช่า:</span>
                    <span className="text-green-600 font-semibold">{newRoom.rent_price ? `${Number(newRoom.rent_price).toLocaleString()} บาท/เดือน` : "ยังไม่ได้ระบุ"}</span>
                  </div>
                  <div className="flex items-center py-1 border-b border-gray-100">
                    <span className="font-medium w-36">ค่ามัดจำ:</span>
                    <span>{newRoom.deposit ? `${Number(newRoom.deposit).toLocaleString()} บาท` : "ยังไม่ได้ระบุ"}</span>
                  </div>
                  <div className="flex items-center py-1 border-b border-gray-100">
                    <span className="font-medium w-36">ค่าน้ำ:</span>
                    <span>{newRoom.water_price ? `${newRoom.water_price} บาท/หน่วย` : "ยังไม่ได้ระบุ"}</span>
                  </div>
                  <div className="flex items-center py-1 border-b border-gray-100">
                    <span className="font-medium w-36">ค่าไฟ:</span>
                    <span>{newRoom.electricity_price ? `${newRoom.electricity_price} บาท/หน่วย` : "ยังไม่ได้ระบุ"}</span>
                  </div>
                </div>
                
                {/* Facilities Preview */}
                {newRoom.facilities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">สิ่งอำนวยความสะดวก:</h4>
                    <div className="flex flex-wrap gap-1">
                      {newRoom.facilities.map((facility, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoom;