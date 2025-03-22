const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./database");

const app = express();
const port = 3001;
const JWT_SECRET = "your-secret-key";

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ ตั้งค่าการอัปโหลดไฟล์ (Multer)
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

app.use("/uploads", express.static("uploads"));

const upload = multer({ storage });

// ✅ Middleware ตรวจสอบ JWT Token
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

// ✅ API ลงทะเบียนผู้ใช้
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

// ✅ API ล็อกอิน
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

// ✅ API ดึงข้อมูลห้องพักทั้งหมด
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
// ✅ API เพิ่มห้องพัก (รองรับอัปโหลดรูปภาพ)
app.post("/api/rooms", authenticateToken, upload.fields([
    { name: "cover_image", maxCount: 1 },
    { name: "images", maxCount: 5 }
]), (req, res) => {
    const {
        room_number, type, floor, size, rent_price, deposit, status,
        description, water_price, electricity_price
    } = req.body;

    if (!room_number) return res.status(400).json({ error: "กรุณาระบุหมายเลขห้อง" });

    const coverImagePath = req.files["cover_image"] ? req.files["cover_image"][0].filename : null;
    const imagesPaths = req.files["images"] ? req.files["images"].map(file => file.filename) : [];

    const sql = `
        INSERT INTO rooms (
            room_number, type, floor, size, rent_price, deposit, status, 
            description, cover_image, images, water_price, electricity_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            room_number, type, floor, size, rent_price, deposit, status,
            description, coverImagePath, JSON.stringify(imagesPaths), water_price, electricity_price
        ],
        function (err) {
            if (err) return res.status(400).json({ error: "ไม่สามารถเพิ่มห้องพักได้" });
            res.status(201).json({ message: "✅ เพิ่มห้องพักสำเร็จ!", room_id: this.lastID });
        }
    );
});

// ✅ API ลบห้องพัก
app.delete("/api/rooms/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM rooms WHERE id = ?", [id], function (err) {
        if (err) return res.status(400).json({ error: "ไม่สามารถลบห้องพักได้" });
        res.json({ message: "✅ ลบห้องพักสำเร็จ!" });
    });
});

// ✅ API แสดงข้อมูล Dashboard สำหรับ Admin
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

// ✅ API ดึงข้อมูลการแจ้งเตือน
app.get("/api/notifications", authenticateToken, (req, res) => {
    db.all("SELECT * FROM notifications WHERE user_id = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้" });
        res.json(rows);
    });
});

app.post("/api/bookings", (req, res) => {
    console.log("📥 Booking Request Received:", req.body);
    const {
      room_id, name, phone, email,
      check_in_date, duration, special_requests
    } = req.body;
  
    db.get("SELECT status FROM rooms WHERE id = ?", [room_id], (err, room) => {
      if (err || !room) {
        return res.status(404).json({ error: "ไม่พบห้องพัก" });
      }
  
      if (room.status !== "available") {
        return res.status(400).json({ error: "ห้องนี้ไม่พร้อมให้จอง" });
      }
  
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

app.get("/api/admin/dashboard", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    db.get(
        `SELECT 
            (SELECT COUNT(*) FROM rooms) AS total_rooms, 
            (SELECT COUNT(*) FROM rooms WHERE status='occupied') AS occupied_rooms, 
            (SELECT COUNT(*) FROM rooms WHERE status='available') AS available_rooms
        `, 
        [], 
        (err, stats) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(stats);
        }
    );
});

// ✅ API ดึงข้อมูลห้องพักตาม id (อัปเดตล่าสุดและถูกต้องที่สุด)
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

        room.images = room.images ? JSON.parse(room.images) : [];
        room.facilities = room.facilities ? JSON.parse(room.facilities) : [];

        room.cover_image = room.cover_image
            ? `http://localhost:999/uploads/${room.cover_image}`
            : null;

        room.images = room.images.map(img => `http://localhost:3001/uploads/${img}`);

        res.json(room);
    });
});

// ✅ API: ดึงข้อมูลห้องพักตาม ID
app.get("/api/rooms/:id", (req, res) => {
    const roomId = req.params.id;

    db.get("SELECT * FROM rooms WHERE id = ?", [roomId], (err, room) => {
        if (err) {
            console.error("❌ ไม่สามารถดึงข้อมูลห้องได้:", err);
            return res.status(500).json({ error: "❌ ไม่สามารถดึงข้อมูลห้องได้" });
        }
        if (!room) {
            return res.status(404).json({ error: "❌ ไม่พบห้องที่ต้องการ" });
        }
        res.json(room);
    });
});

// ✅ API ดึงข้อมูลห้องพักจาก ID
app.get("/api/rooms/:id", (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM rooms WHERE id = ?", [id], (err, room) => {
        if (err) return res.status(500).json({ error: "❌ เกิดข้อผิดพลาดในการโหลดข้อมูลห้องพัก" });
        if (!room) return res.status(404).json({ error: "⚠️ ไม่พบข้อมูลห้องพัก" });
        res.json(room);
    });
});

// ✅ ดึงข้อมูลการจอง(Admin)
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

// ✅ Start Server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});