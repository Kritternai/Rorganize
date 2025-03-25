/**
 * ระบบบริหารจัดการอพาร์ทเมนท์ - Backend API
 * ประกอบด้วย API สำหรับจัดการผู้ใช้งาน, การจองห้อง, ห้องพัก, สัญญาเช่า และการแจ้งเตือน
 */

// Import dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./database");

// Initialize Express app
const app = express();
const port = 3001;
const JWT_SECRET = "your-secret-key";

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===================================================
// Configure file upload with Multer
// ===================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ===================================================
// Authentication Middleware
// ===================================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
    req.user = user;
    next();
  });
};

// =============================================
// ✅ API แก้ไขข้อมูลผู้เช่า (ต้องอยู่ก่อน /api/contracts)
// =============================================
app.put("/api/tenants/:id", authenticateToken, upload.any(), (req, res) => {
  const { id } = req.params;
  const { fullname, email, phone, emergency_contact, vehicle_info } = req.body;
 
  if (!fullname || !phone) {
    return res.status(400).json({ error: "กรุณาระบุชื่อและเบอร์โทรศัพท์ของผู้เช่า" });
  }
 
  let documentFile = null;
  if (req.files && req.files.length > 0) {
    const docField = req.files.find(f => f.fieldname === "document");
    documentFile = docField ? docField.filename : null;
  }
  if (!documentFile && req.body.existing_document) {
    documentFile = req.body.existing_document;
  }
  // const documentFile = req.file ? req.file.filename : req.body.existing_document || null;
 
  const sql = `
    UPDATE tenants 
    SET fullname = ?, email = ?, phone = ?, emergency_contact = ?, 
        document = COALESCE(?, document), vehicle_info = ?
    WHERE id = ?
  `;
 
  db.run(
    sql,
    [fullname, email || "", phone, emergency_contact || "", documentFile, vehicle_info || "", id],
    function (err) {
      if (err) {
        console.error("❌ ไม่สามารถอัปเดตผู้เช่า:", err.message);
        return res.status(500).json({ error: "❌ อัปเดตข้อมูลผู้เช่าไม่สำเร็จ" });
      }
 
      res.json({ message: "✅ อัปเดตข้อมูลผู้เช่าสำเร็จ" });
    }
  );
});
// ===================================================
// User Authentication APIs
// ===================================================

/**
 * API ลงทะเบียนผู้ใช้งานใหม่
 * POST /api/register
 * 
 * Body: { username, password, role }
 * Response: สถานะการลงทะเบียน
 */
app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, role],
    function (err) {
      if (err) return res.status(400).json({ error: "ชื่อผู้ใช้ซ้ำหรือข้อมูลผิดพลาด" });
      res.status(201).json({ message: "✅ ลงทะเบียนสำเร็จ" });
    }
  );
});

/**
 * API เข้าสู่ระบบ
 * POST /api/login
 * 
 * Body: { username, password }
 * Response: { token, user }
 */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

// ===================================================
// Room Management APIs
// ===================================================

/**
 * API ดึงข้อมูลห้องพักทั้งหมด
 * GET /api/rooms
 * 
 * Response: รายการห้องพักทั้งหมดพร้อม URL ของรูปภาพ
 */
app.get("/api/rooms", (req, res) => {
  db.all("SELECT * FROM rooms", [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });

    // แปลง cover_image และ images ให้เป็น URL เต็ม
    const formattedRooms = rows.map((room) => ({
      ...room,
      cover_image: room.cover_image ? `http://localhost:3001/uploads/${room.cover_image}` : null,
      images: room.images ? JSON.parse(room.images).map(img => `http://localhost:3001/uploads/${img}`) : [],
    }));

    res.json(formattedRooms);
  });
});

/**
 * API ดึงข้อมูลห้องพักตาม ID
 * GET /api/rooms/:id
 * 
 * Params: id - รหัสห้องพัก
 * Response: ข้อมูลห้องพักพร้อม URL ของรูปภาพ
 */
app.get("/api/rooms/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM rooms WHERE id = ?", [id], (err, room) => {
    if (err) {
      console.error("❌ ไม่สามารถดึงข้อมูลห้องได้:", err);
      return res.status(500).json({ error: "❌ ไม่สามารถดึงข้อมูลห้องได้" });
    }
    if (!room) {
      return res.status(404).json({ error: "❌ ไม่พบห้องที่ต้องการ" });
    }

    // แปลงข้อมูล JSON string เป็น object
    room.images = room.images ? JSON.parse(room.images) : [];
    room.facilities = room.facilities ? JSON.parse(room.facilities) : [];

    // สร้าง URL เต็มสำหรับรูปภาพ
    room.cover_image = room.cover_image
      ? `http://localhost:3001/uploads/${room.cover_image}`
      : null;

    room.images = room.images.map(img => `http://localhost:3001/uploads/${img}`);

    res.json(room);
  });
});

