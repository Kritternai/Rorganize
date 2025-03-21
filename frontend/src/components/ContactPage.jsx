import React from "react";

const ContactPage = () => {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">📞 ติดต่อเรา</h2>
      <div className="row">
        <div className="col-md-6">
          <p><strong>ที่อยู่:</strong> 123/4 ถนนตัวอย่าง, กรุงเทพฯ 10110</p>
          <p><strong>โทรศัพท์:</strong> 02-123-4567</p>
          <p><strong>อีเมล:</strong> info@example.com</p>
        </div>
        <div className="col-md-6">
          <form>
            <div className="mb-3">
              <label className="form-label">ชื่อของคุณ</label>
              <input type="text" className="form-control" placeholder="กรอกชื่อของคุณ" required />
            </div>
            <div className="mb-3">
              <label className="form-label">อีเมล</label>
              <input type="email" className="form-control" placeholder="example@gmail.com" required />
            </div>
            <div className="mb-3">
              <label className="form-label">ข้อความ</label>
              <textarea className="form-control" rows="4" placeholder="พิมพ์ข้อความของคุณ"></textarea>
            </div>
            <button type="submit" className="btn btn-primary">ส่งข้อความ</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;