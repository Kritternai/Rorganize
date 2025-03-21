// Rorganize/frontend/src/Room_Detail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

// ตัวอย่างไฟล์ Room_Detail.jsx แสดงรายละเอียดห้อง
// ปกติอาจ fetch จาก Backend หรือรับ props/context ภายนอก
// แต่ในตัวอย่างนี้จะใช้ฟังก์ชันรับ mock data จาก props (ถ้าต้องการ)

function Room_Detail({ rooms }) {
  // ดึงพารามิเตอร์ ID จาก URL
  const { id } = useParams();

  // ค้นหาห้องที่มี id ตรงกับ URL
  const room = rooms.find((r) => r.id === parseInt(id));

  // กรณีไม่พบห้อง
  if (!room) {
    return (
      <div className="container my-5">
        <h2>ไม่พบข้อมูลห้องที่ต้องการ</h2>
        <Link to="/rooms" className="btn btn-secondary mt-3">
          กลับไปยังหน้าห้องพัก
        </Link>
      </div>
    );
  }

  // ถ้าพบห้อง แสดงรายละเอียด
  return (
    <div className="container my-5">
      <div className="card shadow">
        <img
          src={room.image}
          alt={room.name}
          className="card-img-top"
          style={{ height: "300px", objectFit: "cover" }}
        />
        <div className="card-body">
          <h4 className="card-title mb-3">{room.name}</h4>
          <p className="mb-2">
            <strong>ประเภท:</strong> {room.type}
          </p>
          <p className="mb-2">
            <strong>ขนาด:</strong> {room.size} ตร.ม.
          </p>
          <p className="mb-3">
            <strong>ค่าเช่า:</strong>{" "}
            <span className="text-primary">
              {room.rent.toLocaleString()} บาท/เดือน
            </span>
          </p>
          <hr />
          <p className="card-text">
            ห้องพักสะดวกสบาย เหมาะสำหรับการอยู่อาศัยระยะยาว มีสิ่งอำนวยความสะดวก
            เช่น เครื่องปรับอากาศ, อินเทอร์เน็ต ฯลฯ (ตัวอย่างข้อความ)
          </p>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/rooms" className="btn btn-secondary">
              กลับไปหน้าห้องพัก
            </Link>
            <button className="btn btn-primary">จอง/ทำสัญญาเช่า</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room_Detail;