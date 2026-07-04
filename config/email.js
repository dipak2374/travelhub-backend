import nodemailer from 'nodemailer';

let transporter = null;

export const configureEmail = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Email transporter configured');
    transporter.verify((error) => {
      if (error) {
        console.error('Email transporter verification failed:', error.message);
      } else {
        console.log('Email transporter ready to send OTP emails');
      }
    });
  } else {
    console.warn('SMTP credentials not set — email sending will fall back to console logging. OTP emails are not actually delivered.');
    transporter = {
      sendMail: async ({ from, to, subject, html, text }) => {
        console.log('=== EMAIL FALLBACK ===');
        console.log(`From: ${from}`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        if (text) console.log(`Text: ${text}`);
        if (html) console.log(`HTML: ${html}`);
        console.log('=== END EMAIL ===');
        return { messageId: 'console-fallback' };
      },
    };
  }
};

export const getTransporter = () => transporter;

export default transporter;