/**
 * API เพิ่มห้องพักใหม่
 * POST /api/rooms
 * 
 * Headers: Authorization (JWT)
 * Body: ข้อมูลห้องพักและรูปภาพ
 * Response: สถานะการเพิ่มห้องพัก
 */
app.post("/api/rooms", authenticateToken, upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "images", maxCount: 5 }
]), (req, res) => {
  const {
    room_number, type, floor, size, rent_price, deposit, status,
    description, water_price, electricity_price
  } = req.body;

  if (!room_number) return res.status(400).json({ error: "กรุณาระบุหมายเลขห้อง" });

  // ดึงข้อมูลรูปภาพ
  const coverImagePath = req.files["cover_image"] ? req.files["cover_image"][0].filename : null;
  const imagesPaths = req.files["images"] ? req.files["images"].map(file => file.filename) : [];

  // ดึงและจัดการ facilities
  let facilities = req.body.facilities;
  if (typeof facilities === "string") {
    try {
      facilities = JSON.parse(facilities);
    } catch (err) {
      return res.status(400).json({ error: "รูปแบบข้อมูล facilities ไม่ถูกต้อง (ควรเป็น JSON)" });
    }
  }
  if (!Array.isArray(facilities)) facilities = [];
  const facilitiesJSON = JSON.stringify(facilities);

  const sql = `
    INSERT INTO rooms (
      room_number, type, floor, size, rent_price, deposit, status,
      description, cover_image, images, water_price, electricity_price, facilities
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      room_number, type, floor, size, rent_price, deposit, status,
      description, coverImagePath, JSON.stringify(imagesPaths),
      water_price, electricity_price, facilitiesJSON
    ],
    function (err) {
      if (err) {
        console.error("❌ เพิ่มห้องพักล้มเหลว:", err.message);
        return res.status(400).json({ error: "ไม่สามารถเพิ่มห้องพักได้" });
      }

      res.status(201).json({ message: "✅ เพิ่มห้องพักสำเร็จ!", room_id: this.lastID });
    }
  );
});

/**
 * API แก้ไขข้อมูลห้องพัก
 * PUT /api/rooms/:id
 * 
 * Headers: Authorization (JWT)
 * Params: id - รหัสห้องพัก
 * Body: ข้อมูลห้องพักที่ต้องการแก้ไข
 * Response: สถานะการอัปเดตห้องพัก
 */
app.put("/api/rooms/:id", authenticateToken, upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "images", maxCount: 5 }
]), (req, res) => {
  const { id } = req.params;
  const {
    room_number, type, floor, size, rent_price, deposit, status,
    description, water_price, electricity_price
  } = req.body;

  // จัดการข้อมูล facilities
  let facilities = req.body.facilities;
  if (typeof facilities === "string") {
    try {
      facilities = JSON.parse(facilities);
    } catch (err) {
      return res.status(400).json({ error: "รูปแบบข้อมูล facilities ไม่ถูกต้อง (ควรเป็น JSON)" });
    }
  }
  if (!Array.isArray(facilities)) facilities = [];
  const facilitiesJSON = JSON.stringify(facilities);

  // จัดการรูปภาพที่อัปโหลด
  const coverImagePath = req.files["cover_image"] ? req.files["cover_image"][0].filename : null;
  const imagesPaths = req.files["images"] ? req.files["images"].map(file => file.filename) : [];

  // ดึงข้อมูลห้องเก่าจากฐานข้อมูล
  db.get("SELECT * FROM rooms WHERE id = ?", [id], (err, room) => {
    if (err || !room) {
      return res.status(404).json({ error: "ไม่พบห้องพักที่ต้องการแก้ไข" });
    }

    // ใช้ข้อมูลเดิมถ้าไม่มีการอัปโหลดใหม่
    const updatedCover = coverImagePath || room.cover_image;
    const updatedImages = imagesPaths.length > 0 ? JSON.stringify(imagesPaths) : room.images;

    const sql = `
      UPDATE rooms SET
        room_number = ?, type = ?, floor = ?, size = ?, rent_price = ?, deposit = ?, status = ?,
        description = ?, cover_image = ?, images = ?, water_price = ?, electricity_price = ?, facilities = ?
      WHERE id = ?
    `;

    db.run(sql, [
      room_number, type, floor, size, rent_price, deposit, status,
      description, updatedCover, updatedImages, water_price, electricity_price, facilitiesJSON,
      id
    ], function (err) {
      if (err) {
        console.error("❌ ไม่สามารถอัปเดตห้องพักได้:", err.message);
        return res.status(500).json({ error: "❌ ไม่สามารถอัปเดตห้องพักได้" });
      }

      res.json({ message: "✅ แก้ไขข้อมูลห้องพักสำเร็จ" });
    });
  });
});

/**
 * API ลบห้องพัก
 * DELETE /api/rooms/:id
 * 
 * Headers: Authorization (JWT)
 * Params: id - รหัสห้องพัก
 * Response: สถานะการลบห้องพัก
 */
app.delete("/api/rooms/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM rooms WHERE id = ?", [id], function (err) {
    if (err) return res.status(400).json({ error: "ไม่สามารถลบห้องพักได้" });
    res.json({ message: "✅ ลบห้องพักสำเร็จ!" });
  });
});

// ===================================================
// Booking Management APIs
// ===================================================

/**
 * API เพิ่มข้อมูลการจองห้องพัก
 * POST /api/bookings
 * 
 * Body: ข้อมูลการจอง
 * Response: สถานะการจอง
 */
app.post("/api/bookings", (req, res) => {
  console.log("📥 Booking Request Received:", req.body);
  const {
    room_id, name, phone, email,
    check_in_date, duration, special_requests
  } = req.body;

  // ตรวจสอบสถานะห้องก่อนทำการจอง
  db.get("SELECT status FROM rooms WHERE id = ?", [room_id], (err, room) => {
    if (err || !room) {
      return res.status(404).json({ error: "ไม่พบห้องพัก" });
    }

    if (room.status !== "available") {
      return res.status(400).json({ error: "ห้องนี้ไม่พร้อมให้จอง" });
    }

    // บันทึกข้อมูลการจอง
    db.run(`
      INSERT INTO bookings (room_id, name, phone, email, check_in_date, duration, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [room_id, name, phone, email, check_in_date, duration, special_requests],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "ไม่สามารถจองห้องได้" });
        }

        // อัพเดตสถานะห้อง
        db.run("UPDATE rooms SET status = 'reserved' WHERE id = ?", [room_id]);

        return res.json({ message: "จองห้องเรียบร้อย", booking_id: this.lastID });
      }
    );
  });
});

/**
 * API ดึงข้อมูลการจองทั้งหมด (สำหรับ Admin)
 * GET /api/bookings
 * 
 * Response: รายการการจองทั้งหมดพร้อมข้อมูลห้องพัก
 */
app.get("/api/bookings", (req, res) => {
  db.all(`
    SELECT 
      b.*, 
      r.room_number, r.type, r.floor, r.size, r.rent_price 
    FROM bookings b
    LEFT JOIN rooms r ON b.room_id = r.id
    ORDER BY b.created_at DESC
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการจองได้" });
    }
    res.json(rows);
  });
});

/**
 * API อัปเดตสถานะการจอง
 * PUT /api/bookings/:id/status
 * 
 * Headers: Authorization (JWT)
 * Params: id - รหัสการจอง
 * Body: { status } - สถานะใหม่
 * Response: สถานะการอัปเดต
 */
app.put("/api/bookings/:id/status", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "สถานะไม่ถูกต้อง" });
  }

  db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, id], function (err) {
    if (err) {
      console.error("❌ ไม่สามารถอัปเดตสถานะการจอง:", err.message);
      return res.status(500).json({ error: "❌ ไม่สามารถอัปเดตสถานะการจองได้" });
    }
    res.json({ message: "✅ อัปเดตสถานะการจองสำเร็จ" });
  });
});

// ===================================================
// Contract Management APIs
// ===================================================


/**
 * API สร้างสัญญาเช่าใหม่
 * POST /api/contracts
 * 
 * Headers: Authorization (JWT)
 * Body: ข้อมูลสัญญาและไฟล์สัญญา
 * Response: สถานะการสร้างสัญญา
 */
app.post("/api/contracts", authenticateToken, (req, res) => {
  const {
    tenant_id, room_id, start_date, end_date,
    rent_amount, deposit_amount, status,
    guarantor_name, contract_note
  } = req.body;

  //const contract_file = req.file ? req.file.filename : null;

  if (!tenant_id || !room_id || !start_date || !end_date || !rent_amount || !deposit_amount) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const sql = `
      INSERT INTO contracts (
        tenant_id, room_id, start_date, end_date,
        rent_amount, deposit_amount, status,
        guarantor_name, contract_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

db.run(sql, [
  tenant_id, room_id, start_date, end_date,
  rent_amount, deposit_amount, status,
  guarantor_name, contract_note
], function (err) {
    if (err) {
      console.error("❌ ไม่สามารถบันทึกสัญญา:", err.message);
      return res.status(500).json({ error: "❌ ไม่สามารถบันทึกสัญญาได้" });
    }

    res.status(201).json({ message: "✅ สร้างสัญญาเช่าสำเร็จ", contract_id: this.lastID });
  });
});
/**
 * API อัปเดตสถานะสัญญาเช่า
 * PUT /api/contracts/:id/status
 * 
 * Headers: Authorization (JWT)
 * Params: id - รหัสสัญญาเช่า
 * Body: { status } - สถานะใหม่
 * Response: สถานะการอัปเดต
 */
app.put("/api/contracts/:id/status", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = ["active", "completed", "terminated"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ error: "สถานะไม่ถูกต้อง" });
  }

  db.run("UPDATE contracts SET status = ? WHERE id = ?", [status, id], function (err) {
    if (err) {
      console.error("❌ ไม่สามารถอัปเดตสถานะสัญญา:", err.message);
      return res.status(500).json({ error: "❌ ไม่สามารถอัปเดตสถานะสัญญาได้" });
    }
    res.json({ message: "✅ อัปเดตสถานะสัญญาเช่าสำเร็จ" });
  });
});
/**
 * API ดึงข้อมูลสัญญาเช่าทั้งหมด
 * GET /api/contracts
 * 
 * Headers: Authorization (JWT)
 * Response: ข้อมูลสัญญาทั้งหมด
 */
