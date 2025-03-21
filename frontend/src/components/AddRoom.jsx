import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/AddRoom.css";

function AddRoom({ token }) {
  const navigate = useNavigate();

  const [newRoom, setNewRoom] = useState({
    room_number: "",
    floor: "",
    type: "",
    size: "",
    rent_price: "",
    deposit: "",
    water_price: "",
    electricity_price: "",
    status: "available",
    facilities: [],
    description: "",
    cover_image: null,
    images: [null, null, null, null, null],
  });

  const [previewImages, setPreviewImages] = useState({
    cover: null,
    images: [],
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "room_number") {
      const onlyNumbers = value.replace(/\D/g, "");
      const floor = onlyNumbers.length >= 3 ? onlyNumbers.charAt(0) : "";
      setNewRoom({ ...newRoom, room_number: onlyNumbers, floor });
    } else {
      setNewRoom({ ...newRoom, [name]: value });
    }
  };

  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      facilities: checked
        ? [...prev.facilities, value]
        : prev.facilities.filter((item) => item !== value),
    }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    if (index === "cover") {
      setNewRoom({ ...newRoom, cover_image: file });
      setPreviewImages({ ...previewImages, cover: fileURL });
    } else {
      const updatedImages = [...newRoom.images];
      const updatedPreviews = [...previewImages.images];

      updatedImages[index] = file;
      updatedPreviews[index] = fileURL;

      setNewRoom({ ...newRoom, images: updatedImages });
      setPreviewImages({ ...previewImages, images: updatedPreviews });
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(newRoom).forEach((key) => {
      if (key === "images") {
        newRoom.images.forEach((img) => img && formData.append("images", img));
      } else if (key === "facilities") {
        formData.append("facilities", JSON.stringify(newRoom.facilities));
      } else {
        formData.append(key, newRoom[key]);
      }
    });

    try {
      await axios.post("http://localhost:3001/api/rooms", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      navigate("/admin", { state: { message: "✅ เพิ่มห้องพักเรียบร้อยแล้ว!" } });
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      alert("❌ เกิดข้อผิดพลาดในการเพิ่มห้องพัก");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="addroom-container">
      <AdminSidebar />

      <div className="addroom-content container-fluid">
        <div className="row">
          {/* 🔹 ซ้าย: ฟอร์มกรอกข้อมูล */}
          <div className="col-md-6 p-5">
            <h2 className="text-primary text-center">เพิ่มห้องพักใหม่</h2>

            <form onSubmit={handleAddRoom} encType="multipart/form-data">
              <div className="row g-3">
                {/* หมายเลขห้อง, ชั้น */}
                <div className="col-md-6">
                  <label className="form-label">หมายเลขห้อง</label>
                  <input
                    type="text"
                    name="room_number"
                    className="form-control"
                    value={newRoom.room_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ชั้น</label>
                  <input type="text" className="form-control" value={newRoom.floor} disabled />
                </div>

                {/* ประเภท, ขนาด, ค่าเช่า, ค่ามัดจำ, ค่าน้ำ, ค่าไฟ */}
                {["type", "size", "rent_price", "deposit", "water_price", "electricity_price"].map((field, index) => (
                  <div className="col-md-6" key={index}>
                    <label className="form-label">{field.replace("_", " ").toUpperCase()}</label>
                    <input
                      type={field === "type" ? "text" : "number"}
                      name={field}
                      className="form-control"
                      value={newRoom[field]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ))}

                {/* คำอธิบาย */}
                <div className="col-md-12">
                  <label className="form-label">คำอธิบาย</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={newRoom.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* รูปภาพ */}
                <div className="col-md-12">
                  <label className="form-label">รูปหน้าปก</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => handleImageChange(e, "cover")}
                    accept="image/*"
                    required
                  />
                </div>

                {[...Array(5)].map((_, index) => (
                  <div className="col-md-4" key={index}>
                    <label className="form-label">รูปห้อง {index + 1}</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleImageChange(e, index)}
                      accept="image/*"
                      required
                    />
                  </div>
                ))}

                <button type="submit" className="btn btn-success w-100 mt-4" disabled={loading}>
                  {loading ? "กำลังเพิ่มห้องพัก..." : "เพิ่มห้องพัก"}
                </button>
              </div>
            </form>
          </div>

          {/* Preview ข้อมูล */}
          <div className="col-md-5 bg-light p-5">
            <h4 className="text-center">ตัวอย่างห้องพัก</h4>
            <div className="preview-card p-3 border rounded shadow-sm">
              <h5>หมายเลขห้อง: {newRoom.room_number || "N/A"}</h5>
              <p>ประเภท: {newRoom.type || "N/A"}</p>
              <p>ขนาด: {newRoom.size || "N/A"} ตร.ม.</p>
              <p>ค่าเช่า: {newRoom.rent_price || "N/A"} บาท/เดือน</p>
              <p>ค่ามัดจำ: {newRoom.deposit || "N/A"} บาท</p>
              <p>สถานะ: {newRoom.status}</p>
              <p>สิ่งอำนวยความสะดวก: {newRoom.facilities.length > 0 ? newRoom.facilities.join(", ") : "N/A"}</p>
              <p>คำอธิบาย: {newRoom.description || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRoom;