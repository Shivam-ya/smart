import nodemailer from "nodemailer";

// Create a transporter using Nodemailer
// For production, you should provide these in your environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  auth: {
    user: process.env.EMAIL_USER || "test@ethereal.email",
    pass: process.env.EMAIL_PASS || "password",
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"AttendIQ" <noreply@attendiq.demo>',
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
};
