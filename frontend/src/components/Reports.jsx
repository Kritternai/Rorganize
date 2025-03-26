import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AdminSidebar from "./AdminSidebar";

const Reports = () => {
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const token = localStorage.getItem("admin_token");

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [contractRes, paymentRes, checkoutRes, maintenanceRes] = await Promise.all([
        axios.get("http://localhost:3001/api/contracts", { headers }),
        axios.get("http://localhost:3001/api/payments", { headers }),
        axios.get("http://localhost:3001/api/checkout", { headers }),
        axios.get("http://localhost:3001/api/maintenance-requests", { headers })
      ]);
      setContracts(contractRes.data);
      setPayments(paymentRes.data);
      setCheckouts(checkoutRes.data);
      setMaintenance(maintenanceRes.data);
    } catch (err) {
      console.error("❌ ดึงข้อมูลรายงานล้มเหลว:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, `${filename}.xlsx`);
  };

  return (
    <AdminSidebar>
      <div className="p-6 font-[Prompt]">
        <h1 className="text-2xl font-bold mb-6">📊 รายงานระบบ</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard title="รายงานสัญญาเช่า" data={contracts} onExport={() => exportToExcel(contracts, "contracts_report")} />
          <ReportCard title="รายงานการชำระเงิน" data={payments} onExport={() => exportToExcel(payments, "payments_report")} />
          <ReportCard title="รายงานการย้ายออก" data={checkouts} onExport={() => exportToExcel(checkouts, "checkouts_report")} />
          <ReportCard title="รายงานการซ่อมบำรุง" data={maintenance} onExport={() => exportToExcel(maintenance, "maintenance_report")} />
        </div>
      </div>
    </AdminSidebar>
  );
};

const ReportCard = ({ title, data, onExport }) => (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-full">
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-500">พบข้อมูล {data.length} รายการ</p>
    </div>
    <button
      onClick={onExport}
      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
    >
      📤 ส่งออก Excel
    </button>
  </div>
);

export default Reports;