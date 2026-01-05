import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, purpose) => {
  const purposeText = {
    'signup': 'Sign Up',
    'login': 'Login',
    'reset-password': 'Reset Password'
  };

  const mailOptions = {
    from: `"BuzzTube" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your BuzzTube ${purposeText[purpose]} OTP`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px dashed #667eea; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; }
          .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 BuzzTube</h1>
            <p>${purposeText[purpose]} Verification</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested to ${purpose === 'signup' ? 'create a new account' : purpose === 'login' ? 'login to your account' : 'reset your password'}. Please use the following One-Time Password (OTP) to verify your email:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            
            <p class="warning">⚠️ If you didn't request this OTP, please ignore this email and ensure your account is secure.</p>
            
            <p>Thank you,<br>The BuzzTube Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; 2026 BuzzTube. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

// Send welcome email after successful signup
export const sendWelcomeEmail = async (email, fullname) => {
  const mailOptions = {
    from: `"BuzzTube" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Welcome to BuzzTube! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Welcome to BuzzTube!</h1>
          </div>
          <div class="content">
            <p>Hi ${fullname},</p>
            <p>Welcome to BuzzTube! 🎉 We're excited to have you join our community of content creators and viewers.</p>
            
            <p><strong>Here's what you can do now:</strong></p>
            <ul>
              <li>📹 Upload your first video</li>
              <li>👤 Customize your profile</li>
              <li>🔔 Subscribe to your favorite channels</li>
              <li>💬 Comment and engage with content</li>
              <li>⭐ Like and bookmark videos</li>
            </ul>
            
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            
            <p>Happy streaming!<br>The BuzzTube Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 BuzzTube. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email failure
  }
};
