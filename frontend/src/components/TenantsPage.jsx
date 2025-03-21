// Rorganize/frontend/src/components/TenantsPage.jsx
import React from "react";

function TenantsPage() {
  return (
    <div className="container my-5">
      <h2 className="mb-4">ผู้เช่า (Tenants)</h2>
      <p>
        หน้าสำหรับจัดการข้อมูลผู้เช่า เช่น เพิ่ม/แก้ไข/ลบ
        แสดงประวัติการเช่า เบอร์โทร ติดต่อฉุกเฉิน ฯลฯ
      </p>
      <div className="alert alert-secondary">
        ตัวอย่าง: ตารางแสดงรายชื่อผู้เช่า / ฟอร์มเพิ่มผู้เช่า
      </div>
    </div>
  );
}

export default TenantsPage;