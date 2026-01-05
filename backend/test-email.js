import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Gmail connection...');
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✓ Set' : '✗ Not set');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Test connection
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Full error:', error);
  } else {
    console.log('✅ Server is ready to send emails');
    
    // Try sending test email
    const mailOptions = {
      from: `"BuzzTube Test" <${process.env.GMAIL_USER}>`,
      to: 'amisougata25@gmail.com',
      subject: 'Test OTP Email',
      text: 'Your OTP is: 123456'
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('❌ Failed to send test email:', err.message);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
      }
      process.exit(0);
    });
  }
});
