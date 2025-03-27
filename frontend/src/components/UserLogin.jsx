import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";

const UserLogin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้";
    }
    if (!form.password.trim()) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:3001/api/login", form);
      
      if (res.data.user.role !== "user") {
        toast.error("เฉพาะผู้ใช้ทั่วไปเท่านั้นที่สามารถเข้าสู่ระบบนี้ได้");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("user_token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      localStorage.setItem("user_info", JSON.stringify(res.data.user));
      toast.success("✅ เข้าสู่ระบบสำเร็จ");
      navigate("/user/dashboard");
    } catch (err) {
      toast.error("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 font-[Prompt]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105">
        <div className="flex justify-center mb-6">
          <LockIcon className="w-16 h-16 text-blue-600 animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          เข้าสู่ระบบ
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              className={`w-full border px-4 py-2 rounded-lg transition-all duration-300 
                ${errors.username 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-300' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
                setErrors(prev => ({ ...prev, username: '' }));
              }}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1 animate-bounce">
                {errors.username}
              </p>
            )}
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน"
              className={`w-full border px-4 py-2 rounded-lg pr-10 transition-all duration-300
                ${errors.password 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-300' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setErrors(prev => ({ ...prev, password: '' }));
              }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 animate-bounce">
                {errors.password}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold py-2 rounded-lg transition-all duration-300 
              ${isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default UserLogin;