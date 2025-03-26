import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Home,
  CreditCard,
  Wrench,
  AlertCircle,
  X,
  Printer,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import "@fontsource/prompt";

const UserDashboard = () => {
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [slip, setSlip] = useState(null);
  const token = localStorage.getItem("user_token");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/user/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setContract(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("ไม่สามารถโหลดข้อมูลได้", {
          description: "กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแล",
        });
        setIsLoading(false);
      });
  }, [token]);

  const handleSubmitPayment = async () => {
    if (!confirmed || !contract?.id) {
      return toast.warning("กรุณายืนยันและแนบสลิปก่อนดำเนินการ");
    }
    try {
      const billRes = await axios.get(`http://localhost:3001/api/utility-bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestBill = billRes.data.find((b) => b.contract_id === contract.id);
      if (!latestBill) return toast.error("ไม่พบบิลล่าสุด");

      const formData = new FormData();
      formData.append("contract_id", contract.id);
      formData.append("amount", latestBill.total_amount);
      formData.append("method", "bank_transfer");
      formData.append("slip", slip);

      await axios.post("http://localhost:3001/api/payments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✅ ชำระเงินสำเร็จ");
      setShowInvoiceModal(false);
      setShowReceiptModal(true);
    } catch (err) {
      toast.error("❌ ไม่สามารถชำระเงินได้", {
        description: err.response?.data?.error,
      });
    }
  };

  const handleMaintenanceRequest = async (e) => {
    e.preventDefault();
    const description = e.target.description.value;
    try {
      await axios.post(
        "http://localhost:3001/api/maintenance-requests",
        { room_id: contract?.room_id, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ ส่งคำร้องซ่อมเรียบร้อย");
      setShowMaintenanceModal(false);
    } catch {
      toast.error("❌ ส่งคำร้องไม่สำเร็จ");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen font-[Prompt]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8 text-center font-[Prompt]">
        <Toaster richColors />
        <AlertCircle className="mx-auto text-yellow-500 mb-4 w-16 h-16" />
        <p className="text-gray-600 text-lg">ไม่พบข้อมูลการเช่า</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-[Prompt]">
      <Toaster richColors />

      <header className="bg-white shadow-md p-6 rounded-xl mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Home className="text-blue-500" /> ข้อมูลห้องพักของคุณ
        </h2>
        <p className="text-gray-500 mt-1">รายละเอียดเกี่ยวกับห้องพักและบิลล่าสุด</p>
      </header>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4 text-sm">
          <p><strong>ชื่อผู้เช่า:</strong> {contract.fullname}</p>
          <p><strong>เบอร์โทร:</strong> {contract.phone}</p>
          <p><strong>ห้อง:</strong> {contract.room_number}</p>
          <p><strong>ชั้น:</strong> {contract.floor}</p>
          <p><strong>ประเภท:</strong> {contract.type}</p>
          <p><strong>ขนาด:</strong> {contract.size} ตร.ม.</p>
          <p><strong>ค่าเช่า:</strong> {contract.rent_price} บาท</p>
          <p><strong>สถานะห้อง:</strong> {contract.room_status}</p>
        </div>

        <hr />

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <p><strong>ระยะเวลาเช่า:</strong> {contract.start_date} ถึง {contract.end_date}</p>
          <p><strong>สถานะสัญญา:</strong> {contract.status}</p>
        </div>

        <hr />

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <p><strong>ค่าน้ำ:</strong> {contract.water_usage ?? "-"} หน่วย</p>
          <p><strong>ค่าไฟ:</strong> {contract.electricity_usage ?? "-"} หน่วย</p>
          <p><strong>รวมยอด:</strong> {contract.total_amount ?? "-"} บาท</p>
          <p><strong>สถานะบิล:</strong> {contract.bill_status ?? "-"}</p>
          <p><strong>วันที่ออกบิล:</strong> {contract.billing_date ?? "-"}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
            onClick={() => setShowInvoiceModal(true)}
          >
            <CreditCard className="inline mr-2" /> ชำระเงินบิล
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            onClick={() => setShowMaintenanceModal(true)}
          >
            <Wrench className="inline mr-2" /> แจ้งซ่อมบำรุง
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
                alt="logo"
                className="mx-auto w-16 mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800">ใบแจ้งหนี้</h2>
              <p className="text-base text-gray-600">Rorganize Apartment</p>
              <p className="text-sm text-gray-500">123 ถนนสุขุมวิท, กรุงเทพฯ</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-500">เลขที่:</p>
                <p className="font-medium">#{contract?.id}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">วันที่ออกบิล:</p>
                <p>{contract?.billing_date}</p>
              </div>
              <div>
                <p className="text-gray-500">ผู้เช่า:</p>
                <p>{contract?.fullname}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">ห้อง:</p>
                <p>{contract?.room_number}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-700 border-b font-semibold">
                    <th className="py-2">รายการ</th>
                    <th className="text-right">หน่วยละ</th>
                    <th className="text-right">จำนวน</th>
                    <th className="text-right">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">ค่าน้ำ</td>
                    <td className="text-right">{contract?.water_price}</td>
                    <td className="text-right">{contract?.water_usage}</td>
                    <td className="text-right">
                      {(contract?.water_usage * contract?.water_price).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">ค่าไฟ</td>
                    <td className="text-right">{contract?.electricity_price}</td>
                    <td className="text-right">{contract?.electricity_usage}</td>
                    <td className="text-right">
                      {(contract?.electricity_usage * contract?.electricity_price).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="font-medium border-t">
                    <td className="py-2">ค่าเช่า</td>
                    <td className="text-right">-</td>
                    <td className="text-right">-</td>
                    <td className="text-right">{contract?.rent_price}</td>
                  </tr>
                  <tr className="font-bold border-t">
                    <td className="py-2">รวมทั้งหมด</td>
                    <td colSpan="2"></td>
                    <td className="text-right">
                      {(contract?.rent_price + (contract?.water_usage * contract?.water_price) + (contract?.electricity_usage * contract?.electricity_price)).toFixed(2)} บาท
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <label className="block mb-2 font-medium text-sm">แนบสลิปการโอนเงิน</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSlip(e.target.files[0])}
                className="w-full text-sm mb-4"
              />
              <label className="inline-flex items-center text-sm mb-4">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                ฉันยืนยันว่าได้โอนเงินแล้ว
              </label>
              <button
                onClick={handleSubmitPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-base"
              >
                📤 ส่งหลักฐานการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
                alt="logo"
                className="mx-auto w-16 mb-4"
              />
              <h4 className="text-2xl font-bold text-gray-800">Rorganize Apartment</h4>
              <p className="text-sm text-gray-500">123 ถนนสุขุมวิท, กรุงเทพฯ</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm border-b pb-4">
              <div>
                <p className="text-gray-500">เลขที่ใบเสร็จ:</p>
                <p>#{contract?.id}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">วันที่:</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">ผู้เช่า:</p>
                <p>{contract?.fullname}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">ห้อง:</p>
                <p>{contract?.room_number}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-700 border-b font-semibold">
                    <th className="py-2 text-left">รายการ</th>
                    <th className="text-right">หน่วยละ</th>
                    <th className="text-right">จำนวน</th>
                    <th className="text-right">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">ค่าน้ำ</td>
                    <td className="text-right">{contract?.water_price}</td>
                    <td className="text-right">{contract?.water_usage}</td>
                    <td className="text-right">
                      {(contract?.water_usage * contract?.water_price).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">ค่าไฟ</td>
                    <td className="text-right">{contract?.electricity_price}</td>
                    <td className="text-right">{contract?.electricity_usage}</td>
                    <td className="text-right">
                      {(contract?.electricity_usage * contract?.electricity_price).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="font-medium border-t">
                    <td className="py-2">ค่าเช่า</td>
                    <td className="text-right">-</td>
                    <td className="text-right">-</td>
                    <td className="text-right">{contract?.rent_price}</td>
                  </tr>
                  <tr className="font-bold border-t">
                    <td className="py-2">รวมทั้งหมด</td>
                    <td colSpan="2"></td>
                    <td className="text-right">
                      {(contract?.rent_price + (contract?.water_usage * contract?.water_price) + (contract?.electricity_usage * contract?.electricity_price)).toFixed(2)} บาท
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500 space-y-2">
                <p>📧 info@rorganize.com</p>
                <p>📞 02-123-4567</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-2xl relative">
            <button 
              onClick={() => setShowMaintenanceModal(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">แจ้งปัญหาการซ่อมบำรุง</h3>
            <form onSubmit={handleMaintenanceRequest}>
              <textarea
                name="description"
                rows="4"
                className="w-full border px-3 py-2 rounded-lg mb-4 text-sm"
                placeholder="รายละเอียดปัญหาที่พบ"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-base"
              >
                ส่งคำร้อง
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;