import nodemailer from 'nodemailer';
import logger from './logger.js';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    logger.info(`Message sent: ${info.messageId}`);
  } catch (err) {
    logger.error(`Error sending email: ${err.message}`);
  }
};

export default sendEmail;
