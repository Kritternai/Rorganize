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
      <>
        <div className="p-8 font-[Prompt] text-center">
          <p className="text-gray-500">ไม่พบข้อมูลการเช่า</p>
        </div>

        {/* Latest Utility Bill Section */}
        <div className="bg-white rounded-xl shadow p-6 space-y-3 mt-6">
          <h3 className="text-lg font-semibold text-gray-700">💡 บิลล่าสุด</h3>
          <div className="text-sm text-gray-600">
            <div><strong>ค่าน้ำ:</strong> {contract?.water_usage ?? '-'} หน่วย</div>
            <div><strong>ค่าไฟ:</strong> {contract?.electricity_usage ?? '-'} หน่วย</div>
            <div><strong>รวมยอดชำระ:</strong> {contract?.total_amount ?? '-'} บาท</div>
            <div><strong>สถานะ:</strong> {contract?.bill_status ?? '-'}</div>
            <div><strong>วันที่ออกบิล:</strong> {contract?.billing_date ?? '-'}</div>
          </div>
        </div>

        {/* Maintenance Request Form */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🛠 แจ้งปัญหาการซ่อมบำรุง</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const description = e.target.description.value;
            axios.post("http://localhost:3001/api/maintenance-requests", {
              room_id: contract?.room_id,
              description
            }, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
              alert("✅ ส่งคำร้องซ่อมเรียบร้อย");
              e.target.reset();
            })
            .catch(() => {
              alert("❌ ส่งคำร้องไม่สำเร็จ");
            });
          }}>
            <textarea
              name="description"
              rows="3"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg mb-3"
              placeholder="รายละเอียดปัญหาที่พบ"
              required
            ></textarea>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ส่งคำร้อง
            </button>
          </form>
        </div>
      </>
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
        <div><strong>เบอร์โทร:</strong> {contract.phone}</div>
        <div><strong>ข้อมูลรถ:</strong> {contract.vehicle_info?.plate ?? '-'} ({contract.vehicle_info?.type ?? '-'}, {contract.vehicle_info?.color ?? '-'})</div>
        <div><strong>สถานะบิลล่าสุด:</strong> {contract.bill_status ?? '-'}</div>
        <div><strong>ยอดบิล:</strong> {contract.total_amount ? contract.total_amount + ' บาท' : '-'}</div>
        <div><strong>ค่าน้ำ:</strong> {contract.water_usage ? contract.water_usage + ' หน่วย' : '-'}</div>
        <div><strong>ค่าไฟ:</strong> {contract.electricity_usage ? contract.electricity_usage + ' หน่วย' : '-'}</div>
        <div><strong>วันที่ออกบิล:</strong> {contract.billing_date ?? '-'}</div>
      </div>
    </div>
  );
};

export default UserDashboard;