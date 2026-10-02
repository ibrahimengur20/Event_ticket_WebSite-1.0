import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/authMiddleware.js";
import { db } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "EventHub API çalışıyor" });
});

app.get("/api/events", async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT
        events.id,
        events.name,
        events.description,
        events.location,
        events.event_date AS eventDate,
        events.price,
        events.image_url AS imageUrl,
        events.available_tickets AS availableTickets,
        categories.name AS categoryName
      FROM events
      JOIN categories ON events.category_id = categories.id
    `);

    res.json(events);
  } catch (error) {
    console.error("Etkinlikler alınamadı:", error);
    res.status(500).json({ message: "Etkinlikler alınırken hata oluştu." });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const [events] = await db.query(
      `
        SELECT
          events.id,
          events.name,
          events.description,
          events.location,
          events.event_date AS eventDate,
          events.price,
          events.image_url AS imageUrl,
          events.available_tickets AS availableTickets,
          categories.name AS categoryName
        FROM events
        JOIN categories ON events.category_id = categories.id
        WHERE events.id = ?
      `,
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: "Etkinlik bulunamadı." });
    }

    res.json(events[0]);
  } catch (error) {
    console.error("Etkinlik detayı alınamadı:", error);
    res.status(500).json({ message: "Etkinlik detayı alınırken hata oluştu." });
  }
});

app.post("/api/orders", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  const eventId = Number(req.body.eventId);
  const quantity = Number(req.body.quantity);

  if (!Number.isSafeInteger(eventId) || eventId < 1 ||
      !Number.isSafeInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Geçerli etkinlik ve bilet adedi gerekli." });
  }

  let connection;
  let transactionStarted = false;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [events] = await connection.query(
      `SELECT id, name, price, available_tickets AS availableTickets
       FROM events
       WHERE id = ?
       FOR UPDATE`,
      [eventId]
    );

    if (events.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(404).json({ message: "Etkinlik bulunamadı." });
    }

    const event = events[0];
    const ticketsLeft = Number(event.availableTickets);

    if (quantity > ticketsLeft) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(409).json({
        message: `Yeterli bilet yok. Kalan bilet: ${ticketsLeft}.`,
      });
    }

    const unitPrice = Number(event.price);
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    const [order] = await connection.query(
  `INSERT INTO orders
   (user_id, event_id, quantity, unit_price, total_price, status)
   VALUES (?, ?, ?, ?, ?, 'pending_payment')`,
  [userId, eventId, quantity, unitPrice, totalPrice]
);

    await connection.query(
      `UPDATE events
       SET available_tickets = available_tickets - ?
       WHERE id = ?`,
      [quantity, eventId]
    );

    await connection.commit();
    transactionStarted = false;

    res.status(201).json({
      orderId: order.insertId,
      eventName: event.name,
      quantity,
      totalPrice: totalPrice.toFixed(2),
      status: "pending_payment",
      availableTickets: ticketsLeft - quantity,
      message: "Sipariş kaydı oluşturuldu. Bu aşamada gerçek ödeme alınmıyor.",
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback().catch(() => {});
    }
    console.error("Sipariş oluşturulamadı:", error);
    res.status(500).json({ message: "Sipariş oluşturulurken hata oluştu." });
  } finally {
    connection?.release();
  }
});

/** Kullanıcı Kayıt */

app.post("/api/users/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tüm alanlar zorunludur." });
  }

  try {
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ message: "Kullanıcı adı veya e-posta zaten kullanılıyor." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, passwordHash]
    );

    return res.status(201).json({ message: "Kayıt başarılı." });
  } catch (error) {
    console.error("Kayıt sırasında hata oluştu:", error);
    return res
      .status(500)
      .json({ message: "Kayıt sırasında hata oluştu." });
  }
});

/** Kullanıcı Girişi */

app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Kullanıcı adı ve şifre zorunludur.",
    });
  }

  try {
    const [users] = await db.query(
      "SELECT id, username, email, password_hash FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Kullanıcı adı veya şifre hatalı.",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Kullanıcı adı veya şifre hatalı.",
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Giriş başarılı.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Giriş sırasında hata oluştu:", error);

    return res.status(500).json({
      message: "Giriş sırasında hata oluştu.",
    });
  }
});

app.post("/api/orders/my-orders", authenticateToken, (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Token gerekli." });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ message: "Geçersiz token." });
  }
});

/** Siparişleri Getir **/
app.get("/api/orders/my-orders", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [orders] = await db.query(
      `SELECT o.id AS orderId, o.event_id AS eventId, o.quantity, o.unit_price AS unitPrice, o.total_price AS totalPrice, o.status, e.name AS eventName, e.event_date AS eventDate
       FROM orders o
       JOIN events e ON o.event_id = e.id
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [userId]
    );

    res.json(orders);
  } catch (error) {
    console.error("Siparişler alınamadı:", error);
    res.status(500).json({ message: "Siparişler alınırken hata oluştu." });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