app.get("/api/contracts", authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      c.*, 
      r.room_number, r.floor, r.size, r.rent_price,
      t.fullname AS tenant_name
    FROM contracts c
    LEFT JOIN rooms r ON c.room_id = r.id
    LEFT JOIN tenants t ON c.tenant_id = t.id
    ORDER BY c.start_date DESC
  `, [], (err, rows) => {
    if (err) {
      console.error("❌ ไม่สามารถดึงข้อมูลสัญญา:", err.message);
      return res.status(500).json({ error: "❌ ไม่สามารถดึงข้อมูลสัญญาได้" });
    }

    res.json(rows);
  });
});

/**
 * API สร้างผู้เช่าใหม่
 * POST /api/tenants
 * 
 * Headers: Authorization (JWT)
 * Body: { fullname, email, phone, emergency_contact }
 * Response: สถานะการสร้างผู้เช่า
 */
app.post("/api/tenants", authenticateToken, (req, res) => {
  const { fullname, email, phone, emergency_contact } = req.body;

  if (!fullname || !phone) {
    return res.status(400).json({ error: "กรุณาระบุชื่อและเบอร์โทรศัพท์ของผู้เช่า" });
  }

  const sql = `
    INSERT INTO tenants (fullname, email, phone, emergency_contact)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [fullname, email, phone, emergency_contact], function (err) {
    if (err) {
      console.error("❌ ไม่สามารถเพิ่มผู้เช่า:", err.message);
      return res.status(500).json({ error: "❌ ไม่สามารถเพิ่มผู้เช่าได้" });
    }

    res.status(201).json({ message: "✅ เพิ่มผู้เช่าสำเร็จ", id: this.lastID });
  });
});
/**
 * API ดึงข้อมูลผู้เช่าทั้งหมด
 * GET /api/tenants
 * 
 * Headers: Authorization (JWT)
 * Response: รายการผู้เช่าทั้งหมด
 */
app.get("/api/tenants", authenticateToken, (req, res) => {
  db.all("SELECT * FROM tenants", [], (err, rows) => {
    if (err) {
      console.error("❌ ไม่สามารถดึงข้อมูลผู้เช่า:", err.message);
      return res.status(500).json({ error: "❌ ไม่สามารถดึงข้อมูลผู้เช่าได้" });
    }

    res.json(rows);
  });
});


/**
 * API ดึงข้อมูลสัญญาเช่าทั้งหมด พร้อมข้อมูลผู้เช่า
 * GET /api/contracts
 */
