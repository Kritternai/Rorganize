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
  const [financialStats, setFinancialStats] = useState({
    total_income: 52932,
    total_due: 0,
    total_refund: 42423,
    tax_rate: 0.05
  });
  const [maintenanceStats, setMaintenanceStats] = useState({
    total_requests: 0,
    completed_requests: 0,
    pending_requests: 0,
    in_progress_requests: 0
  });
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

  // Additional export function for financial stats
  const exportFinancialStatsToExcel = () => {
    const financialData = [
      {
        "รายการ": "รายได้รวมประจำเดือน",
        "มูลค่า": financialStats.total_income
      },
      {
        "รายการ": "ลูกหนี้ค้างชำระ",
        "มูลค่า": financialStats.total_due
      },
      {
        "รายการ": "การคืนเงินประกัน",
        "มูลค่า": financialStats.total_refund
      },
      {
        "รายการ": "ภาษีหัก ณ ที่จ่าย (5%)",
        "มูลค่า": (financialStats.total_income * financialStats.tax_rate)
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(financialData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, "financial_report.xlsx");
  };

  // Export maintenance stats to Excel
  const exportMaintenanceStatsToExcel = () => {
    const maintenanceData = [
      {
        "รายการ": "ประวัติการซ่อมแซม",
        "มูลค่า": maintenanceStats.total_requests
      },
      {
        "รายการ": "ค่าใช้จ่ายการซ่อมบำรุง (ประมาณ)",
        "มูลค่า": maintenanceStats.total_requests * 300
      },
      {
        "รายการ": "สถิติการแจ้งซ่อม - เสร็จแล้ว",
        "มูลค่า": maintenanceStats.completed_requests
      },
      {
        "รายการ": "การตรวจสอบอุปกรณ์ (รอดำเนินการ)",
        "มูลค่า": maintenanceStats.pending_requests + maintenanceStats.in_progress_requests
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(maintenanceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, "maintenance_report.xlsx");
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

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
            📑 รายงานการเงินเพิ่มเติม
            <button 
              onClick={exportFinancialStatsToExcel}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              📤 ส่งออก Excel
            </button>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryCard label="📦 รายได้รวมประจำเดือน" value={`฿${financialStats.total_income.toLocaleString()}`} />
            <SummaryCard label="💳 ลูกหนี้ค้างชำระ" value={`฿${financialStats.total_due.toLocaleString()}`} />
            <SummaryCard label="💸 การคืนเงินประกัน" value={`฿${financialStats.total_refund.toLocaleString()}`} />
            <SummaryCard 
              label="📄 ภาษีหัก ณ ที่จ่าย (5%)" 
              value={`฿${(financialStats.total_income * financialStats.tax_rate).toLocaleString()}`} 
            />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
            🛠️ รายงานการบำรุงรักษา
            <button 
              onClick={exportMaintenanceStatsToExcel}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              📤 ส่งออก Excel
            </button>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryCard label="📋 ประวัติการซ่อมแซม" value={`${maintenanceStats.total_requests} รายการ`} />
            <SummaryCard 
              label="💰 ค่าใช้จ่ายการซ่อมบำรุง (ประมาณ)" 
              value={`฿${(maintenanceStats.total_requests * 300).toLocaleString()}`} 
            />
            <SummaryCard label="📊 สถิติการแจ้งซ่อม - เสร็จแล้ว" value={`${maintenanceStats.completed_requests} รายการ`} />
            <SummaryCard 
              label="🧾 การตรวจสอบอุปกรณ์ (รอดำเนินการ)" 
              value={`${maintenanceStats.pending_requests + maintenanceStats.in_progress_requests} รายการ`} 
            />
          </div>
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

const SummaryCard = ({ label, value }) => (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-full">
    <div>
      <h2 className="text-md font-semibold text-gray-800 mb-2">{label}</h2>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  </div>
);

export default Reports;