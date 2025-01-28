import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendAdminNotification, sendUserVerificationEmail } from "./mailer.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import pkg from "pg";
const { Client } = pkg;
import crypto from "crypto"; // или import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = 5000;

// ----------------- Ако не користите MongoDB, го отстрануваме  -----------------
// import mongoose from "mongoose";
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("DB connection error:", err));

// -----------------------------------------------------------------------------
// PostgreSQL client configuration
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));

// -----------------------------------------------------------------------------
// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true, // Дозволи cross-site cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// -----------------------------------------------------------------------------
// Route: register
// -----------------------------------------------------------------------------
app.post("/register", async (req, res) => {
  const { name, lastname, email, phone, password } = req.body;

  try {
    if (!name || !lastname || !email || !phone || !password) {
      return res.status(400).send("All fields are required.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Генерираме верификациски токен
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Снимаме корисник со is_verified = false
    const insertQuery = `
      INSERT INTO users
        (name, lastname, email, phone, password, is_verified, verification_token, token_expires)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await client.query(insertQuery, [
      name,
      lastname,
      email,
      phone,
      hashedPassword,
      false,
      verificationToken,
      tokenExpires,
    ]);

    // 1) Известување до админот
    await sendAdminNotification({
      name,
      lastname,
      email,
      phone,
    });

    // 2) Верификациски имејл за корисникот
    const verifyURL = `http://localhost:5000/verify?token=${verificationToken}`;
    await sendUserVerificationEmail({
      name,
      email,
      verifyURL,
    });

    res.status(201).send("User registered. Check your email to verify.");
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === "23505") {
      return res.status(400).send("Email or phone already exists.");
    }
    res.status(500).send("Error registering user.");
  }
});

// -----------------------------------------------------------------------------
// Route: login
// -----------------------------------------------------------------------------
app.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;

  // 1) Валидација на полињата
  if (!emailOrPhone || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    // 2) Бараме корисник според емаил или телефон
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $1",
      [emailOrPhone]
    );
    if (result.rows.length === 0) {
      // Корисник не е најден (status 404)
      return res.status(404).send("User not found.");
    }

    const user = result.rows[0];

    // 3) Проверка на лозинка
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Лозинка не е точна (status 401)
      return res.status(401).send("Invalid password.");
    }

    // 4) Проверка дали корисникот е верификуван
    if (!user.is_verified) {
      // Корисникот не ја потврдил е-поштата (status 403)
      return res.status(403).send("Please verify your email first.");
    }

    // 5) Генерирај JWT (важи 1 час)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    // 6) Запишете го токенот во HTTPOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 час
      sameSite: "none", // важно за cross-site (React localhost:5173 → Node localhost:5000)
      secure: false, // за http://localhost (true ако е https)
    });

    // 7) Испратете успешен одговор
    return res.json({ message: "Login successful. Cookie is set." });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).send("Error logging in user.");
  }
});

// -----------------------------------------------------------------------------
// Route: get all restaurants (пример)
// -----------------------------------------------------------------------------
app.get("/restaurants", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM restaurants");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).send("Error fetching restaurants");
  }
});

// -----------------------------------------------------------------------------
// Middleware за проверка на токен (JWT)
// -----------------------------------------------------------------------------
const authenticateToken = (req, res, next) => {
  // 1) Прочитај токен од cookies
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send("Access Denied. No token provided.");
  }

  // 2) Валидација на JWT
  jwt.verify(
    token,
    process.env.JWT_SECRET || "default_secret_key",
    (err, user) => {
      if (err) {
        return res.status(403).send("Invalid Token");
      }
      req.user = user;
      next();
    }
  );
};

// -----------------------------------------------------------------------------
// Route: profile (пример) - потребен е JWT
// -----------------------------------------------------------------------------
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await client.query(
      "SELECT name, lastname, email, phone FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).send("Error fetching profile data.");
  }
});

// -----------------------------------------------------------------------------
// Route: restaurants/:id/menu (пример)
// -----------------------------------------------------------------------------
app.get("/restaurants/:id/menu", async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const result = await client.query(
      "SELECT * FROM menu_items WHERE restaurant_id = $1",
      [restaurantId]
    );

    console.log(
      `Fetched menu items for restaurant ID: ${restaurantId}`,
      result.rows
    );

    if (result.rows.length === 0) {
      return res.status(404).send("No menu items found for this restaurant.");
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).send("Error fetching menu items");
  }
});

// -----------------------------------------------------------------------------
// Route: verify email (GET /verify?token=...)
// -----------------------------------------------------------------------------
// Route: verify email
app.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Missing token.");
  }

  try {
    // Проверете дали постои корисник со овој токен во привременото складиште
    const pendingUser = pendingUsers.get(token);

    if (!pendingUser) {
      return res.status(400).send("Invalid or expired token!");
    }

    // Вметнете го корисникот во базата
    const insertQuery = `
      INSERT INTO users
        (name, lastname, email, phone, password, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await client.query(insertQuery, [
      pendingUser.name,
      pendingUser.lastname,
      pendingUser.email,
      pendingUser.phone,
      pendingUser.password,
      true, // is_verified = true
    ]);

    // Отстранете го корисникот од привременото складиште
    pendingUsers.delete(token);

    res.send("Вашата е-пошта е успешно потврдена! Сега можете да се најавите.");
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send("Internal server error.");
  }
});

// -----------------------------------------------------------------------------
// Start the server
// -----------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