app.get("/api/contracts", authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      c.*, 
      t.fullname AS tenant_name,
      t.email AS tenant_email,
      t.phone AS tenant_phone,
      t.emergency_contact AS tenant_emergency_contact
    FROM contracts c
    LEFT JOIN tenants t ON c.tenant_id = t.id
    ORDER BY c.start_date DESC
  `, [], (err, rows) => {
    if (err) {
      console.error("❌ ไม่สามารถดึงข้อมูลสัญญา:", err.message);
      return res.status(500).json({ error: "❌ ไม่สามารถดึงข้อมูลสัญญาได้" });
    }

    res.json(rows);
  });
});

// ===================================================
// Notification APIs
// ===================================================

/**
 * API ดึงข้อมูลการแจ้งเตือน
 * GET /api/notifications
 * 
 * Headers: Authorization (JWT)
 * Response: รายการการแจ้งเตือนของผู้ใช้
 */
app.get("/api/notifications", authenticateToken, (req, res) => {
  db.all("SELECT * FROM notifications WHERE user_id = ?", [req.user.id], (err, rows) => {
    if (err) return res.status(400).json({ error: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้" });
    res.json(rows);
  });
});

// ===================================================
// Admin Dashboard APIs
// ===================================================

/**
 * API แสดงข้อมูล Dashboard สำหรับ Admin
 * GET /api/admin/dashboard
 * 
 * Headers: Authorization (JWT)
 * Response: สถิติการใช้งานระบบ
 */
app.get("/api/admin/dashboard", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM users) AS user_count, 
      (SELECT COUNT(*) FROM rooms WHERE status='available') AS available_rooms, 
      (SELECT COUNT(*) FROM rooms WHERE status='occupied') AS occupied_rooms,
      (SELECT COUNT(*) FROM rooms) AS total_rooms
    `,
    [],
    (err, stats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(stats);
    }
  );
});

