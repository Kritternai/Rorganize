# 🏢 Rorganize System – Use Case Explanation

อธิบายการทำงานของระบบ Rorganize Apartment Management System โดยอ้างอิงจาก Use Case Diagram แนวนอน พร้อมแยกหมวดหมู่การทำงานชัดเจน

---

## 🔐 1. Authentication

- **Guest**
  - `Register` – ลงทะเบียนเข้าใช้งานระบบ
- **Tenant / Admin**
  - `Login` – เข้าสู่ระบบโดยใช้ Username & Password

---

## 🛏️ 2. Room Management

- **Guest**
  - `Browse Rooms` – ดูรายการห้องว่าง
- **Tenant**
  - `View Room Details` – ดูข้อมูลห้องที่เช่า
- **Admin**
  - `Add Room` – เพิ่มห้องใหม่
  - `Edit Room` – แก้ไขข้อมูลห้อง
  - `Delete Room` – ลบห้อง
  - `View Room Status` – ตรวจสอบสถานะห้องทั้งหมด (available, reserved, occupied, maintenance)

---

## 📆 3. Booking Management

- **Guest**
  - `Make Booking` – จองห้องพัก
  - `Cancel Booking` *(<<extend>>)* – ยกเลิกห้องจอง
- **Admin**
  - `View Booking List` – ดูรายการจอง
  - `Update Booking Status` – ยืนยัน / ยกเลิกการจอง

---

## 👤 4. Tenant Management

- **Tenant**
  - `Update Profile` – แก้ไขข้อมูลส่วนตัว
  - `Upload ID Document` – แนบเอกสารประจำตัว
- **Admin**
  - `Add Tenant`
  - `Edit Tenant`
  - `View Tenant List`

---

## 📑 5. Contract Management

- **Tenant**
  - `View Contract`
  - `Download Contract PDF` *(<<extend>>)* – ดาวน์โหลดฉบับสัญญา
- **Admin**
  - `Create Contract`
  - `Edit Contract`
  - `Terminate Contract`

---

## 🏠 6. Check-in / Check-out

- **Tenant**
  - `Request Checkout` – แจ้งย้ายออก
  - `Acknowledge Rules` *(<<extend>>)* – ยอมรับกฎก่อนย้ายออก
- **Admin**
  - `Perform Check-in` – บันทึกการเข้าพัก
  - `Inspect Room` – ตรวจสอบห้องก่อนย้ายออก
  - `Upload Room Photos` *(<<extend>>)* – แนบรูปห้อง
  - `Perform Checkout` – บันทึกการย้ายออก
  - `Delete Contract Data` *(<<extend>>)* – ล้างข้อมูลที่เกี่ยวข้อง

---

## 💵 7. Billing & Payment

- **Tenant**
  - `View Utility Bills`
  - `Pay Utility Bill` *(<<extend>>)* – หากยังไม่ได้ชำระ
  - `View Rent Invoice`
  - `Upload Payment Slip`
  - `View Payment Status`
- **Admin**
  - `Generate Utility Bills`
  - `Add Extra Charges` *(<<extend>>)* – เพิ่มค่าบริการ
  - `Verify Payments`
  - `Update Payment Status`
  - `Mark Bill as Paid` *(<<extend>>)*

---

## 🛠️ 8. Maintenance Requests

- **Tenant**
  - `Submit Maintenance Request` – แจ้งปัญหา
- **Admin**
  - `View Maintenance Requests`
  - `Update Maintenance Status`

---

## 📊 9. Dashboard & Reports

- **Tenant**
  - `View Dashboard` – ดูข้อมูลการใช้บริการของตัวเอง
- **Admin**
  - `View Admin Dashboard` – ภาพรวมสถานะห้อง/ผู้เช่า
  - `View Financial Summary`
  - `Generate Reports` – การเงิน, การเช่า, การซ่อม

---

## 🔔 10. Notifications

- **Tenant**
  - `View Notifications`
- **Admin**
  - `Send Notifications`
  - `Auto Reminder` *(<<extend>>)* – แจ้งเตือนอัตโนมัติ เช่น ค้างชำระ, สัญญาใกล้หมด

---

## ✅ Summary of Actors and Use Cases

| Actor    | Use Cases |
|----------|-----------|
| **Guest**   | Register, Browse Rooms, Make Booking, Cancel Booking |
| **Tenant**  | Login, View Dashboard, Manage Profile, View Bills, Make Payments, Request Checkout, etc. |
| **Admin**   | Manage Rooms, Tenants, Bookings, Contracts, Bills, Reports, Notifications, etc. |

---