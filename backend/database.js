const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("rorganize.db", (err) => {
  if (err) {
    console.error("❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:", err.message);
  } else {
    console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ!");
    createTables();
  }
});

// ✅ ฟังก์ชันสร้างตารางทั้งหมด
const createTables = () => {
  console.log("🔧 กำลังสร้างตาราง...");

// 🔹 ตารางผู้ใช้ (admin, user)
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password TEXT NOT NULL,
    role TEXT NOT NULL COLLATE NOCASE CHECK(role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error("❌ สร้างตาราง users ไม่สำเร็จ:", err.message);
  } else {
    console.log("✅ users table ready");
    initializeAdmin(); // ✅ ย้ายมาเรียกที่นี่
  }
});


  // 🔹 ตารางห้องพัก
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_number TEXT UNIQUE NOT NULL COLLATE NOCASE,
      type TEXT NOT NULL COLLATE NOCASE,
      floor INTEGER NOT NULL,
      size INTEGER NOT NULL,
      rent_price REAL NOT NULL,
      deposit REAL NOT NULL,
      water_price REAL NOT NULL,
      electricity_price REAL NOT NULL,
      status TEXT DEFAULT 'available' COLLATE NOCASE CHECK(status IN ('available', 'occupied', 'reserved', 'maintenance')),
      facilities TEXT, -- JSON เก็บข้อมูลสิ่งอำนวยความสะดวก
      description TEXT COLLATE NOCASE,
      cover_image TEXT,
      images TEXT, -- JSON เก็บรูปภาพห้อง
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 🔹 ตารางผู้เช่า
  db.run(`
    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT NOT NULL COLLATE NOCASE,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      phone TEXT NOT NULL,
      emergency_contact TEXT COLLATE NOCASE,
      document TEXT, -- เอกสารประจำตัว เช่น ไฟล์รูปหรือ PDF
      vehicle_info TEXT, -- JSON ข้อมูลยานพาหนะ เช่น {"plate": "1กข1234", "type": "รถยนต์", "color": "ดำ"}
      user_id INTEGER, -- เชื่อมโยงกับ users.id
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 🔹 ตารางสัญญาเช่า
  db.run(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      rent_amount REAL NOT NULL,
      deposit_amount REAL NOT NULL,
      status TEXT DEFAULT 'active' COLLATE NOCASE CHECK(status IN ('active', 'completed', 'terminated')),
      guarantor_name TEXT COLLATE NOCASE,
      contract_note TEXT COLLATE NOCASE,
      document TEXT,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `);

  // 🔹 ตารางค่าน้ำ-ค่าไฟ
  db.run(`
    CREATE TABLE IF NOT EXISTS utility_bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      water_usage REAL NOT NULL,
      electricity_usage REAL NOT NULL,
      water_price REAL NOT NULL,
      electricity_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      billing_date DATE NOT NULL,
      status TEXT DEFAULT 'pending' COLLATE NOCASE CHECK(status IN ('pending', 'paid', 'failed', 'unpaid')),
      FOREIGN KEY (contract_id) REFERENCES contracts(id)
    )
  `);
  
  // 🔹 ตารางการจองห้องพัก
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      name TEXT NOT NULL COLLATE NOCASE,
      phone TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE,
      check_in_date DATE NOT NULL,
      duration INTEGER NOT NULL,
      special_requests TEXT COLLATE NOCASE,
      status TEXT DEFAULT 'pending' COLLATE NOCASE CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `);
  
  // 🔹 ตารางการชำระเงิน
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      slipImage TEXT,
      payment_date DATE NOT NULL,
      method TEXT NOT NULL COLLATE NOCASE CHECK(method IN ('cash', 'bank_transfer', 'credit_card')),
      status TEXT DEFAULT 'pending' COLLATE NOCASE CHECK(status IN ('completed', 'pending', 'failed')),
      FOREIGN KEY (contract_id) REFERENCES contracts(id)
    )
  `);

  // 🔹 ตารางแจ้งซ่อม
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      description TEXT NOT NULL COLLATE NOCASE,
      status TEXT DEFAULT 'pending' COLLATE NOCASE CHECK(status IN ('pending', 'in_progress', 'completed')),
      reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved_date TIMESTAMP,
      technician TEXT COLLATE NOCASE,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `);

  // 🔹 ตารางรายงาน
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL COLLATE NOCASE,
      description TEXT NOT NULL COLLATE NOCASE,
      category TEXT NOT NULL COLLATE NOCASE CHECK(category IN ('financial', 'room', 'maintenance')),
      resolved_status TEXT DEFAULT 'pending' COLLATE NOCASE CHECK(resolved_status IN ('pending', 'resolved')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 🔹 ตารางการแจ้งเตือน
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL COLLATE NOCASE CHECK(type IN ('payment_due', 'contract_expiry', 'maintenance_update')),
      message TEXT NOT NULL COLLATE NOCASE,
      status TEXT DEFAULT 'unread' COLLATE NOCASE CHECK(status IN ('unread', 'read')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
 
  // 🔹 ตารางการเข้าพัก (Check-in)
  db.run(`
    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_name TEXT NOT NULL,
      contract_id TEXT NOT NULL,
      water_meter REAL NOT NULL,
      electricity_meter REAL NOT NULL,
      keycard_delivered INTEGER DEFAULT 0,
      asset_note TEXT,
      rules_acknowledged INTEGER DEFAULT 0,
      property_condition TEXT,
      room_photos TEXT,
      handover_note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 🔹 ตารางการย้ายออก (Checkout)
  db.run(`
    CREATE TABLE IF NOT EXISTS checkouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      inspection_date DATE NOT NULL,
      water_meter REAL,
      electricity_meter REAL,
      damage_note TEXT,
      outstanding_costs REAL,
      refund_note TEXT,
      deduction REAL,
      total_refund REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contract_id) REFERENCES contracts(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS backups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      data TEXT NOT NULL,
      deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log("✅ ตารางทั้งหมดถูกสร้างเรียบร้อย!");
  initializeAdmin();
};

// ✅ ฟังก์ชันเพิ่มบัญชีผู้ดูแลระบบ (admin) เริ่มต้น
const initializeAdmin = () => {
  const adminUsername = "1";
  const adminPassword = "1";
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  db.get("SELECT * FROM users WHERE username = ?", [adminUsername], (err, row) => {
    if (!row) {
      db.run(
        `INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')`,
        [adminUsername, hashedPassword],
        (err) => {
          if (err) {
            console.error("❌ ไม่สามารถเพิ่ม Admin ได้:", err.message);
          } else {
            console.log("✅ Admin ถูกสร้างเรียบร้อย! (username: admin, password: rorganize)");
          }
        }
      );
    } else {
      console.log("⚠️ Admin มีอยู่แล้ว ไม่ต้องสร้างใหม่");
    }
  });
};
 
module.exports = db;