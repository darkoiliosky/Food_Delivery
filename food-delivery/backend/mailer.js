import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Функција за креирање на mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // ✅ Email од .env
    pass: process.env.EMAIL_PASS, // ✅ App Password од .env
  },
});

// ✅ Известување до администраторот за нов корисник
export async function sendAdminNotification(userData) {
  try {
    const mailOptions = {
      from: `"Dostava App" <${process.env.EMAIL_USER}>`, // ✅ Динамичен email испраќач
      to: process.env.EMAIL_USER, // ✅ Админ email од .env
      subject: "Нов корисник се регистрираше!",
      text: `Корисник со следниве податоци се регистрира:
Име: ${userData.name} ${userData.lastname}
Емаил: ${userData.email}
Телефон: ${userData.phone}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
  }
}

// ✅ Испраќање верификациски email до корисник
export async function sendUserVerificationEmail(userData) {
  try {
    const mailOptions = {
      from: `"Dostava App" <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: "Verify your email address",
      text: `Здраво, ${userData.name}!

Ве молиме кликнете на следниов линк за да го потврдите вашиот email:
${userData.verifyURL}

Доколку не сте се регистрирале, игнорирајте го овој имејл.
`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
  }
}

// ✅ Испраќање email за ресетирање на лозинка
export async function sendResetPasswordEmail(email, resetLink) {
  try {
    const mailOptions = {
      from: `"Dostava App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      text: `Кликнете на следниов линк за да ја ресетирате вашата лозинка:
${resetLink}

Овој линк е валиден 1 час.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error sending reset password email:", error);
  }
}

// ✅ Испраќање email за потврда на промена на профил
export async function sendVerificationEmail(email, confirmURL) {
  try {
    const mailOptions = {
      from: `"Dostava App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Confirm Profile Changes",
      text: `Кликнете на следниов линк за да ги потврдите измените:
${confirmURL}

Доколку не сте ги направиле овие измени, игнорирајте го овој емаил.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error sending profile confirmation email:", error);
  }
}
