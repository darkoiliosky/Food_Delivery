import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendRegistrationEmail(userData) {
  try {
    // Креираме транспортер за Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dostavapp@gmail.com",
        pass: "jvqdarpxhbxeelwd", // App Password без празни места
      },
    });

    // Подесуваме детали за имејлот
    const mailOptions = {
      from: `"Dostava App" <dostavapp@gmail.com>`, // Од кого испраќате
      to: "dostavapp@gmail.com", // Или кон кој сакате да праќате
      subject: "Нов корисник се регистрираше!",
      text: `Корисник со следниве податоци се регистрира:
Име: ${userData.name} ${userData.lastname}
Емаил: ${userData.email}
Телефон: ${userData.phone}`,
    };

    // Испраќаме имејл
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
