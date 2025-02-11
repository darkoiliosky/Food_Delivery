// server.js
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendAdminNotification, sendUserVerificationEmail } from "./mailer.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import pkg from "pg"; // PostgreSQL модул
const { Pool } = pkg;
import crypto from "crypto";
import { sendResetPasswordEmail, sendVerificationEmail } from "./mailer.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

// ===================== PG Pool =====================
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Едноставна проверка:
pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Connection error", err.stack));

// ===================== Middleware =====================
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// ===================== Multer =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ===================== JWT Middleware =====================
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

const authenticateAdmin = (req, res, next) => {
  console.log("🔍 Проверка на корисник:", req.user);

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ===================== Routes =====================

// -------- Register --------
app.post("/register", async (req, res) => {
  const {
    name,
    lastname,
    email,
    phone,
    password,
    role,
    adminCode,
    deliveryCode,
  } = req.body;

  try {
    if (!name || !lastname || !email || !phone || !password) {
      return res.status(400).send("Сите полиња се задолжителни.");
    }
    if (!["customer", "admin", "delivery"].includes(role)) {
      return res.status(400).send("Невалидна улога.");
    }
    if (role === "admin" && adminCode !== process.env.ADMIN_CODE) {
      return res
        .status(403)
        .send("Невалиден админ код! Корисникот НЕ Е регистриран.");
    }
    if (role === "delivery" && deliveryCode !== process.env.DELIVERY_CODE) {
      return res
        .status(403)
        .send("Невалиден код за доставувач! Корисникот НЕ Е регистриран.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const insertQuery = `
      INSERT INTO users
        (name, lastname, email, phone, password, is_verified, verification_token, token_expires, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    await pool.query(insertQuery, [
      name,
      lastname,
      email,
      phone,
      hashedPassword,
      false,
      verificationToken,
      tokenExpires,
      role,
    ]);

    // Испраќање верификациски email
    const verifyURL = `http://localhost:5000/verify?token=${verificationToken}`;
    await sendUserVerificationEmail({ name, email, verifyURL });

    res
      .status(201)
      .send("Корисникот е регистриран. Проверете го емаилот за верификација.");
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === "23505") {
      return res.status(400).send("Email или телефон веќе постои.");
    }
    res.status(500).send("Грешка при регистрација.");
  }
});

// -------- Login --------
app.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const result = await pool.query(
      "SELECT id, name, lastname, email, phone, password, role, is_admin, is_verified FROM users WHERE email = $1 OR phone = $1",
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
      {
        id: user.id,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin, // ✅ Осигурај се дека ова е тука
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Испрати го токенот како cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_admin: user.is_admin,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).send("Error logging in user.");
  }
});

// -------- GET /restaurants --------
app.get("/restaurants", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM restaurants");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).send("Error fetching restaurants");
  }
});

// -------- Profile --------
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
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

// -------- GET /restaurants/:id/menu --------
app.get("/restaurants/:id/menu", async (req, res) => {
  const restaurantId = req.params.id;
  try {
    const restaurantExists = await pool.query(
      "SELECT id FROM restaurants WHERE id = $1",
      [restaurantId]
    );
    if (restaurantExists.rows.length === 0) {
      return res.status(404).send("Restaurant not found.");
    }
    const menuResult = await pool.query(
      "SELECT * FROM menu_items WHERE restaurant_id = $1",
      [restaurantId]
    );
    return res.json(menuResult.rows);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).send("Error fetching menu items");
  }
});

// -------- GET /verify?token=... --------
app.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send("Missing token.");
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).send("Invalid or expired token!");
    }
    const user = result.rows[0];
    if (user.token_expires && new Date(user.token_expires) < new Date()) {
      return res.status(400).send("Token is expired!");
    }
    if (!user.role) {
      await pool.query("UPDATE users SET role = 'customer' WHERE id = $1", [
        user.id,
      ]);
    }

    await pool.query(
      `UPDATE users
       SET is_verified = $1,
           verification_token = NULL,
           token_expires = NULL
       WHERE id = $2`,
      [true, user.id]
    );

    if (typeof sendAdminNotification === "function") {
      await sendAdminNotification({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
      });
    }

    res.send("Вашата е-пошта е успешно потврдена! Сега можете да се најавите.");
  } catch (error) {
    console.error("❌ Error verifying email:", error);
    res.status(500).send("Internal server error.");
  }
});

