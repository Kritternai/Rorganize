import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogIn } from "lucide-react";
import { toast } from "react-toastify";
import "@fontsource/prompt";

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้";
    }
    if (!form.password.trim()) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/api/login", form);
      if (response.data.token) {
        localStorage.setItem("admin_token", response.data.token);
        onLogin(response.data.token);
        toast.success("✅ เข้าสู่ระบบสำเร็จ");
        navigate("/admin");
      }
    } catch (err) {
      setError({ form: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      toast.error("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 font-[Prompt]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105">
        <div className="flex justify-center mb-6">
          <LogIn className="w-16 h-16 text-blue-600 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          เข้าสู่ระบบผู้ดูแล
        </h2>

        {error.form && (
          <div className="mb-4 text-center bg-red-100 text-red-600 py-2 rounded">{error.form}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              className={`w-full border px-4 py-2 rounded-lg transition-all duration-300 
                ${error.username
                  ? "border-red-500 focus:ring-2 focus:ring-red-300"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
                setError((prev) => ({ ...prev, username: "" }));
              }}
            />
            {error.username && <p className="text-red-500 text-sm mt-1">{error.username}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              className={`w-full border px-4 py-2 rounded-lg transition-all duration-300
                ${error.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-300"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setError((prev) => ({ ...prev, password: "" }));
              }}
            />
            {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold py-2 rounded-lg transition-all duration-300 
              ${isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;