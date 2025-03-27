import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Eye, X, CreditCard, BadgeCheck, Clock, Ban } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("payment_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    axios
      .get("http://localhost:3001/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPayments(res.data))
      .catch((err) => toast.error("❌ โหลดข้อมูลล้มเหลว"));
  };

  const updateStatus = (id, status) => {
    axios
      .put(
        `http://localhost:3001/api/payments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("✅ อัปเดตสถานะเรียบร้อย");
        fetchPayments();
      })
      .catch(() => toast.error("❌ อัปเดตสถานะไม่สำเร็จ"));
  };
  
  const filteredPayments = payments
    .filter((p) =>
      [p.contract_id, p.payment_date, p.status]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <AdminSidebar>
      <div className="p-6 bg-gray-50 min-h-screen font-[Prompt]">
        <Toaster richColors />
        <header className="bg-white shadow-md p-6 rounded-xl mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">💳 การชำระเงินทั้งหมด</h2>
            <p className="text-gray-500">จัดการการชำระเงิน</p>
          </div>
        </header>

        <div className="mb-4">
          <input
            type="text"
            placeholder="ค้นหา Contract ID, วันที่ หรือ สถานะ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md w-full md:w-1/3"
          />
        </div>
        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
              <th
                onClick={() => {
                  if (sortField === "contract_id") {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("contract_id");
                    setSortDirection("asc");
                  }
                }}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Contract ID
              </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><CreditCard className="inline w-4 h-4 mr-1" /> ยอดชำระ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slip</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิธี</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p, index) => (
                <tr key={p.id} className="text-center">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.contract_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.amount} บาท</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.slipImage ? (
                        <button
                          onClick={() => setSelectedSlip(p.slipImage)}
                          className="text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="inline w-4 h-4 mr-1" /> ดู
                        </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.payment_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-1">
                        {p.status === "completed" && (
                          <div className="flex items-center text-green-600">
                            <BadgeCheck className="w-4 h-4 mr-1" /> <span>ชำระแล้ว</span>
                          </div>
                        )}
                        {p.status === "pending" && (
                          <div className="flex items-center text-yellow-500">
                            <Clock className="w-4 h-4 mr-1" /> <span>รอดำเนินการ</span>
                          </div>
                        )}
                        {p.status === "failed" && (
                          <div className="flex items-center text-red-500">
                            <Ban className="w-4 h-4 mr-1" /> <span>ล้มเหลว</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <select
                          value={p.status}
                          onChange={(e) => updateStatus(p.id, e.target.value)}
                          className="text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">รอดำเนินการ</option>
                          <option value="completed">ชำระแล้ว</option>
                          <option value="failed">ล้มเหลว</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Slip Modal */}
        {selectedSlip && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex justify-center items-center">
            <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full">
              <button
                onClick={() => setSelectedSlip(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
              >
                <X />
              </button>
              <img
                src={`http://localhost:3001/uploads/${selectedSlip}`}
                alt="Slip"
                className="w-full h-auto object-contain max-h-[80vh] rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminPayments;