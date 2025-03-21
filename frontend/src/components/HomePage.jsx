import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Tab, Nav } from "react-bootstrap";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/villa.css";
import "../styles/fontawesome.css";
import "../styles/animate.css";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("appartment");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/api/rooms")
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
    <div className="container-fluid p-0">
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


      {/* 🔹 Banner Section */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="main-banner"
      >
  {["bannermain-01.png", "banner-02.jpg"].map((banner, index) => (
    <SwiperSlide key={index}>
      <div className="slide position-relative">
        <img
          src={`/images/${banner}`}
          className="img-fluid w-100"
          alt={`banner-${index + 1}`}
        />
      </div>
    </SwiperSlide>
        ))}
      </Swiper>

      {/* 🔹 Featured Section */}
      <div className="featured section container my-5">
        <div className="row align-items-center text-center text-lg-start">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="left-image position-relative">
              <img src="/images/featured.jpg" alt="Featured" className="img-fluid rounded" />
              <a href="#" className="featured-icon position-absolute bottom-0 start-50 translate-middle-x">
                <img src="/images/featured-icon.png" alt="Icon" />
              </a>
            </div>
          </div>

          <div className="col-lg-5">
            <h6 className="text-danger">| FEATURED</h6>
            <h2 className="fw-bold">Best Apartment &amp; Sea View</h2>
            <p>สัมผัสบรรยากาศที่หรูหราและสะดวกสบาย</p>
          </div>

          <div className="col-lg-3">
            <div className="info-table p-3 bg-light rounded">
              <ul className="list-unstyled">
                {[
                  { icon: "info-icon-01.png", title: "Size", detail: "250 ตร.ม." },
                  { icon: "info-icon-02.png", title: "Contract", detail: "Contract Ready" },
                  { icon: "info-icon-03.png", title: "Payment", detail: "Bank Transfer" },
                  { icon: "info-icon-04.png", title: "Safety", detail: "24/7 Security" },
                ].map((item, i) => (
                  <li key={i} className="d-flex align-items-center mb-3">
                    <img src={`/images/${item.icon}`} alt={item.title} className="me-2" />
                    <div>
                      <h5 className="fw-bold">{item.title}</h5>
                      <span className="text-muted">{item.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Best Deal Section */}
      <div className="section best-deal container my-5">
        <div className="row">
          <div className="col-lg-4 text-center text-lg-start">
            <h6 className="text-danger">| Best Deal</h6>
            <h2>Find Your Best Deal Right Now!</h2>
          </div>

          <div className="col-lg-12">
            <Tab.Container activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)}>
              <Nav className="nav-tabs justify-content-center my-4">
                {["appartment", "villa", "penthouse"].map((tab) => (
                  <Nav.Item key={tab}>
                    <Nav.Link
                      eventKey={tab}
                      className={`btn ${activeTab === tab ? "btn-primary" : "btn-dark"} mx-2`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              <Tab.Content>
                {["appartment", "villa", "penthouse"].map((tab) => (
                  <Tab.Pane eventKey={tab} key={tab} className="fade show">
                    <div className="row align-items-center text-center text-lg-start">
                      <div className="col-lg-3">
                        <div className="info-table p-4 bg-light rounded">
                          <ul className="list-unstyled">
                            <li><strong> Space:</strong> {tab === "appartment" ? "185 m2" : tab === "villa" ? "250 m2" : "320 m2"}</li>
                            <li><strong>Floor Number:</strong> {tab === "appartment" ? "26th" : tab === "villa" ? "26th" : "34th"}</li>
                            <li><strong>Number of Rooms:</strong> {tab === "appartment" ? "4" : tab === "villa" ? "5" : "6"}</li>
                            <li><strong>Parking Available:</strong> Yes</li>
                            <li><strong>Payment Process:</strong> Bank</li>
                          </ul>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <img src={`/images/deal-${tab}.jpg`} alt={`${tab} Image`} className="img-fluid rounded" />
                      </div>

                      <div className="col-lg-3">
                        <h4>Extra Info About {tab.charAt(0).toUpperCase() + tab.slice(1)}</h4>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <button className="btn btn-dark">
                          <i className="fa fa-calendar me-2"></i> Schedule a visit
                        </button>
                      </div>
                    </div>
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Tab.Container>
            
          </div>
        </div>
      </div>


      {/* 🔹 Room Listings */}
      <div className="properties section container my-5">
        <h3 className="text-center">🏠 ห้องพักแนะนำ</h3>

        {loading && <p className="text-center text-primary">⏳ กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-center text-danger">{error}</p>}

        <div className="row">
          {rooms.length > 0 ? rooms.map((room) => (
            <div className="col-lg-4 col-md-6 mb-4" key={room.id}>
              <div className="item shadow-sm p-3">
                <Link to={`/rooms/${room.id}`}>
                  <img 
                    src={room.cover_image || "/images/default-room.jpg"} 
                    alt={`ห้อง ${room.room_number}`} 
                    className="img-fluid w-100 rounded" 
                    style={{ height: "220px", objectFit: "cover" }} 
                  />
                </Link>
                <span className="category">ห้องพักแนะนำ</span>
                <h6 className="fw-bold text-primary">💰 {room.rent_price.toLocaleString()} บาท/เดือน</h6>
                <h4><Link to={`/rooms/${room.id}`}>ห้อง {room.room_number} - เฟอร์ครบ</Link></h4>
                <ul className="list-unstyled">
                  <li>📏 ขนาด: <span>{room.size} ตร.ม.</span></li>
                  <li>🏢 ชั้น: <span>{room.floor}</span></li>
                </ul>

                {/* 🔹 Thumbnail images (ถ้ามี) */}
                {room.images && room.images.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {room.images.map((img, index) => (
                      <img 
                        key={index} 
                        src={img} 
                        alt={`ห้อง ${room.room_number} - ${index + 1}`} 
                        className="rounded border" 
                        style={{ width: "60px", height: "60px", objectFit: "cover" }} 
                      />
                    ))}
                  </div>
                )}

                <div className="main-button mt-3">
                  <Link to={`/rooms/${room.id}`} className="btn btn-outline-primary">
                    🔍 ดูรายละเอียด
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            !loading && <p className="text-center text-muted">⛔ ไม่มีห้องพักในระบบ</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default HomePage;