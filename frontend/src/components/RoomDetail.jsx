import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/RoomDetail.css";

function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3001/api/rooms/${id}`)
      .then((response) => {
        setRoom(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="container my-5 text-center">⏳ กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div className="container my-5 text-danger text-center">{error}</div>;
  }

  return (
    <div className="container my-5">
      <div className="card shadow p-4">
        <div className="row">
          {/* 🔹 Left Panel: รูปภาพห้องพัก */}
          <div className="col-md-6">
            <img
              src={room.cover_image ? `/uploads/${room.cover_image}` : "https://via.placeholder.com/500"}
              alt={`ห้อง ${room.room_number}`}
              className="img-fluid rounded shadow-sm main-image"
            />
            <div className="thumbnail-container mt-3">
              {room.images && room.images.length > 0 ? (
                room.images.map((img, index) => (
                  <img key={index} src={`/uploads/${img}`} alt={`รูปที่ ${index + 1}`} className="thumbnail" />
                ))
              ) : (
                <p className="text-muted">ไม่มีรูปภาพเพิ่มเติม</p>
              )}
            </div>
          </div>

          {/* 🔹 Right Panel: รายละเอียดห้องพัก */}
          <div className="col-md-6">
            <h2 className="text-primary">🏠 ห้อง {room.room_number}</h2>
            <p className="text-muted">ประเภท: <b>{room.type}</b></p>
            <p>📏 ขนาด: <b>{room.size} ตร.ม.</b></p>
            <p>💰 ค่าเช่า: <b className="text-success">{room.rent_price.toLocaleString()} บาท/เดือน</b></p>
            <p>🔐 ค่ามัดจำ: <b>{room.deposit.toLocaleString()} บาท</b></p>
            <p>💧 ค่าน้ำ: <b>{room.water_price} บาท/ยูนิต</b> | ⚡ ค่าไฟ: <b>{room.electricity_price} บาท/หน่วย</b></p>
            <p>🛠️ สถานะ: <span className={`badge ${room.status === "available" ? "bg-success" : "bg-danger"}`}>{room.status}</span></p>

            {/* สิ่งอำนวยความสะดวก */}
            <h5 className="mt-4">✅ สิ่งอำนวยความสะดวก</h5>
            <ul className="list-group">
              {room.facilities.length > 0 ? (
                room.facilities.map((facility, index) => (
                  <li key={index} className="list-group-item">{facility}</li>
                ))
              ) : (
                <li className="list-group-item text-muted">ไม่มีข้อมูล</li>
              )}
            </ul>

            {/* ปุ่มจองห้องพัก */}
            <div className="mt-4">
              <Link to="/booking" className="btn btn-primary btn-lg w-100">📅 จองห้องพักนี้</Link>
              <Link to="/rooms" className="btn btn-outline-secondary btn-lg w-100 mt-2">🔙 กลับไปหน้าห้องพัก</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetail;