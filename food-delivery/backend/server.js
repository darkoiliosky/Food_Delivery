// server.js
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
import { sendResetPasswordEmail } from "./mailer.js";
import { sendVerificationEmail } from "./mailer.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 5000;

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
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Додава timestamp
  },
});

const upload = multer({ storage });

// -----------------------------------------------------------------------------
// Route: registerexpr
// -----------------------------------------------------------------------------
app.post("/register", async (req, res) => {
  const { name, lastname, email, phone, password, adminCode } = req.body;

  try {
    if (!name || !lastname || !email || !phone || !password) {
      return res.status(400).send("All fields are required.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Проверка дали внесениот код е точен
    const isAdmin = adminCode === process.env.ADMIN_CODE; // Чита од .env

    // Генерираме верификациски токен
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Снимаме корисник со is_verified = false + дали е админ
    const insertQuery = `
      INSERT INTO users
        (name, lastname, email, phone, password, is_verified, verification_token, token_expires, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      isAdmin, // Додава администраторски статус
    ]);

    // 1) Верификациски имејл за корисникот
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

  if (!emailOrPhone || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $1",
      [emailOrPhone]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("User not found.");
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password.");
    }

    if (!user.is_verified) {
      return res.status(403).send("Please verify your email first.");
    }

    // Генерирање на токен
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    // Испрати го токенот како cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 час
      sameSite: "None",
      secure: true, // Ова мора да биде `true` ако користиш HTTPS
    });

    // Врати ги податоците и токенот
    return res.json({
      message: "Login successful.",
      token, // Додај токен во JSON одговорот
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        is_admin: user.is_admin, // ✅ Осигурај се дека се враќа
      },
    });
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
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "default_secret_key",
    (err, user) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(403).json({ message: "Invalid Token" });
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
app.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Missing token.");
  }

  try {
    const result = await client.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("Invalid or expired token!");
    }

    const user = result.rows[0];
    if (user.token_expires && user.token_expires < new Date()) {
      return res.status(400).send("Token is expired!");
    }

    // Ажурирајте го корисникот како верификуван
    await client.query(
      `UPDATE users
       SET is_verified = $1,
           verification_token = NULL,
           token_expires = NULL
       WHERE id = $2`,
      [true, user.id]
    );

    // 2) Известување до админот дека корисникот потврдил е-пошта
    await sendAdminNotification({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
    });

    res.send("Вашата е-пошта е успешно потврдена! Сега можете да се најавите.");
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/forgot-password", async (req, res) => {
  const { emailOrPhone } = req.body;

  if (!emailOrPhone) {
    return res.status(400).send("Email or phone is required.");
  }

  try {
    // Проверка дали корисникот постои
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $1",
      [emailOrPhone]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found.");
    }

    const user = result.rows[0];

    // Генерирај токен за ресетирање на лозинка
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // Валидност: 1 час

    await client.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3",
      [resetToken, resetExpires, user.id]
    );

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Испраќање на емаил со ресет линкот
    await sendResetPasswordEmail(user.email, resetLink);

    res.send("Reset link sent to your email.");
  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).send("Token and new password are required.");
  }

  try {
    // Проверка дали токенот постои и не е истечен
    const result = await client.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("Invalid or expired token.");
    }

    const user = result.rows[0];

    // Хаширај ја новата лозинка
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ажурирај ја лозинката во базата и избриши го токенот
    await client.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.send("Password reset successful.");
  } catch (error) {
    console.error("🔥 Error resetting password:", error);
    res.status(500).send("Internal server error.");
  }
});
// profile/update-request
app.post("/profile/update-request", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, phone } = req.body;

  try {
    const confirmToken = crypto.randomBytes(32).toString("hex");

    await client.query(
      "UPDATE users SET pending_changes = $1, confirm_token = $2 WHERE id = $3",
      [
        JSON.stringify({ firstName, lastName, email, phone }),
        confirmToken,
        userId,
      ]
    );

    const confirmURL = `http://localhost:5173/confirm-changes?token=${confirmToken}`;

    await sendVerificationEmail(email, confirmURL);

    res.send("Пратена е потврда на вашиот емаил.");
  } catch (error) {
    console.error("Error processing update request:", error);
    res.status(500).send("Internal server error.");
  }
});

// profile/confirm-changes
app.get("/profile/confirm-changes", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    console.error("Missing token in request.");
    return res.status(400).send("Недостасува токен.");
  }

  try {
    // Проверуваме дали токенот постои во базата
    const result = await client.query(
      "SELECT * FROM users WHERE confirm_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      console.error("Invalid or expired token.");
      return res.status(400).send("Невалиден или истечен токен!");
    }

    const user = result.rows[0];

    // Проверка дали pending_changes е веќе JSON објект
    const pendingChanges =
      typeof user.pending_changes === "string"
        ? JSON.parse(user.pending_changes)
        : user.pending_changes;

    // Ажурирање на корисничките податоци
    await client.query(
      "UPDATE users SET name = $1, lastname = $2, email = $3, phone = $4, pending_changes = NULL, confirm_token = NULL WHERE id = $5",
      [
        pendingChanges.firstName,
        pendingChanges.lastName,
        pendingChanges.email,
        pendingChanges.phone,
        user.id,
      ]
    );

    res.send("Вашите податоци се успешно ажурирани!");
  } catch (error) {
    console.error("Error confirming changes:", error);
    res.status(500).send("Internal server error.");
  }
});
const authenticateAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

app.delete(
  "/restaurants/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      // Прво, земи го image_url за ресторанот што се брише
      const result = await client.query(
        "SELECT image_url FROM restaurants WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Restaurant not found." });
      }

      const imageUrl = result.rows[0].image_url;

      // Избриши го ресторанот од базата
      await client.query("DELETE FROM restaurants WHERE id = $1", [id]);

      // Ако постои слика, избриши ја од серверот
      if (imageUrl) {
        const imagePath = path.join(__dirname, "public", imageUrl);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          }
        });
      }

      res.json({ message: "Restaurant deleted successfully." });
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      res.status(500).json({ message: "Error deleting restaurant." });
    }
  }
);

app.post(
  "/restaurants",
  authenticateToken,
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    const { name, cuisine, working_hours } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null; // ✅ Чува патека до сликата

    if (!name || !cuisine || !image_url || !working_hours) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      const query = `
      INSERT INTO restaurants (name, cuisine, image_url, working_hours)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
      const result = await client.query(query, [
        name,
        cuisine,
        image_url,
        working_hours,
      ]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error adding restaurant:", error);
      res.status(500).json({ message: "Error adding restaurant." });
    }
  }
);

app.post(
  "/restaurants",
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, cuisine, working_hours } = req.body;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Проверка дали има слика

      if (!name || !cuisine || !working_hours) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newRestaurant = await pool.query(
        "INSERT INTO restaurants (name, cuisine, image_url, working_hours) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, cuisine, image_url, working_hours]
      );

      res.json(newRestaurant.rows[0]);
    } catch (err) {
      console.error("Error adding restaurant:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// -----------------------------------------------------------------------------
// Start the server
// -----------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
