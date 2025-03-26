import React, { useEffect, useState } from "react";
import axios from "axios";

const UserDashboard = () => {
  const [contract, setContract] = useState(null);
  const token = localStorage.getItem("user_token");

  useEffect(() => {
    axios.get("http://localhost:3001/api/user/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setContract(res.data))
    .catch((err) => console.error("❌ ไม่พบข้อมูลการเช่า", err));
  }, [token]);

  if (!contract) {
    return (
      <div className="p-8 font-[Prompt] text-center">
        <p className="text-gray-500">ไม่พบข้อมูลการเช่า</p>
      </div>
    );
  }

  return (
    <div className="p-8 font-[Prompt] max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🏠 ข้อมูลห้องพักของคุณ</h2>
      <div className="bg-white rounded-xl shadow p-6 space-y-3">
        <div><strong>ชื่อผู้เช่า:</strong> {contract.fullname}</div>
        <div><strong>หมายเลขห้อง:</strong> {contract.room_number}</div>
        <div><strong>ชั้น:</strong> {contract.floor}</div>
        <div><strong>ขนาดห้อง:</strong> {contract.size} ตร.ม.</div>
        <div><strong>ค่าเช่า:</strong> {contract.rent_price} บาท</div>
        <div><strong>สถานะห้อง:</strong> {contract.status}</div>
        <div><strong>ระยะเวลาเช่า:</strong> {contract.start_date} ถึง {contract.end_date}</div>
      </div>
    </div>
  );
};

export default UserDashboard;