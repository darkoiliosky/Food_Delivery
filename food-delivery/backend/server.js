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
import e from "express";
import { env } from "process";
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
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const { Pool } = pkg;

// ✅ Конекција со PostgreSQL
const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT, // Стандардниот порт за PostgreSQL
});
export default pool;

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
      { expiresIn: "2h" }
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
    // Прво провери дали постои самиот ресторан
    const restaurantExists = await client.query(
      "SELECT id FROM restaurants WHERE id = $1",
      [restaurantId]
    );
    if (restaurantExists.rows.length === 0) {
      return res.status(404).send("Restaurant not found.");
    }

    // Потоа земи ги мени предметите
    const menuResult = await client.query(
      "SELECT * FROM menu_items WHERE restaurant_id = $1",
      [restaurantId]
    );

    // Нема потреба да враќаме 404 ако нема ниту еден menu_item
    // Едноставно праќаме []
    return res.json(menuResult.rows);
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

    // Земаш connection од Pool
    const clientDB = await pool.connect();

    try {
      await clientDB.query("BEGIN");

      // 1) Проверуваме дали ресторанот постои
      const result = await clientDB.query(
        "SELECT image_url FROM restaurants WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        await clientDB.query("ROLLBACK");
        return res.status(404).json({ message: "Restaurant not found." });
      }

      const restaurantImageUrl = result.rows[0].image_url;

      // 2) Земи ги сите menu_items
      const menuImagesResult = await clientDB.query(
        "SELECT image_url FROM menu_items WHERE restaurant_id = $1",
        [id]
      );
      const menuImages = menuImagesResult.rows
        .map((row) => row.image_url)
        .filter(Boolean);

      // 3) Избриши menu_items
      await clientDB.query("DELETE FROM menu_items WHERE restaurant_id = $1", [
        id,
      ]);

      // 4) Избриши restaurants
      await clientDB.query("DELETE FROM restaurants WHERE id = $1", [id]);

      // 5) Заврши транзакција (COMMIT) – операции во базата се успешно завршени
      await clientDB.query("COMMIT");

      // 6) Сега избриши ги датотеките од дискот
      // (дури после COMMIT, за да сме сигурни дека базата е ажурирана)

      // Ако има слика за ресторанот, избриши ја
      if (restaurantImageUrl) {
        const restaurantImagePath = path.join(
          __dirname,
          "public",
          "uploads",
          path.basename(restaurantImageUrl) // Осигурај се дека не користи цела патека
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

      // Мену слики:
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

      // 7) Врати успешен одговор
      res.json({
        message: "Restaurant and its menu items deleted successfully.",
      });
    } catch (error) {
      // Ако нешто тргне наопаку, правиме ROLLBACK на базата
      await clientDB.query("ROLLBACK");
      console.error("❌ Error deleting restaurant:", error);
      res.status(500).json({ message: "Error deleting restaurant." });
    } finally {
      // МНОГУ ВАЖНО: ослободи ја конекцијата кон базата
      clientDB.release();
    }
  }
);

app.delete(
  "/menu_items/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const query = "DELETE FROM menu_items WHERE id = $1 RETURNING *";
      const result = await client.query(query, [req.params.id]);
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

app.post(
  "/restaurants",
  authenticateToken,
  authenticateAdmin,
  upload.fields([
    { name: "image", maxCount: 1 }, // ✅ Главна слика за ресторанот
    { name: "menuImages", maxCount: 10 }, // ✅ До 10 слики за мени предмети
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

      // 1) Прво вметни го ресторанот
      const restaurantQuery = `
        INSERT INTO restaurants (name, cuisine, image_url, working_hours)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const restaurantResult = await client.query(restaurantQuery, [
        name,
        cuisine,
        image_url,
        working_hours,
      ]);
      const restaurantId = restaurantResult.rows[0].id;

      // 2) Ако имаме 'menuItems' во body, парсирај ги и вметни ги во menu_items
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

        // ✅ ОВДЕ треба да го ставиш map(...) + Promise.all(...)
        // Наместо forEach(...) { client.query(...) }, користи го овој код:
        const insertPromises = parsedMenu.map((item, index) => {
          const menuImage =
            req.files["menuImages"] && req.files["menuImages"][index]
              ? `/uploads/${req.files["menuImages"][index].filename}`
              : null;

          // ВРАЌАШ Promise (client.query...) за секој item
          return client.query(
            `
              INSERT INTO menu_items
                (restaurant_id, name, price, image_url, category)
              VALUES ($1, $2, $3, $4, $5)
            `,
            [restaurantId, item.name, item.price, menuImage, item.category]
          );
        });

        // ❗ Важно: тука „чекаш“ сите промиси да завршат пред да вратиш одговор
        await Promise.all(insertPromises);
      }

      // 3) Ако сè прошло добро, врати одговор
      res
        .status(201)
        .json({ message: "Restaurant and menu added successfully." });
    } catch (error) {
      console.error("Error adding restaurant and menu:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

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

app.put(
  "/menu_items/:id",
  authenticateToken,
  authenticateAdmin,
  upload.single("image"), // Ако дозволуваш ажурирање на слика
  async (req, res) => {
    const { id } = req.params;
    const { name, price, category, ingredients, addons } = req.body;
    let imageUrl = null;

    try {
      // 1️⃣ Проверка дали предметот постои во базата
      const result = await client.query(
        "SELECT image_url FROM menu_items WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Menu item not found." });
      }

      const existingImageUrl = result.rows[0].image_url;

      // 2️⃣ Ако има нова слика, избриши ја старата
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
        imageUrl = existingImageUrl; // Ако нема нова слика, користи ја старата
      }

      // 3️⃣ Ажурирање на податоците во базата
      const updateQuery = `
        UPDATE menu_items 
        SET name = $1, price = $2, category = $3, ingredients = $4, addons = $5, image_url = $6
        WHERE id = $7
        RETURNING *`;

      const updatedItem = await client.query(updateQuery, [
        name,
        price,
        category,
        ingredients,
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

app.delete(
  "/restaurants/:id/menu",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      await client.query("DELETE FROM menu_items WHERE restaurant_id = $1", [
        id,
      ]);
      res.json({ message: "All menu items deleted for this restaurant." });
    } catch (error) {
      console.error("Error deleting menu items:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);
app.post(
  "/restaurants/:id/menu",
  authenticateToken,
  authenticateAdmin,
  upload.single("image"), // ако додаваме само 1 слика за еден предмет
  async (req, res) => {
    const { id } = req.params; // ID на ресторанот
    const { name, price, category } = req.body; // Податоци за meni item

    try {
      // 1) Проверуваме дали ресторанот постои
      const checkRestaurant = await client.query(
        "SELECT * FROM restaurants WHERE id = $1",
        [id]
      );
      if (checkRestaurant.rows.length === 0) {
        return res.status(404).json({ message: "Restaurant not found." });
      }

      // 2) Подготвуваме image_url ако има качено слика
      let image_url = null;
      if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
      }

      // 3) Вметни ново мени во базата
      await client.query(
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

// -----------------------------------------------------------------------------
// Start the server
// -----------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
