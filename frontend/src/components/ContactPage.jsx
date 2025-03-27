import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const ContactPage = () => {
  return (
    <div className="font-[Prompt] bg-gradient-to-b from-white to-blue-50 text-gray-800 min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md shadow-md z-50 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <Link to="/" className="text-3xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-300">
            The Luxe
          </Link>
          <ul className="flex gap-5 items-center">
            <Link to="/" className="nav-link">หน้าหลัก</Link>
            <Link to="/rooms" className="nav-link">ห้องพัก</Link>
            <Link to="/contact" className="nav-link text-blue-600 font-semibold">ติดต่อเรา</Link>
            <Link to="/login/user" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md">
              เข้าสู่ระบบ
            </Link>
          </ul>
        </div>
      </nav>

      {/* Header Section */}
      <section className="bg-blue-700 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">ติดต่อเรา</h1>
        <p className="text-lg text-blue-100">เรายินดีให้บริการคุณทุกวัน</p>
      </section>

      {/* Contact Information and Form */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">ข้อมูลการติดต่อ</h2>
            <div className="flex items-start gap-4">
              <MapPin className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-700">ที่อยู่</h4>
                <p className="text-gray-600">999/999 ถ.เพชรเกษม , กรุงเทพฯ 10110</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-700">โทรศัพท์</h4>
                <p className="text-gray-600">09-999-9999</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-700">อีเมล</h4>
                <p className="text-gray-600">kb@kb.com</p>
              </div>
            </div>
          </div>

          <form className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-blue-900">ส่งข้อความถึงเรา</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อของคุณ</label>
              <input type="text" className="w-full border border-gray-300 rounded px-4 py-2" placeholder="กรอกชื่อของคุณ" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <input type="email" className="w-full border border-gray-300 rounded px-4 py-2" placeholder="example@gmail.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ข้อความ</label>
              <textarea rows="5" className="w-full border border-gray-300 rounded px-4 py-2" placeholder="พิมพ์ข้อความของคุณ"></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">ส่งข้อความ</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 text-xs py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-2">
          <p>The Luxe – ที่พักหรูสำหรับชีวิตเมืองระดับพรีเมียม</p>
          <p className="text-[11px] text-blue-300">&copy; {new Date().getFullYear()} The Luxe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;