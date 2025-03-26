// frontend/src/components/UserLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/login", form);
      if (res.data.user.role !== "user") {
        toast.error("เฉพาะผู้ใช้ทั่วไปเท่านั้นที่สามารถเข้าสู่ระบบนี้ได้");
        return;
      }

      localStorage.setItem("user_token", res.data.token);
      localStorage.setItem("user_info", JSON.stringify(res.data.user));
      toast.success("✅ เข้าสู่ระบบสำเร็จ");
      navigate("/user/dashboard"); // เปลี่ยน path ตามที่คุณต้องการ
    } catch (err) {
      toast.error("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-[Prompt]">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">🔐 เข้าสู่ระบบผู้ใช้งาน</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อผู้ใช้"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;