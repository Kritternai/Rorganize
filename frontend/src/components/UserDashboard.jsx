import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Home,
  CreditCard,
  Wrench,
  AlertCircle,
  X,
  FileText,
  Clock,
  CheckCircle,
  LogOut,
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_info");
    navigate("/login/user");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setContract({
          id: data.contract_id,
          fullname: data.fullname,
          phone: data.phone,
          email: data.email,
          room_id: data.room_id,
          room_number: data.room_number,
          floor: data.floor,
          type: data.type,
          rent_price: data.rent_price || data.rent_amount,
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.contract_status,
          water_price: data.bill_water_price || data.water_price,
          electricity_price: data.bill_electricity_price || data.electricity_price,
          water_usage: data.water_usage || 0,
          electricity_usage: data.electricity_usage || 0,
          total_amount: data.total_amount || 0,
          billing_date: data.billing_date,
          bill_status: data.bill_status || "unpaid",
        });
        setIsLoading(false);
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลได้", {
          description: "กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแล",
        });
        setIsLoading(false);
      }
    };
  
    if (token) {
      fetchDashboardData();
    } else {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      setIsLoading(false);
    }
  }, [token]);

  const [latestPaymentStatus, setLatestPaymentStatus] = useState(null);

  useEffect(() => {
    const fetchLatestPayment = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/payments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const related = res.data
          .filter(p => p.contract_id === contract.id)
          .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
        
        if (related.length > 0) {
          const latest = related[0];
          setLatestPaymentStatus(latest.status);
          if (latest.status === 'completed') {
            setContract(prev => ({ ...prev, bill_status: 'completed' }));
          } else if (latest.status === 'pending') {
            setContract(prev => ({ ...prev, bill_status: 'pending' }));
          } else if (latest.status === 'failed') {
            setContract(prev => ({ ...prev, bill_status: 'failed' }));
          }
        }
      } catch (e) {
        console.error("ไม่สามารถโหลดสถานะการชำระเงิน:", e);
      }
    };

    if (contract?.id) {
      fetchLatestPayment();
    }
  }, [contract]);

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
      setLatestPaymentStatus("pending");
    } catch (err) {
      toast.error("❌ ไม่สามารถชำระเงินได้", {
        description: err.response?.data?.error || "เกิดข้อผิดพลาด",
      });
    }
  };

  const handleMaintenanceRequest = async (e) => {
    e.preventDefault();
    const description = e.target.description.value;
    
    if (!contract?.room_id) {
      return toast.error("ไม่พบข้อมูลห้อง");
    }

    try {
      await axios.post(
        "http://localhost:3001/api/maintenance-requests",
        { room_id: contract.room_id, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ ส่งคำร้องซ่อมเรียบร้อย");
      setShowMaintenanceModal(false);
    } catch (error) {
      toast.error("❌ ส่งคำร้องไม่สำเร็จ", {
        description: error.response?.data?.error || "เกิดข้อผิดพลาด",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen font-[Prompt] bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8 text-center font-[Prompt] bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex flex-col justify-center items-center">
        <Toaster richColors />
        <AlertCircle className="text-yellow-500 mb-4 w-20 h-20 animate-pulse" />
        <p className="text-gray-600 text-xl font-semibold">ไม่พบข้อมูลการเช่า</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen font-[Prompt] p-4 md:p-8">
      <Toaster richColors />
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-[1.02]">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <User className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{contract.fullname}</h2>
            <p className="text-lg text-gray-500">ห้อง {contract.room_number}</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
              <div className="flex items-center mb-2">
                <CheckCircle className="mr-3 text-green-500" />
                <p className="text-sm text-gray-600">สถานะสัญญา</p>
              </div>
              <p className="font-semibold text-gray-800">
                {contract.status === 'active' ? 'ใช้งาน' : 'รอดำเนินการ'}
              </p>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
              <div className="flex items-center mb-2">
                <Calendar className="mr-3 text-blue-500" />
                <p className="text-sm text-gray-600">ระยะเวลาเช่า</p>
              </div>
              <p className="font-semibold text-gray-800">
                {contract.start_date} - {contract.end_date}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <LogOut className="mr-2" /> ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Invoice Summary */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-3 text-blue-600" /> สรุปค่าใช้จ่าย
              </h3>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                contract.bill_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                contract.bill_status === 'completed' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {contract.bill_status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-2">
                  <DollarSign className="mr-3 text-blue-500" />
                  <p className="text-sm text-gray-600">ค่าน้ำ</p>
                </div>
                <p className="font-semibold text-gray-800">{contract.water_price} บาท</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-2">
                  <DollarSign className="mr-3 text-blue-500" />
                  <p className="text-sm text-gray-600">ค่าไฟ</p>
                </div>
                <p className="font-semibold text-gray-800">{contract.electricity_price} บาท</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-2">
                  <Home className="mr-3 text-blue-500" />
                  <p className="text-sm text-gray-600">ค่าเช่า</p>
                </div>
                <p className="font-semibold text-gray-800">{contract.rent_price} บาท</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
                <div className="flex items-center mb-2">
                  <CreditCard className="mr-3 text-blue-500" />
                  <p className="text-sm text-gray-600">รวมทั้งหมด</p>
                </div>
                <p className="font-bold text-blue-700 text-xl">
                  {contract.total_amount.toFixed(2)} บาท
                </p>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <CreditCard className="mr-2" /> ชำระเงินบิล
              </button>
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <Wrench className="mr-2" /> แจ้งซ่อมบำรุง
              </button>
            </div>
          </div>
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
                    <p className="font-medium">#{contract?.id || "ไม่มีข้อมูล"}</p>
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
                          {(contract.rent_price + (contract.water_usage * contract.water_price) + (contract.electricity_usage * contract.electricity_price)).toFixed(2)} บาท
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
                  {latestPaymentStatus === "completed" ? (
                    <button
                      disabled
                      className="bg-gray-400 text-white py-2 rounded-lg w-full cursor-not-allowed"
                    >
                      ✅ ชำระเงินแล้ว
                    </button>
                  ) : latestPaymentStatus === "pending" ? (
                    <button
                      disabled
                      className="bg-yellow-400 text-white py-2 rounded-lg w-full cursor-not-allowed"
                    >
                      🕒 กำลังตรวจสอบ
                    </button>
                  ) : (
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSubmitPayment}
                      disabled={!confirmed || !slip}
                    >
                      💳 ชำระเงิน
                    </button>
                  )}
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
                          {(contract.rent_price + (contract.water_usage * contract.water_price) + (contract.electricity_usage * contract.electricity_price)).toFixed(2)} บาท
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
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition duration-200"
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