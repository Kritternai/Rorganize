import React, { useState } from "react";
import axios from "axios";

const BookingForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    id_card: "",
    email: "",
    phone: "",
    start_date: "",
    end_date: "",
    deposit: "",
    monthly_rent: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ฟังก์ชันอัปเดตค่าฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันส่งข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // ตรวจสอบข้อมูลเบื้องต้น
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        setError("กรุณาเลือกวันเริ่มสัญญาที่ไม่ย้อนหลัง");
        return;
      }

      if (endDate <= startDate) {
        setError("วันสิ้นสุดสัญญาต้องอยู่หลังวันเริ่มสัญญา");
        return;
      }

      // ตรวจสอบรูปแบบเบอร์โทร (10 หลัก)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)");
        return;
      }

      // ตรวจสอบรูปแบบบัตรประชาชนไทย (13 หลัก) หรือปรับตามความต้องการ
      const idCardRegex = /^[0-9]{13}$/;
      if (!idCardRegex.test(formData.id_card)) {
        setError("กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง");
        return;
      }

      // สร้างสรุปข้อมูลก่อนบันทึก
      const summary = `
        สรุปการจอง/ทำสัญญาเช่ารายเดือน:
        - ชื่อผู้เช่า: ${formData.fullname}
        - เลขบัตรประชาชน: ${formData.id_card}
        - อีเมล: ${formData.email}
        - เบอร์โทร: ${formData.phone}
        - วันที่เริ่มสัญญา: ${startDate.toLocaleDateString("th-TH")}
        - วันที่สิ้นสุดสัญญา: ${endDate.toLocaleDateString("th-TH")}
        - ค่ามัดจำ: ${formData.deposit} บาท
        - ค่าเช่ารายเดือน: ${formData.monthly_rent} บาท
      `;

      // ยืนยันการจอง/ทำสัญญา
      if (window.confirm(summary + "\n\nยืนยันข้อมูลการจอง/เช่าใช่หรือไม่?")) {
        // เรียกใช้งาน API ที่ Backend (ปรับ URL ตามโปรเจ็กต์จริง)
        // ใน SRS อาจส่งไป /api/contracts หรือ /api/bookings ก็แล้วแต่โครงสร้าง
        await axios.post("http://localhost:3001/api/bookings", formData);

        setSuccess("บันทึกข้อมูลการเช่ารายเดือนเรียบร้อยแล้ว");
        setFormData({
          fullname: "",
          id_card: "",
          email: "",
          phone: "",
          start_date: "",
          end_date: "",
          deposit: "",
          monthly_rent: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        จอง/ทำสัญญาเช่ารายเดือน
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ชื่อ-นามสกุล */}
        <div>
          <label className="block text-gray-700 mb-2">ชื่อ-นามสกุล:</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* เลขบัตรประชาชน */}
        <div>
          <label className="block text-gray-700 mb-2">เลขบัตรประชาชน:</label>
          <input
            type="text"
            name="id_card"
            value={formData.id_card}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="ตัวอย่าง: 1234567890123"
            required
          />
        </div>

        {/* อีเมล */}
        <div>
          <label className="block text-gray-700 mb-2">อีเมล:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* เบอร์โทร */}
        <div>
          <label className="block text-gray-700 mb-2">เบอร์โทรศัพท์:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น 0871234567"
            required
          />
        </div>

        {/* วันที่เริ่มสัญญา */}
        <div>
          <label className="block text-gray-700 mb-2">วันที่เริ่มสัญญา:</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* วันที่สิ้นสุดสัญญา */}
        <div>
          <label className="block text-gray-700 mb-2">วันที่สิ้นสุดสัญญา:</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            min={formData.start_date}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* ค่ามัดจำ (Deposit) */}
        <div>
          <label className="block text-gray-700 mb-2">ค่ามัดจำ (บาท):</label>
          <input
            type="number"
            name="deposit"
            value={formData.deposit}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* ค่าเช่ารายเดือน */}
        <div>
          <label className="block text-gray-700 mb-2">ค่าเช่ารายเดือน (บาท):</label>
          <input
            type="number"
            name="monthly_rent"
            value={formData.monthly_rent}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* ปุ่ม Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          บันทึกการจอง/ทำสัญญา
        </button>
      </form>
    </div>
  );
};

export default BookingForm;