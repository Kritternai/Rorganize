// Payments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import {
  RefreshCw,
  Search,
  Home,
  CalendarCheck2,
  XCircle,
  ClipboardList,
  Plus,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Download
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const Payments = () => {
  const [contracts, setContracts] = useState([]);
  const [utilityBills, setUtilityBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [billForm, setBillForm] = useState({ water_usage: "", electricity_usage: "" });
  const [monthFilter, setMonthFilter] = useState("");

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [contractsRes, billsRes] = await Promise.all([
        axios.get("http://localhost:3001/api/contracts", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3001/api/utility-bills", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const contractsWithRoomInfo = contractsRes.data.map((contract) => ({
        ...contract,
        water_price: contract.water_price || contract.rent_price,
        electricity_price: contract.electricity_price || contract.rent_price,
      }));

      setContracts(contractsWithRoomInfo);
      setUtilityBills(billsRes.data);
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      console.error("❌ Error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const openModal = (contract, bill = null) => {
    setSelectedContract(contract);
    setSelectedBill(bill);
    if (bill) {
      setBillForm({
        water_usage: bill.water_usage,
        electricity_usage: bill.electricity_usage,
      });
    } else {
      setBillForm({ water_usage: "", electricity_usage: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContract(null);
    setSelectedBill(null);
  };

  const handleChange = (e) => {
    setBillForm({ ...billForm, [e.target.name]: e.target.value });
  };

  const submitBill = async () => {
    try {
      const payload = {
        contract_id: selectedContract.id,
        water_usage: parseFloat(billForm.water_usage) || 0,
        electricity_usage: parseFloat(billForm.electricity_usage) || 0,
      };

      if (selectedBill) {
        await axios.put(`http://localhost:3001/api/utility-bills/${selectedBill.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("อัปเดตบิลสำเร็จ!");
      } else {
        await axios.post("http://localhost:3001/api/utility-bills", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("เพิ่มบิลสำเร็จ!");
      }

      closeModal();
      fetchData();
    } catch (err) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const exportToExcel = () => {
    const exportData = utilityBills.map((bill) => {
      const contract = contracts.find(c => c.id === bill.contract_id);
      return {
        ห้อง: contract?.room_number || "-",
        ผู้เช่า: contract?.tenant_name || "-",
        หน่วยน้ำ: bill.water_usage,
        หน่วยไฟ: bill.electricity_usage,
        ยอดรวม: bill.total_amount,
        วันที่ออกบิล: new Date(bill.billing_date).toLocaleDateString(),
        สถานะ: bill.status
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UtilityBills");
    XLSX.writeFile(workbook, "utility_bills.xlsx");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "text-green-600";
      case "pending": return "text-yellow-600";
      case "overdue": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const filteredContracts = contracts.filter((c) =>
    c.room_number?.toString().includes(searchTerm) ||
    c.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBills = utilityBills.filter(bill => {
    const date = new Date(bill.billing_date);
    const monthMatch = monthFilter ? date.toISOString().slice(0, 7) === monthFilter : true;
    const contract = contracts.find(c => c.id === bill.contract_id);
    const searchMatch = contract?.room_number?.toString().includes(searchTerm) || contract?.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return monthMatch && searchMatch;
  });

  return (
    <AdminSidebar>
      <div className="p-6 bg-gray-50 min-h-screen font-[Prompt]">
        <header className="bg-white shadow-md p-6 rounded-xl flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">💧 จัดการบิลค่าน้ำ-ไฟ</h2>
            <p className="text-gray-500">เพิ่ม แก้ไข และส่งออกข้อมูลบิลค่าน้ำ-ค่าไฟ</p>
          </div>
          <div className="flex space-x-2">
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="border rounded px-3 py-1"
            />
            <button onClick={fetchData} className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <RefreshCw size={18} className={isRefreshing ? "animate-spin mr-2" : "mr-2"} /> รีเฟรช
            </button>
            <button onClick={exportToExcel} className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              <Download size={18} className="mr-2" /> ส่งออก Excel
            </button>
          </div>
        </header>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard label="สัญญาทั้งหมด" count={contracts.length} icon={<Home size={20} />} color="blue" />
          <StatCard label="บิลทั้งหมด" count={utilityBills.length} icon={<CalendarCheck2 size={20} />} color="green" />
          <StatCard label="รอการชำระ" count={utilityBills.filter(bill => bill.status === 'pending').length} icon={<XCircle size={20} />} color="red" />
        </div>
        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg"
              placeholder="ค้นหาห้องหรือผู้เช่า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Contract Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredContracts.length > 0 ? (
            filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col justify-between border border-gray-100"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">ห้อง {contract.room_number}</h3>
                    <button
                      onClick={() => openModal(contract)}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">ผู้เช่า: {contract.tenant_name}</p>
                  <p className="text-sm text-gray-600">ค่าเช่า: {contract.rent_amount} บาท</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 bg-white p-8 rounded-xl shadow">
              <AlertTriangle className="mx-auto mb-2" size={32} /> ไม่พบสัญญาที่ตรงกับการค้นหา
            </div>
          )}
        </div>

        {/* Bills Table */}
        <div className="bg-white shadow rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ห้อง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้เช่า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">น้ำ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ไฟ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ยอดรวม</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => {
                  const contract = contracts.find(c => c.id === bill.contract_id);
                  return (
                    <tr key={bill.id}>
                      <td className="px-6 py-4 text-sm">{contract?.room_number || "-"}</td>
                      <td className="px-6 py-4 text-sm">{contract?.tenant_name || "-"}</td>
                      <td className="px-6 py-4 text-sm">{bill.water_usage}</td>
                      <td className="px-6 py-4 text-sm">{bill.electricity_usage}</td>
                      <td className="px-6 py-4 text-sm">{bill.total_amount}</td>
                      <td className="px-6 py-4 text-sm">{new Date(bill.billing_date).toLocaleDateString()}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${getStatusColor(bill.status)}`}>{bill.status}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(contract, bill)}
                          className="text-blue-600 hover:underline text-sm flex items-center"
                        >
                          <Pencil size={14} className="mr-1" /> แก้ไข
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-400">
                    <AlertTriangle className="mx-auto mb-2" /> ไม่มีรายการบิลในช่วงเวลานี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showModal && selectedContract && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{selectedBill ? "📝 แก้ไขบิล" : "➕ เพิ่มบิล"}</h2>
              <p className="mb-2 text-sm text-gray-600">ห้อง {selectedContract.room_number} - ผู้เช่า: {selectedContract.tenant_name}</p>
              <label className="block mb-3">
                หน่วยน้ำ:
                <input
                  type="number"
                  name="water_usage"
                  value={billForm.water_usage}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded"
                />
              </label>
              <label className="block mb-4">
                หน่วยไฟ:
                <input
                  type="number"
                  name="electricity_usage"
                  value={billForm.electricity_usage}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={closeModal}>ยกเลิก</button>
                <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={submitBill}>บันทึก</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </AdminSidebar>
  );
};
// Reusable StatCard component
const StatCard = ({ label, count, icon, color }) => {
  const colorMap = {
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    green: "border-green-500 bg-green-100 text-green-700",
    red: "border-red-500 bg-red-100 text-red-700"
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 ${colorMap[color]} flex items-center justify-between`}>
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <div className="p-3 rounded-full bg-white shadow-sm">{icon}</div>
    </div>
  );
};

export default Payments;