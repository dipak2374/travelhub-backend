import { getTransporter } from '../config/email.js';

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.error('Email transporter is not configured');
    return { success: false, error: 'Email transporter is not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otp, name) => {
  return sendEmail({
    to: email,
    subject: 'TravelHub - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">TravelHub</h2>
        <p>Hi ${name},</p>
        <p>Your OTP for login is:</p>
        <h1 style="color: #0d9488; letter-spacing: 8px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your TravelHub OTP is: ${otp}. Expires in 10 minutes.`,
  });
};

export const sendBookingConfirmation = async (email, booking) => {
  return sendEmail({
    to: email,
    subject: `TravelHub - Booking Confirmed (${booking.bookingReference})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Booking Confirmed!</h2>
        <p>Reference: <strong>${booking.bookingReference}</strong></p>
        <p>Type: ${booking.bookingType}</p>
        <p>Amount: $${booking.totalAmount}</p>
        <p>Status: ${booking.status}</p>
        <p>Thank you for booking with TravelHub!</p>
      </div>
    `,
  });
};

