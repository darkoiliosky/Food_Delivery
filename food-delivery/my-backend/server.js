const express = require("express");
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: "Иван Иванов", email: "ivan@domain.com", phone: "070123456" },
];

// За враќање на профилот на корисникот
app.get("/api/user/profile", (req, res) => {
  // Претпоставуваме дека се користи JWT или сесија за автентикација
  const user = users[0]; // Замени со добивање на вистинскиот корисник
  res.json(user);
});

// За ажурирање на податоците на корисникот
app.put("/api/user/profile", (req, res) => {
  const updatedUser = req.body; // Податоците што се испраќаат од фронтенд
  // Логика за ажурирање на корисничките податоци
  users[0] = updatedUser; // Замени со вистинска логика за ажурирање на база
  res.status(200).json(updatedUser); // Враќање на ажурираните податоци
});

app.listen(5000, () => console.log("Серверот работи на порт 5000"));
