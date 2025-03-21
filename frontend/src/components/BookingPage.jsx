import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    start_date: "",
    note: "",
  });

  // ดึงข้อมูลห้องจาก API
  useEffect(() => {
    axios.get(`http://localhost:3001/api/rooms/${id}`)
      .then((response) => {
        setRoom(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("❌ ไม่สามารถโหลดข้อมูลห้องพัก กรุณาลองใหม่");
        setLoading(false);
      });
  }, [id]);

  // อัปเดตฟอร์ม
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ส่งข้อมูลการจองไป Backend
  const handleBooking = (e) => {
    e.preventDefault();
    axios.post("http://localhost:3001/api/bookings", { ...formData, room_id: id })
      .then(() => {
        alert("✅ การจองสำเร็จ!");
        navigate("/");
      })
      .catch(() => alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่"));
  };

  if (loading) return <div className="container my-5 text-center">⏳ กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="container my-5 text-danger text-center">{error}</div>;
  if (!room) return <div className="container my-5 text-warning text-center">⚠️ ไม่มีข้อมูลห้องพัก</div>;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">🛏 จองห้องพักหมายเลข {room.room_number}</h2>

      <div className="row">
        {/* รูปภาพห้อง */}
        <div className="col-md-6">
          <img src={`http://localhost:3001/uploads/${room.cover_image}`} alt="รูปห้อง" className="img-fluid rounded shadow" />
          <p className="mt-3"><strong>ประเภท:</strong> {room.type}</p>
          <p><strong>ขนาด:</strong> {room.size} ตร.ม.</p>
          <p><strong>ค่าเช่า:</strong> {room.rent_price.toLocaleString()} บาท/เดือน</p>
          <p><strong>ค่ามัดจำ:</strong> {room.deposit.toLocaleString()} บาท</p>
          <p><strong>สถานะ:</strong> <span className={`badge bg-${room.status === "available" ? "success" : "danger"}`}>{room.status}</span></p>
        </div>

        {/* ฟอร์มจองห้อง */}
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h4 className="text-center">📋 กรอกข้อมูลการจอง</h4>
            <form onSubmit={handleBooking}>
              <div className="mb-3">
                <label className="form-label">ชื่อ-นามสกุล</label>
                <input type="text" name="fullname" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">เบอร์โทรศัพท์</label>
                <input type="tel" name="phone" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">อีเมล (ถ้ามี)</label>
                <input type="email" name="email" className="form-control" onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">วันที่ต้องการเข้าพัก</label>
                <input type="date" name="start_date" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">หมายเหตุพิเศษ (ถ้ามี)</label>
                <textarea name="note" className="form-control" rows="3" onChange={handleChange}></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100">📩 ยืนยันการจอง</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;