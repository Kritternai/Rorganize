
# Rorganize – ระบบจัดการหอพักรายเดือน / Monthly Apartment Management System

**TH:** Rorganize คือระบบเว็บแอปพลิเคชันที่ช่วยให้เจ้าของหอพักสามารถจัดการการเช่ารายเดือนแบบครบวงจร  
**EN:** Rorganize is a web-based application designed to help apartment owners manage monthly rentals comprehensively.

---

## 🔧 Tech Stack

**TH:**  
- **Frontend**: React.js + Tailwind CSS + Framer Motion + AOS  
- **Backend**: Node.js + Express.js  
- **Database**: SQLite3  
- **Authentication**: JWT Token  
- **Report Export**: XLSX

**EN:**  
- **Frontend**: React.js + Tailwind CSS + Framer Motion + AOS  
- **Backend**: Node.js + Express.js  
- **Database**: SQLite3  
- **Authentication**: JWT Token  
- **Report Export**: XLSX

---

## 📦 การติดตั้งระบบ / Installation

### 1. Clone โปรเจกต์ / Clone the project

```bash
git clone https://github.com/Kritternai/Rorganize.git
cd rorganize
```

### 2. ติดตั้ง Dependency / Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

---

## ▶️ การใช้งานระบบ / Usage

### 1. เริ่มต้น Backend Server / Start Backend Server

```bash
cd server
node server.js
```

API จะรันที่ / API will run at: `http://localhost:3001/`

### 2. เริ่มต้น Frontend / Start Frontend

```bash
cd client
npm run dev
```

Frontend จะรันที่ / Frontend will run at: `http://localhost:999/`

---

## 🗃️ โครงสร้างฐานข้อมูล / Database Structure

**TH:** ระบบใช้ตาราง SQLite หลัก ๆ เช่น  
**EN:** Key SQLite tables used:

- `users` – ข้อมูลผู้ใช้ / User info
- `rooms` – ห้องพัก / Room details
- `tenants` – ผู้เช่า / Tenant info
- `contracts` – สัญญาเช่า / Rental contracts
- `utility_bills` – ค่าน้ำไฟ / Utility bills
- `payments` – การชำระเงิน / Payments
- `bookings` – การจอง / Bookings
- `checkins` / `checkouts` – การเข้าออกห้องพัก / Check-in/out
- `maintenance_requests` – แจ้งซ่อม / Maintenance
- `reports` – รายงาน / Reports
- `notifications`, `backups` – การแจ้งเตือนและสำรอง / Notifications and backups

📌 ระบบจะสร้าง `rorganize.db` อัตโนมัติเมื่อรัน server  
📌 System will auto-create `rorganize.db` when the server runs

---

## 🔐 ระบบการเข้าสู่ระบบ / Login System

- **Admin**: `/login`
- **Tenant**: `/login/user`

**บทบาท / Roles:**

- **Admin**: จัดการห้อง ผู้เช่า รายงาน / Manage rooms, tenants, and reports  
- **Tenant**: ดูข้อมูลห้อง ค่าบริการ ชำระเงิน / View rental info and pay bills

---

## 💡 ฟีเจอร์หลัก / Key Features

### Admin

- 📋 รายการห้อง / Room list  
- 👨‍💼 จัดการผู้เช่า / Manage tenants  
- 💧 คำนวณค่าน้ำไฟ / Auto calculate utilities  
- 💸 ตรวจสอบการชำระเงิน / Verify payments  
- 📊 สรุปรายงาน / Reports  
- 📦 ระบบแจ้งซ่อม / Maintenance requests

### Tenant

- 🏠 ดูสถานะห้อง / View room status  
- 🧾 ตรวจสอบใบแจ้งหนี้ / Check invoices  
- 📤 อัปโหลดสลิป / Upload payment slips  
- 📬 แจ้งปัญหา / Report issues  
- 📝 เช็คอิน/เช็คเอาท์ / Check-in/out online

---

## 🧪 ตัวอย่าง Endpoint / Sample Endpoints

| Method | Endpoint | TH | EN |
|--------|----------|----|----|
| `POST` | `/api/login` | ล็อกอิน | Login |
| `GET`  | `/api/admin/rooms` | รายการห้อง | Room list |
| `POST` | `/api/admin/utility-bills` | เพิ่มค่าน้ำไฟ | Add utility bills |
| `GET`  | `/api/user/dashboard` | หน้าผู้ใช้ | User dashboard |
| `POST` | `/api/payments/upload` | อัปโหลดสลิป | Upload slip |

---

## 📤 การส่งออกรายงาน / Report Export

**TH:** จากหน้า Reports สามารถส่งออกข้อมูล `.xlsx` ได้  
**EN:** From Reports page, you can export `.xlsx` reports

- รายงานรายรับ-รายจ่าย / Income-expense
- สถานะห้อง / Room status
- แจ้งซ่อม / Maintenance

---

## 🧑‍🏫 เหมาะสำหรับใคร / Who is this for?

- นักศึกษา / Students  
- นักพัฒนา / Developers  
- เจ้าของหอพัก / Apartment owners  
- ผู้สนใจระบบเช่า / Anyone studying rental systems

---

## 📌 หมายเหตุ / Notes

- สร้างเพื่อการศึกษา / Educational purpose  
- ปรับแต่งได้อิสระ / Fully customizable  
- รองรับมือถือ / Mobile responsive

---

## 🙌 Contributors

- 👤 [Krittanai B.]  

---

## 📃 License

This project is licensed under the MIT License.
