const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Builder'}" <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
    to: email,
    subject: 'Verify Your Email - Portfolio Builder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Verify Your Email</h2>
        <p>Thank you for registering with Portfolio Builder!</p>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p><strong>This code expires in 10 minutes.</strong></p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">Portfolio Builder - Build your professional portfolio</p>
      </div>
    `
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`OTP Email would be sent to: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`To enable email sending, configure SMTP in .env file`);
    return { success: true, previewUrl: null };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Builder'}" <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
    to: email,
    subject: 'Reset Your Password - Portfolio Builder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>You requested a password reset for your Portfolio Builder account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p><strong>This link expires in 10 minutes.</strong></p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">Portfolio Builder - Build your professional portfolio</p>
      </div>
    `
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`Password Reset Email would be sent to: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`To enable email sending, configure SMTP in .env file`);
    return { success: true, previewUrl: null };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password Reset Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  transporter
};