import React, { useState } from "react";
import { ClipboardList, KeyRound, Camera, FileText, Home, CheckSquare } from "lucide-react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import "@fontsource/prompt";

const CheckInManagement = () => {
  const [form, setForm] = useState({
    tenantName: "",
    contractId: "",
    waterMeter: "",
    electricityMeter: "",
    keyCardDelivered: false,
    assetNote: "",
    rulesAcknowledged: false,
    propertyCondition: "",
    roomPhotos: [],
    handoverNote: ""
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handlePhotoUpload = (e) => {
    setForm({
      ...form,
      roomPhotos: Array.from(e.target.files)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("tenantName", form.tenantName);
      formData.append("contractId", form.contractId);
      formData.append("waterMeter", form.waterMeter);
      formData.append("electricityMeter", form.electricityMeter);
      formData.append("keyCardDelivered", form.keyCardDelivered.toString());
      formData.append("assetNote", form.assetNote);
      formData.append("rulesAcknowledged", form.rulesAcknowledged.toString());
      formData.append("propertyCondition", form.propertyCondition);
      formData.append("handoverNote", form.handoverNote);

      form.roomPhotos.forEach((photo) => {
        formData.append("roomPhotos", photo);
      });

      const response = await axios.post("http://localhost:3001/api/checkin", formData);
      alert("✅ " + response.data.message);
      console.log("📥 Response:", response.data);
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("❌ เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-[Prompt]">
      <AdminSidebar />
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
            <ClipboardList className="mr-2" /> การรับผู้เช่าใหม่
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-sm">ชื่อผู้เช่า</label>
              <input type="text" name="tenantName" value={form.tenantName} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">รหัสสัญญาเช่า</label>
              <input type="text" name="contractId" value={form.contractId} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">มิเตอร์น้ำเริ่มต้น</label>
              <input type="number" name="waterMeter" value={form.waterMeter} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">มิเตอร์ไฟฟ้าเริ่มต้น</label>
              <input type="number" name="electricityMeter" value={form.electricityMeter} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="keyCardDelivered" checked={form.keyCardDelivered} onChange={handleInputChange} />
                <span className="text-sm">ส่งมอบกุญแจและการ์ดแล้ว</span>
              </label>
            </div>

            <div className="col-span-2">
              <label className="block mb-1 font-medium text-sm">รายการทรัพย์สิน / หมายเหตุ</label>
              <textarea name="assetNote" value={form.assetNote} onChange={handleInputChange} rows={3} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="rulesAcknowledged" checked={form.rulesAcknowledged} onChange={handleInputChange} />
                <span className="text-sm">ผู้เช่ารับทราบกฎระเบียบ</span>
              </label>
            </div>

            <div className="col-span-2">
              <label className="block mb-1 font-medium text-sm">สภาพห้องก่อนเข้าพัก</label>
              <textarea name="propertyCondition" value={form.propertyCondition} onChange={handleInputChange} rows={2} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="col-span-2">
              <label className="block mb-1 font-medium text-sm">แนบรูปภาพห้อง (ก่อนเข้าพัก)</label>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="w-full" />
            </div>

            <div className="col-span-2">
              <label className="block mb-1 font-medium text-sm">หมายเหตุการรับมอบทรัพย์สิน</label>
              <textarea name="handoverNote" value={form.handoverNote} onChange={handleInputChange} rows={2} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="col-span-2 text-right mt-4">
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <CheckSquare className="inline mr-1 -mt-1" size={16} /> บันทึกข้อมูลการเข้าพัก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckInManagement;