// sendEmail.js (or sendResetEmail.js)
import nodemailer from 'nodemailer';

const sendResetEmail = async (email, token) => {
  // Nodemailer setup using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email content
  const mailOptions = {
    from: `"Sample Pack Svelte App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset',
    html: `<p>You have requested to reset your password. Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">here</a> to reset your password.</p>`,
  };

  // Send email
  return transporter.sendMail(mailOptions);
};

export { sendResetEmail };