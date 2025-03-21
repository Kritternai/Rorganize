import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function DashboardPage({ token }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get("http://localhost:3001/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setDashboardData(response.data);
      })
      .catch(() => {
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">แดชบอร์ดผู้ดูแลระบบ</h2>
      {error && <p className="text-danger">{error}</p>}
      <button className="btn btn-danger mb-3" onClick={handleLogout}>ออกจากระบบ</button>
      <Link to="/add-room" className="btn btn-success mb-3 ms-2">เพิ่มห้องพัก</Link>
      
      {dashboardData ? (
        <div className="row">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5>จำนวนห้องทั้งหมด</h5>
              <p>{dashboardData.total_rooms}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5>ห้องที่มีผู้เช่า</h5>
              <p>{dashboardData.occupied_rooms}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5>ห้องว่าง</h5>
              <p>{dashboardData.available_rooms}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
}

export default DashboardPage;