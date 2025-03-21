import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/rooms.css";  

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true }); 
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/rooms")
      .then((response) => {
        setRooms(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("❌ ไม่สามารถโหลดข้อมูลห้องพักได้");
        setLoading(false);
      });
  }, []);

  return (
    <div className="room-page">

      {/* 🔹 Header */}
      <header className="header-area header-sticky">
        <div className="container">
          <nav className="main-nav">
            <Link to="/" className="logo">
              <h1>Rorganize</h1>
            </Link>
            <ul className="nav">
              <li><Link to="/" className="active">หน้าหลัก</Link></li>
              <li><Link to="/rooms">ห้องพัก</Link></li>
              <li><Link to="/contact">ติดต่อเรา</Link></li>
              <li><a href="#"><i className="fa fa-calendar"></i> จองห้องพัก</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 🔹 Banner */}
      <div className="banner-room d-flex align-items-center justify-content-center text-center">
        <h1 className="fw-bold text-white" data-aos="fade-down">ค้นหาห้องพักของคุณ</h1>
      </div>

      {/* 🔹 Room Listings */}
      <div className="properties section container my-5">
        {loading && <p className="text-center text-primary">⏳ กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-center text-danger">{error}</p>}

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div className="col" key={room.id} data-aos="fade-up">
                <div className="room-card card h-100 shadow-lg">
                  {/* รูปภาพห้อง */}
                  <Link to={`/rooms/${room.id}`} className="room-image">
                    <img
                      src={room.cover_image || "/images/default-room.jpg"}
                      alt={`ห้อง ${room.room_number}`}
                      className="card-img-top"
                    />
                  </Link>

                  <div className="card-body d-flex flex-column">
                    <h5 className="room-title fw-bold">ห้อง {room.room_number}</h5>
                    <p className="text-muted">📏 ขนาด: {room.size} ตร.ม. | 🏢 ชั้น {room.floor}</p>
                    <p className="room-price fw-bold">💰 {room.rent_price.toLocaleString()} บาท/เดือน</p>

                    {/* สิ่งอำนวยความสะดวก */}
                    <div className="facilities">
                      {room.amenities?.map((amenity, index) => (
                        <span key={index} className="badge bg-primary me-1">{amenity}</span>
                      ))}
                    </div>

                    {/* Thumbnail รูปภาพเพิ่มเติม */}
                    {room.images && room.images.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {room.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`ห้อง ${room.room_number} - ${index + 1}`}
                            className="thumbnail rounded border"
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-auto">
                      <Link to={`/rooms/${room.id}`} className="btn btn-dark w-100 mt-3">
                        🔍 ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="text-center text-muted">⛔ ไม่มีห้องพักในระบบ</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;