// -------- POST /forgot-password --------
app.post("/forgot-password", async (req, res) => {
  const { emailOrPhone } = req.body;
  if (!emailOrPhone) {
    return res.status(400).send("Email or phone is required.");
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $1",
      [emailOrPhone]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("User not found.");
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3",
      [resetToken, resetExpires, user.id]
    );

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(user.email, resetLink);

    res.send("Reset link sent to your email.");
  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).send("Internal server error.");
  }
});

// -------- POST /reset-password --------
app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).send("Token and new password are required.");
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).send("Invalid or expired token.");
    }
    const user = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );
    res.send("Password reset successful.");
  } catch (error) {
    console.error("🔥 Error resetting password:", error);
    res.status(500).send("Internal server error.");
  }
});

// -------- POST /profile/update-request --------
app.post("/profile/update-request", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, phone } = req.body;

  try {
    const confirmToken = crypto.randomBytes(32).toString("hex");
    await pool.query(
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

// -------- GET /profile/confirm-changes --------
app.get("/profile/confirm-changes", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    console.error("Missing token in request.");
    return res.status(400).send("Недостасува токен.");
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE confirm_token = $1",
      [token]
    );
    if (result.rows.length === 0) {
      console.error("Invalid or expired token.");
      return res.status(400).send("Невалиден или истечен токен!");
    }

    const user = result.rows[0];
    const pendingChanges =
      typeof user.pending_changes === "string"
        ? JSON.parse(user.pending_changes)
        : user.pending_changes;

    await pool.query(
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

// -------- DELETE /restaurants/:id (Admin + транзакција) --------
app.delete(
  "/restaurants/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;
    const clientDB = await pool.connect(); // транзакција

    try {
      await clientDB.query("BEGIN");

      const result = await clientDB.query(
        "SELECT image_url FROM restaurants WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        await clientDB.query("ROLLBACK");
        return res.status(404).json({ message: "Restaurant not found." });
      }

      const restaurantImageUrl = result.rows[0].image_url;
      const menuImagesResult = await clientDB.query(
        "SELECT image_url FROM menu_items WHERE restaurant_id = $1",
        [id]
      );
      const menuImages = menuImagesResult.rows
        .map((row) => row.image_url)
        .filter(Boolean);

      await clientDB.query("DELETE FROM menu_items WHERE restaurant_id = $1", [
        id,
      ]);
      await clientDB.query("DELETE FROM restaurants WHERE id = $1", [id]);

      await clientDB.query("COMMIT");

      // Сега избриши ги датотеките
      if (restaurantImageUrl) {
        const restaurantImagePath = path.join(
          __dirname,
          "public",
          "uploads",
          path.basename(restaurantImageUrl)
        );
        if (fs.existsSync(restaurantImagePath)) {
          fs.unlink(restaurantImagePath, (err) => {
            if (err) {
              console.error("❌ Error deleting restaurant image:", err);
            } else {
              console.log("✅ Restaurant image deleted:", restaurantImagePath);
            }
          });
        } else {
          console.warn("⚠️ Restaurant image not found:", restaurantImagePath);
        }
      }
      menuImages.forEach((imageUrl) => {
        const menuImagePath = path.join(
          __dirname,
          "public",
          "uploads",
          path.basename(imageUrl)
        );
        if (fs.existsSync(menuImagePath)) {
          fs.unlink(menuImagePath, (err) => {
            if (err) {
              console.error("❌ Error deleting menu image:", err);
            } else {
              console.log("✅ Menu image deleted:", menuImagePath);
            }
          });
        } else {
          console.warn("⚠️ Menu image not found:", menuImagePath);
        }
      });

      res.json({
        message: "Restaurant and its menu items deleted successfully.",
      });
    } catch (error) {
      await clientDB.query("ROLLBACK");
      console.error("❌ Error deleting restaurant:", error);
      res.status(500).json({ message: "Error deleting restaurant." });
    } finally {
      clientDB.release();
    }
  }
);

// -------- DELETE /menu_items/:id (Admin) --------
app.delete(
  "/menu_items/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const query = "DELETE FROM menu_items WHERE id = $1 RETURNING *";
      const result = await pool.query(query, [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Menu item not found." });
      }
      res.json({ message: "Menu item deleted successfully." });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// -------- POST /restaurants (Admin) --------
app.post(
  "/restaurants",
  authenticateToken,
  authenticateAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "menuImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { name, cuisine, working_hours, menuItems } = req.body;
      if (!name || !cuisine || !working_hours) {
        return res.status(400).json({ message: "All fields are required." });
      }
      const image_url = req.files["image"]
        ? `/uploads/${req.files["image"][0].filename}`
        : null;

      const restaurantQuery = `
        INSERT INTO restaurants (name, cuisine, image_url, working_hours)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const restaurantResult = await pool.query(restaurantQuery, [
        name,
        cuisine,
        image_url,
        working_hours,
      ]);
      const restaurantId = restaurantResult.rows[0].id;

      if (menuItems) {
        let parsedMenu;
        try {
          parsedMenu = JSON.parse(menuItems);
        } catch (error) {
          return res.status(400).json({ message: "Invalid menu format." });
        }
        if (!Array.isArray(parsedMenu)) {
          return res
            .status(400)
            .json({ message: "Menu items must be an array." });
        }
        const insertPromises = parsedMenu.map((item, index) => {
          const menuImage =
            req.files["menuImages"] && req.files["menuImages"][index]
              ? `/uploads/${req.files["menuImages"][index].filename}`
              : null;
          return pool.query(
            `
              INSERT INTO menu_items
                (restaurant_id, name, price, image_url, category)
              VALUES ($1, $2, $3, $4, $5)
            `,
            [restaurantId, item.name, item.price, menuImage, item.category]
          );
        });
        await Promise.all(insertPromises);
      }
      res
        .status(201)
        .json({ message: "Restaurant and menu added successfully." });
    } catch (error) {
      console.error("Error adding restaurant and menu:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// -------- PUT /restaurants/:id --------
app.put("/restaurants/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, cuisine, working_hours } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  console.log("Received Update Request:", {
    id,
    name,
    cuisine,
    working_hours,
    image_url,
  });

  try {
    const result = await pool.query(
      "UPDATE restaurants SET name=$1, cuisine=$2, working_hours=$3, image_url=COALESCE($4, image_url) WHERE id=$5 RETURNING *",
      [name, cuisine, working_hours, image_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Restaurant not found in DB" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// -------- PUT /menu_items/:id --------
app.put(
  "/menu_items/:id",
  authenticateToken,
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    let { name, price, category, ingredients, addons } = req.body;
    let imageUrl = null;

    try {
      const result = await pool.query(
        "SELECT image_url FROM menu_items WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Menu item not found." });
      }
      const existingImageUrl = result.rows[0].image_url;

      // ✅ Ако има нова слика, избриши ја старата
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
        if (existingImageUrl) {
          const oldImagePath = path.join(__dirname, "public", existingImageUrl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
              if (err) {
                console.error("❌ Error deleting old image:", err);
              } else {
                console.log("✅ Old menu item image deleted:", oldImagePath);
              }
            });
          }
        }
      } else {
        imageUrl = existingImageUrl;
      }

      // ✅ Осигури се дека `price` е број
      price = parseFloat(price);
      if (isNaN(price)) {
        return res.status(400).json({ message: "Invalid price format." });
      }

      // ✅ Осигури дека `ingredients` и `addons` се правилно парсирани
      try {
        ingredients = ingredients ? JSON.parse(ingredients) : [];
        addons = addons ? JSON.parse(addons) : [];
      } catch (error) {
        return res
          .status(400)
          .json({ message: "Invalid ingredients or addons format." });
      }

      // ✅ Осигурај се дека `ingredients` и `addons` се низа
      if (!Array.isArray(ingredients) || !Array.isArray(addons)) {
        return res
          .status(400)
          .json({ message: "Ingredients and addons must be arrays." });
      }

      const updateQuery = `
        UPDATE menu_items
        SET name = $1, price = $2, category = $3, ingredients = $4::text[], addons = $5::text[], image_url = $6
        WHERE id = $7
        RETURNING *`;

      const updatedItem = await pool.query(updateQuery, [
        name,
        price,
        category,
        ingredients, // ✅ Веќе е низа, нема потреба од `JSON.parse`
        addons,
        imageUrl,
        id,
      ]);

      if (updatedItem.rows.length === 0) {
        return res.status(404).json({ message: "Menu item update failed." });
      }
      res.json({
        message: "Menu item updated successfully.",
        menuItem: updatedItem.rows[0],
      });
    } catch (error) {
      console.error("❌ Error updating menu item:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// -------- DELETE /restaurants/:id/menu --------
app.delete(
  "/restaurants/:id/menu",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM menu_items WHERE restaurant_id = $1", [id]);
      res.json({ message: "All menu items deleted for this restaurant." });
    } catch (error) {
      console.error("Error deleting menu items:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// -------- POST /restaurants/:id/menu --------
app.post(
  "/restaurants/:id/menu",
  authenticateToken,
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const { name, price, category } = req.body;
    try {
      const checkRestaurant = await pool.query(
        "SELECT * FROM restaurants WHERE id = $1",
        [id]
      );
      if (checkRestaurant.rows.length === 0) {
        return res.status(404).json({ message: "Restaurant not found." });
      }
      let image_url = null;
      if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
      }
      await pool.query(
        `
          INSERT INTO menu_items (restaurant_id, name, price, category, image_url)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [id, name, price, category, image_url]
      );
      res.status(201).json({ message: "New menu item added." });
    } catch (error) {
      console.error("Error adding menu item:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// -------- POST /orders (пример) --------
app.post("/orders", authenticateToken, async (req, res) => {
  const { restaurant_id, total_price, items } = req.body;
  const user_id = req.user.id;
  if (!restaurant_id || !total_price || !items || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Недостасуваат податоци за нарачката!" });
  }

  const clientDB = await pool.connect();
  try {
    await clientDB.query("BEGIN");
    const restaurantCheck = await clientDB.query(
      "SELECT id FROM restaurants WHERE id = $1",
      [restaurant_id]
    );
    if (restaurantCheck.rows.length === 0) {
      await clientDB.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Нема поврзан ресторан за оваа нарачка." });
    }
    const orderResult = await clientDB.query(
      "INSERT INTO orders (user_id, restaurant_id, total_price, status) VALUES ($1, $2, $3, 'Примена') RETURNING *",
      [user_id, restaurant_id, total_price]
    );
    const order_id = orderResult.rows[0].id;
    for (const item of items) {
      await clientDB.query(
        "INSERT INTO order_items (order_id, item_id, quantity) VALUES ($1, $2, $3)",
        [order_id, item.id, item.quantity]
      );
    }
    await clientDB.query("COMMIT");
    res.status(201).json({
      message: "Нарачката е успешно креирана!",
      order: orderResult.rows[0],
    });
  } catch (error) {
    await clientDB.query("ROLLBACK");
    console.error("❌ Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    clientDB.release();
  }
});

// -------- GET /orders (пример: само role=delivery) --------
app.get("/orders", authenticateToken, async (req, res) => {
  if (req.user.role !== "delivery") {
    return res
      .status(403)
      .json({ message: "Само доставувачи можат да ги гледаат нарачките!" });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE status IN ('Примена', 'Во подготовка')"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------- GET /me --------
app.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT role FROM users WHERE id = $1", [
      req.user.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ role: result.rows[0].role });
  } catch (error) {
    console.error("❌ Error fetching user role:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------- PUT /orders/:id/accept (delivery only) --------
app.put("/orders/:id/accept", authenticateToken, async (req, res) => {
  if (req.user.role !== "delivery") {
    return res
      .status(403)
      .json({ message: "Само доставувачи можат да прифаќаат нарачки!" });
  }
  try {
    const orderResult = await pool.query(
      "SELECT status FROM orders WHERE id = $1",
      [req.params.id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Нарачката не е пронајдена!" });
    }
    if (orderResult.rows[0].status !== "Примена") {
      return res
        .status(400)
        .json({ message: "Оваа нарачка веќе е прифатена!" });
    }
    await pool.query("UPDATE orders SET status = 'Во достава' WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ message: "Нарачката е прифатена!" });
  } catch (error) {
    console.error("❌ Error accepting order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/orders/:id/status", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 👈 Прифаќа статус кој ќе се постави

  // ✅ Дозволени статуси
  const allowedStatuses = [
    "Примена",
    "Во подготовка",
    "Во достава",
    "Завршена",
  ];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({
      message: `Order status updated to '${status}'.`,
      order: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// -------- GET /my-orders --------
app.get("/my-orders", authenticateToken, async (req, res) => {
  try {
    console.log("📌 Барам нарачки за user_id:", req.user.id);

    // Земаме ги сите нарачки на корисникот
    const ordersResult = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );

    if (ordersResult.rows.length === 0) {
      return res.json([]); // Ако нема нарачки, врати празен список
    }

    const orders = ordersResult.rows;

    // Земаме ги сите артикли од нарачките
    const orderIds = orders.map((order) => order.id);
    const orderItemsResult = await pool.query(
      `SELECT oi.order_id, oi.item_id, oi.quantity, oi.item_price, mi.name, mi.image_url
       FROM order_items oi
       JOIN menu_items mi ON oi.item_id = mi.id
       WHERE oi.order_id = ANY($1::int[])`,
      [orderIds]
    );

    // Групирај ги артиклите по `order_id`
    const itemsByOrder = {};
    orderItemsResult.rows.forEach((item) => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    });

    // Комбинирај ги нарачките со артиклите
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error("❌ Грешка при преземање нарачки:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------- POST /orders (друга дефиниција - внимавај да не се судри) --------
app.post("/orders", authenticateToken, async (req, res) => {
  const { restaurant_id, total_price, items } = req.body;
  const user_id = req.user.id;

  if (!restaurant_id || !total_price || !items || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Недостасуваат податоци за нарачката!" });
  }

  const clientDB = await pool.connect();
  try {
    await clientDB.query("BEGIN");

    // Проверка дали ресторанот постои
    const restaurantCheck = await clientDB.query(
      "SELECT id FROM restaurants WHERE id = $1",
      [restaurant_id]
    );
    if (restaurantCheck.rows.length === 0) {
      await clientDB.query("ROLLBACK");
      return res.status(400).json({ message: "Ресторанот не постои!" });
    }

    // Вметнување на нова нарачка
    const orderResult = await clientDB.query(
      "INSERT INTO orders (user_id, restaurant_id, total_price, status, created_at) VALUES ($1, $2, $3, 'Примена', NOW()) RETURNING *",
      [user_id, restaurant_id, total_price]
    );

    const order_id = orderResult.rows[0].id;

    // Вметнување на секој item од нарачката во `order_items`
    const orderItemsQuery = `
      INSERT INTO order_items (order_id, item_id, quantity, item_price) 
      VALUES ($1, $2, $3, $4)
    `;

    for (const item of items) {
      await clientDB.query(orderItemsQuery, [
        order_id,
        item.id,
        item.quantity,
        item.price,
      ]);
    }

    await clientDB.query("COMMIT");

    // Превземи ги ставките за да ги вратиме како одговор
    const orderItems = await clientDB.query(
      "SELECT item_id, quantity, item_price FROM order_items WHERE order_id = $1",
      [order_id]
    );

    res.status(201).json({
      message: "Нарачката е успешно креирана!",
      order: {
        ...orderResult.rows[0],
        items: orderItems.rows,
      },
    });
  } catch (error) {
    await clientDB.query("ROLLBACK");
    console.error("❌ Грешка при креирање на нарачката:", error);
    res.status(500).json({ message: "Серверска грешка." });
  } finally {
    clientDB.release();
  }
});

// ===================== Start the server =====================
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
