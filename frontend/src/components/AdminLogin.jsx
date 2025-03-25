import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogIn } from 'lucide-react';
import "@fontsource/prompt";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("admin_token", response.data.token);
        onLogin(response.data.token);
        navigate("/admin");
      }
    } catch (err) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-[Prompt] flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h2 className="text-3xl text-center font-bold text-gray-800 flex items-center justify-center gap-2 mb-6">
            <LogIn className="text-blue-600" size={32} /> เข้าสู่ระบบผู้ดูแล
          </h2>

          {error && <div className="mb-4 text-center bg-red-100 text-red-600 py-2 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium">ชื่อผู้ใช้</label>
              <input
                type="text"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">รหัสผ่าน</label>
              <input
                type="password"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition shadow"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;
