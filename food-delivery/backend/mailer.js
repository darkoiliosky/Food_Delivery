// mailer.js (пример)
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendAdminNotification(userData) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dostavapp@gmail.com", // вашата Gmail
        pass: "jvqdarpxhbxeelwd", // App Password
      },
    });

    // Се испраќа до вас (admin) – dostavapp@gmail.com
    const mailOptions = {
      from: `"Dostava App" <dostavapp@gmail.com>`,
      to: "dostavapp@gmail.com", // Admin email
      subject: "Нов корисник се регистрираше!",
      text: `Корисник со следниве податоци се регистрира:
Име: ${userData.name} ${userData.lastname}
Емаил: ${userData.email}
Телефон: ${userData.phone}`,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

export async function sendUserVerificationEmail(userData) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dostavapp@gmail.com",
        pass: "jvqdarpxhbxeelwd", // App Password
      },
    });

    const mailOptions = {
      from: `"Dostava App" <dostavapp@gmail.com>`,
      to: userData.email, // корисничка адреса
      subject: "Verify your email address",
      text: `Здраво, ${userData.name}!

Ве молиме кликнете на следниов линк за да го потврдите вашиот email:
${userData.verifyURL}

Доколку не сте се регистрирале, игнорирајте го овој имејл.
`,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

export async function sendResetPasswordEmail(email, resetLink) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dostavapp@gmail.com",
        pass: "jvqdarpxhbxeelwd",
      },
    });

    const mailOptions = {
      from: `"Dostava App" <dostavapp@gmail.com>`,
      to: email,
      subject: "Reset Your Password",
      text: `Click the link below to reset your password:
      ${resetLink}
      
      This link is valid for 1 hour.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending reset password email:", error);
  }
}

export async function sendVerificationEmail(email, confirmURL) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dostavapp@gmail.com",
      pass: "jvqdarpxhbxeelwd",
    },
  });

  const mailOptions = {
    from: `"Dostava App" <dostavapp@gmail.com>`,
    to: email,
    subject: "Confirm Profile Changes",
    text: `Кликнете на следниов линк за да ги потврдите измените:
${confirmURL}

Доколку не сте ги направиле овие измени, игнорирајте го овој емаил.`,
  };

  await transporter.sendMail(mailOptions);
}