app.post("/api/checkout", authenticateToken, (req, res) => {
  const {
    contract_id,
    inspection_date,
    water_meter,
    electricity_meter,
    damage_note,
    outstanding_costs,
    refund_note,
    deduction,
    total_refund
  } = req.body;

  const sql = `
    INSERT INTO checkouts (
      contract_id,
      inspection_date,
      water_meter,
      electricity_meter,
      damage_note,
      outstanding_costs,
      refund_note,
      deduction,
      total_refund
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    contract_id,
    inspection_date,
    parseFloat(water_meter) || 0,
    parseFloat(electricity_meter) || 0,
    damage_note,
    parseFloat(outstanding_costs) || 0,
    refund_note,
    parseFloat(deduction) || 0,
    parseFloat(total_refund) || 0
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("❌ ไม่สามารถบันทึกข้อมูลการย้ายออก:", err.message);
      return res.status(500).json({ error: "❌ บันทึกข้อมูลไม่สำเร็จ" });
    }

    // อัปเดตสถานะห้องเป็น maintenance
    db.run(`
      UPDATE rooms 
      SET status = 'maintenance' 
      WHERE id = (SELECT room_id FROM contracts WHERE id = ?)
    `, [contract_id], function (err) {
      if (err) {
        console.error("❌ ไม่สามารถอัปเดตสถานะห้อง:", err.message);
        return res.status(500).json({ error: "❌ บันทึกการย้ายออกสำเร็จ แต่เปลี่ยนสถานะห้องไม่สำเร็จ" });
      }

      // รีเซ็ตข้อมูลที่เกี่ยวข้องกับห้องนี้ทั้งหมด ยกเว้นข้อมูลห้อง
      db.get("SELECT room_id FROM contracts WHERE id = ?", [contract_id], (err, row) => {
        if (err || !row) {
          console.error("❌ ไม่สามารถดึง room_id สำหรับรีเซ็ตข้อมูล:", err?.message);
          return res.status(500).json({ error: "❌ รีเซ็ตข้อมูลล้มเหลว" });
        }

        const roomId = row.room_id;

        // ลบข้อมูลใน contracts, payments, bookings, checkins, utility_bills
        db.serialize(() => {
          db.all("SELECT * FROM contracts WHERE room_id = ?", [roomId], (err, rows) => {
            if (!err && rows.length) {
              db.run("INSERT INTO backups (table_name, data) VALUES (?, ?)", [
                "contracts",
                JSON.stringify(rows)
              ]);
            }
          });
          db.run("DELETE FROM contracts WHERE room_id = ?", [roomId]);
          db.all("SELECT * FROM payments WHERE contract_id = ?", [contract_id], (err, rows) => {
            if (!err && rows.length) {
              db.run("INSERT INTO backups (table_name, data) VALUES (?, ?)", [
                "payments",
                JSON.stringify(rows)
              ]);
            }
          });
          db.run("DELETE FROM payments WHERE contract_id = ?", [contract_id]);
          db.all("SELECT * FROM bookings WHERE room_id = ?", [roomId], (err, rows) => {
            if (!err && rows.length) {
              db.run("INSERT INTO backups (table_name, data) VALUES (?, ?)", [
                "bookings",
                JSON.stringify(rows)
              ]);
            }
          });
          db.run("DELETE FROM bookings WHERE room_id = ?", [roomId]);
          db.all("SELECT * FROM checkins WHERE contract_id = ?", [contract_id], (err, rows) => {
            if (!err && rows.length) {
              db.run("INSERT INTO backups (table_name, data) VALUES (?, ?)", [
                "checkins",
                JSON.stringify(rows)
              ]);
            }
          });
          db.run("DELETE FROM checkins WHERE contract_id = ?", [contract_id]);
          db.all("SELECT * FROM utility_bills WHERE contract_id = ?", [contract_id], (err, rows) => {
            if (!err && rows.length) {
              db.run("INSERT INTO backups (table_name, data) VALUES (?, ?)", [
                "utility_bills",
                JSON.stringify(rows)
              ]);
            }
          });
          db.run("DELETE FROM utility_bills WHERE contract_id = ?", [contract_id], (err) => {
            if (err) {
              console.error("❌ ไม่สามารถล้างข้อมูลทั้งหมดได้:", err.message);
              return res.status(500).json({ error: "❌ ล้างข้อมูลล้มเหลว" });
            }

            res.status(201).json({ message: "📦 บันทึกการย้ายออกและล้างข้อมูลสำเร็จ", id: this.lastID });
          });
        });
      });
    });
  });
});

// ===================================================
// Check-in Management API
// ===================================================
app.post("/api/checkin", upload.array("roomPhotos"), (req, res) => {
  const {
    tenantName,
    contractId,
    waterMeter,
    electricityMeter,
    keyCardDelivered,
    assetNote,
    rulesAcknowledged,
    propertyCondition,
    handoverNote,
  } = req.body;

  const roomPhotos = req.files.map((file) => file.filename);

  const sql = `
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
  `;

  db.run(sql, [], (err) => {
    if (err) {
      console.error("❌ Error creating checkins table:", err.message);
      return res.status(500).json({ error: "Database table creation failed" });
    }

    const insertSql = `
      INSERT INTO checkins (
        tenant_name, contract_id, water_meter, electricity_meter,
        keycard_delivered, asset_note, rules_acknowledged,
        property_condition, room_photos, handover_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      tenantName,
      contractId,
      parseFloat(waterMeter) || 0,
      parseFloat(electricityMeter) || 0,
      keyCardDelivered === "true" ? 1 : 0,
      assetNote,
      rulesAcknowledged === "true" ? 1 : 0,
      propertyCondition,
      JSON.stringify(roomPhotos),
      handoverNote,
    ];

    db.run(insertSql, params, function (err) {
      if (err) {
        console.error("❌ Error inserting check-in:", err.message);
        return res.status(500).json({ error: "Insert failed" });
      }

      res.status(201).json({ message: "✅ บันทึกข้อมูลการเข้าพักสำเร็จ", id: this.lastID });
    });
  });
});
/**
 * API ดึงข้อมูลการเช็คอินทั้งหมด
 * GET /api/checkin
 */
app.get("/api/checkin", authenticateToken, (req, res) => {
  db.all("SELECT * FROM checkins ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error("❌ Error fetching check-ins:", err.message);
      return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลเช็คอินได้" });
    }

    // แปลงข้อมูลรูปภาพจาก JSON string → array
    const formatted = rows.map((row) => ({
      ...row,
      room_photos: row.room_photos ? JSON.parse(row.room_photos) : [],
    }));

    res.json(formatted);
  });
});


/**
 * API ดึงข้อมูลการย้ายออกทั้งหมด
 * GET /api/checkout
 */
app.get("/api/checkout", authenticateToken, (req, res) => {
  db.all("SELECT * FROM checkouts ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error("❌ ไม่สามารถดึงข้อมูลการย้ายออก:", err.message);
      return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการย้ายออกได้" });
    }

    res.json(rows);
  });
});

// ===================================================
// Start Server
// ===================================================
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
