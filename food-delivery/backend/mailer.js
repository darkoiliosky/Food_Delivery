import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true", // Претвори го "false" во логичка вредност
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Проверка на SMTP конекцијата
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error: ", error);
  } else {
    console.log("SMTP Server is ready to take messages.");
  }
});

export default transporter;
