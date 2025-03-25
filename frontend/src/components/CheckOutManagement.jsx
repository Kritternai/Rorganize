import React, { useState } from "react";
import {
  Calendar, ClipboardList, Search, FileText, XCircle, Save
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import "@fontsource/prompt";

const CheckoutManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    inspection_date: "",
    damage_note: "",
    water_meter: "",
    electricity_meter: "",
    outstanding_costs: "",
    refund_note: "",
    deduction: "",
    total_refund: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // TODO: POST to API
    console.log("🚀 Submit Checkout Info:", formData);
    setShowModal(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-[Prompt]">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🚪 จัดการการย้ายออก</h2>
            <p className="text-gray-500">ดำเนินการตรวจสอบและคืนเงินประกันผู้เช่า</p>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            onClick={() => setShowModal(true)}
          >
            <ClipboardList className="mr-2" size={18} />
            เพิ่มข้อมูลการย้ายออก
          </button>
        </header>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText size={20} className="mr-2" /> แบบฟอร์มย้ายออก
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block font-medium mb-1">📆 วันที่นัดตรวจสอบ</label>
                  <input
                    type="date"
                    name="inspection_date"
                    value={formData.inspection_date}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">🧾 ความเสียหาย (ถ้ามี)</label>
                  <textarea
                    name="damage_note"
                    value={formData.damage_note}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border px-3 py-2 rounded-lg"
                    placeholder="รายละเอียดความเสียหาย เช่น ผนัง, เฟอร์นิเจอร์ ฯลฯ"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">มิเตอร์น้ำ (หน่วย)</label>
                    <input
                      type="number"
                      name="water_meter"
                      value={formData.water_meter}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">มิเตอร์ไฟฟ้า (หน่วย)</label>
                    <input
                      type="number"
                      name="electricity_meter"
                      value={formData.electricity_meter}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">💸 ค่าใช้จ่ายคงค้าง</label>
                  <input
                    type="number"
                    name="outstanding_costs"
                    value={formData.outstanding_costs}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">✍️ หมายเหตุการคืนเงิน</label>
                  <textarea
                    name="refund_note"
                    value={formData.refund_note}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full border px-3 py-2 rounded-lg"
                    placeholder="เช่น คืนเต็มจำนวน หรือหักค่าเสียหาย"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">หักค่าเสียหาย (บาท)</label>
                    <input
                      type="number"
                      name="deduction"
                      value={formData.deduction}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">ยอดคืนสุทธิ (บาท)</label>
                    <input
                      type="number"
                      name="total_refund"
                      value={formData.total_refund}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                    onClick={() => setShowModal(false)}
                  >
                    <XCircle size={18} className="mr-1" /> ยกเลิก
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    onClick={handleSubmit}
                  >
                    <Save size={18} className="mr-1" /> บันทึกข้อมูล
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutManagement;