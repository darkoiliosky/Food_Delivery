import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "./mailer.js";
import dotenv from "dotenv";
import pkg from "pg";
const { Client } = pkg;

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
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));

// Функција за испраќање емаил при регистрација
const sendRegistrationEmail = async (userData) => {
  const mailOptions = {
    from: `"Dostava App" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "Нов корисник се регистрираше!",
    text: `Корисник со следниве податоци се регистрира:
    Име: ${userData.name} ${userData.lastname}
    Емаил: ${userData.email}
    Телефон: ${userData.phone}`,
  };

  try {
    console.log("Preparing to send email...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Route for registration
app.post("/register", async (req, res) => {
  const { name, lastname, email, phone, password } = req.body;

  console.log("Received data:", { name, lastname, email, phone, password });

  if (!name || !lastname || !email || !phone || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Inserting user into database...");
    await client.query(
      "INSERT INTO users (name, lastname, email, phone, password) VALUES ($1, $2, $3, $4, $5)",
      [name, lastname, email, phone, hashedPassword]
    );

    console.log("Calling sendRegistrationEmail...");
    await sendRegistrationEmail({ name, lastname, email, phone, password });

    res.status(201).send("User registered successfully.");
  } catch (error) {
    console.error("Error during registration process:", error);
    if (error.code === "23505") {
      return res.status(400).send("Email or phone already exists.");
    }
    res.status(500).send("Error registering user.");
  }
});

// Route for login (unchanged)
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

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    res.json({ token, message: "Login successful." });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("Error logging in user.");
  }
});
// Route to get all restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM restaurants");
    res.json(result.rows); // Испрати ги рестораните како JSON
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).send("Error fetching restaurants");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
// Middleware за проверка на токенот
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access Denied");
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

// Route за профил на корисник
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await client.query(
      "SELECT name, lastname, email, phone FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Испрати ги податоците за корисникот
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).send("Error fetching profile data.");
  }
});

// Route за добивање на мени за одреден ресторан
// Route to get menu items for a specific restaurant
// Route to get menu items for a specific restaurant
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
    ); // Логирање

    if (result.rows.length === 0) {
      return res.status(404).send("No menu items found for this restaurant.");
    }

    res.json(result.rows); // Испрати го менито како JSON
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).send("Error fetching menu items");
  }
});
