// Rorganize/frontend/src/components/PaymentsPage.jsx
import React from "react";

function PaymentsPage() {
  return (
    <div className="container my-5">
      <h2 className="mb-4">การจัดเก็บค่าเช่าและค่าบริการ (Payments)</h2>
      <p>
        รองรับการเรียกเก็บค่าเช่ารายเดือน, ค่าน้ำ, ค่าไฟ, และช่องทางการชำระเงิน
      </p>
      <div className="alert alert-info">
        ตัวอย่าง: ตารางใบแจ้งหนี้, สถานะการชำระเงิน, ปุ่ม \"จ่าย\"
      </div>
    </div>
  );
}

export default PaymentsPage;