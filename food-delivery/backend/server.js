import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendAdminNotification, sendUserVerificationEmail } from "./mailer.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import pkg from "pg";
const { Client } = pkg;
import crypto from "crypto";

dotenv.config();

const app = express();
const port = 5000;

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

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Temporary storage for unverified users
const pendingUsers = new Map();

// Route: register
app.post("/register", async (req, res) => {
  const { name, lastname, email, phone, password } = req.body;

  try {
    if (!name || !lastname || !email || !phone || !password) {
      return res.status(400).send("All fields are required.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Temporarily store the user in the Map
    pendingUsers.set(verificationToken, {
      name,
      lastname,
      email,
      phone,
      password: hashedPassword,
    });

    // Send verification email
    const verifyURL = `http://localhost:5000/verify?token=${verificationToken}`;
    await sendUserVerificationEmail({
      name,
      email,
      verifyURL,
    });

    res
      .status(201)
      .send("Registration successful. Check your email to verify.");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user.");
  }
});

// Route: verify email
app.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Missing token.");
  }

  try {
    const pendingUser = pendingUsers.get(token);

    if (!pendingUser) {
      return res.status(400).send("Invalid or expired token!");
    }

    // Insert user into the database
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
      true,
    ]);

    // Remove user from the Map
    pendingUsers.delete(token);

    res.send("Email verified successfully. You can now log in.");
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send("Internal server error.");
  }
});

// Route: login
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

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: "none",
      secure: false,
    });

    res.json({ message: "Login successful. Cookie is set." });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("Error logging in user.");
  }
});

// Middleware: authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send("Access Denied. No token provided.");
  }

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
app.get("/restaurants", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM restaurants");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).send("Error fetching restaurants");
  }
});
// Route: Fetch menu for a specific restaurant
app.get("/restaurants/:id/menu", async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const result = await client.query(
      "SELECT * FROM menu_items WHERE restaurant_id = $1",
      [restaurantId]
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

// Route: profile
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await client.query(
      "SELECT name, lastname, email, phone FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).send("Error fetching profile data.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
