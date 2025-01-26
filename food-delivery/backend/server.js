const express = require("express");
const cors = require("cors");
const { Client } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

// Middleware to parse JSON
app.use(express.json());

// CORS middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Дозволете ги двата порта
  })
);

// Route for registration
app.post("/register", async (req, res) => {
  const { name, lastname, email, phone, password } = req.body;

  console.log("Received data:", { name, lastname, email, phone, password }); // Додај лог

  if (!name || !lastname || !email || !phone || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Hashed Password:", hashedPassword); // Логирај хашираната лозинка

    await client.query(
      "INSERT INTO users (name, lastname, email, phone, password) VALUES ($1, $2, $3, $4, $5)",
      [name, lastname, email, phone, hashedPassword]
    );

    res.status(201).send("User registered successfully.");
  } catch (error) {
    console.error("Error registering user:", error);

    if (error.code === "23505") {
      return res.status(400).send("Email or phone already exists.");
    }

    res.status(500).send("Error registering user.");
  }
});

// Route for login
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

// Middleware for token verification
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

// Example protected route
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await client.query(
      "SELECT name, lastname, email, phone FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Врати ги податоците за корисникот
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching profile", error);
    res.status(500).send("Error fetching profile.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
// Route to get all restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM restaurants");

    console.log("Fetched restaurants:", result.rows); // Додај логирање за дебагирање

    res.json(result.rows); // Испрати ги резултатите како JSON
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).send("Error fetching restaurants");
  }
});

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

app.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    // Ажурирање на податоци во базата
    const result = await client.query(
      "UPDATE users SET name = $1, lastname = $2, email = $3, phone = $4 WHERE id = $5",
      [firstName, lastName, email, phone, req.user.id]
    );

    if (result.rowCount > 0) {
      res.send("Profile updated successfully.");
    } else {
      res.status(400).send("Failed to update profile.");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Error updating profile.");
  }
});
