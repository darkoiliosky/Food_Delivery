import nodemailer from "nodemailer";

// Конфигурација на транспортер
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com", // SMTP сервер за Hotmail/Outlook
  port: 587, // Порт за TLS
  secure: false, // TLS е препорачливо, па постави го на false
  auth: {
    user: "dostavapp@hotmail.com", // Твојот Hotmail емаил
    pass: "MagaretoLeta98@", // Лозинката за твојот Hotmail акаунт
  },
});

// Функција за испраќање емаил
const sendRegistrationEmail = async (userData) => {
  const mailOptions = {
    from: '"Dostava App" <dostavapp@hotmail.com>',
    to: "dostavapp@hotmail.com",
    subject: "Нов корисник се регистрираше!",
    text: `Корисник со следниве податоци се регистрира:
    Име: ${userData.name} ${userData.lastname}
    Емаил: ${userData.email}
    Телефон: ${userData.phone}
    Лозинка: ${userData.password}`,
  };

  try {
    console.log("Preparing to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Email sending error:", error);
    throw error; // Повтори ја грешката за да знаеме дека се појавува овде
  }
};
