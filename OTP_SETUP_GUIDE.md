# Gmail OTP Setup Guide

## Gmail App Password Setup

To enable OTP email sending, you need to generate a Gmail App Password:

### Steps:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to your Google Account: https://myaccount.google.com/
   - Click "Security" in the left sidebar
   - Find "2-Step Verification" and turn it ON
   - Follow the steps to verify your phone number

2. **Generate App Password**:
   - After 2-Step Verification is enabled, go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Name it "BuzzTube Backend" or similar
   - Click "Generate"
   - **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

3. **Update .env File**:
   - Open `backend/.env`
   - Update these lines:
     ```
     GMAIL_USER=janasougata198@gmail.com
     GMAIL_APP_PASSWORD=abcdefghijklmnop
     ```
   - Replace `abcdefghijklmnop` with your actual 16-character app password (no spaces)

4. **Restart Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

## Testing OTP System

### Test Signup with OTP:
1. Go to `/register` on frontend
2. Fill in all details (email, username, fullname, password)
3. Click "Create account"
4. Check your email for 6-digit OTP
5. Enter OTP in the modal
6. Account will be created

### Test Login with OTP:
1. Go to `/login` on frontend
2. Click on "OTP" tab
3. Enter your email
4. Click "Send OTP"
5. Check your email for 6-digit OTP
6. Enter OTP in the modal
7. You'll be logged in

## Features Implemented

### Backend:
- ✅ OTP Model with automatic expiration (10 minutes)
- ✅ Email service using Nodemailer
- ✅ 4 new endpoints:
  - `POST /api/v1/users/send-signup-otp` - Send OTP for signup
  - `POST /api/v1/users/verify-signup-otp` - Verify OTP and create account
  - `POST /api/v1/users/send-login-otp` - Send OTP for login
  - `POST /api/v1/users/verify-login-otp` - Verify OTP and login
- ✅ Beautiful HTML email templates
- ✅ Welcome email after successful signup

### Frontend:
- ✅ OTPVerification component (reusable modal)
- ✅ 6-digit OTP input with auto-focus
- ✅ 60-second countdown timer
- ✅ Resend OTP functionality
- ✅ Paste support for OTP
- ✅ Updated Register page with OTP flow
- ✅ Updated Login page with OTP/Password toggle
- ✅ Beautiful animations and UX

## API Endpoints

### Send Signup OTP
```bash
POST /api/v1/users/send-signup-otp
Body: { "email": "user@example.com" }
```

### Verify Signup OTP
```bash
POST /api/v1/users/verify-signup-otp
Body: {
  "email": "user@example.com",
  "otp": "123456",
  "username": "johndoe",
  "fullname": "John Doe",
  "password": "password123",
  "avatar": "https://...",
  "coverImage": "https://..."
}
```

### Send Login OTP
```bash
POST /api/v1/users/send-login-otp
Body: { "email": "user@example.com" }
```

### Verify Login OTP
```bash
POST /api/v1/users/verify-login-otp
Body: {
  "email": "user@example.com",
  "otp": "123456"
}
```

## Security Features

- ✅ OTP expires after 10 minutes
- ✅ OTP is deleted after successful verification
- ✅ Rate limiting recommended (add express-rate-limit)
- ✅ 6-digit random OTP generation
- ✅ Email validation before sending OTP
- ✅ User existence check for login OTP

## Troubleshooting

### Emails not sending?
- Check Gmail App Password is correct
- Check 2-Step Verification is enabled
- Check no spaces in app password in .env
- Check GMAIL_USER email is correct
- Check backend console for errors

### OTP not working?
- Check OTP hasn't expired (10 minutes)
- Check email matches exactly
- Check backend is running and connected to MongoDB
- Check browser console for errors

## Next Steps (Optional Enhancements)

1. Add rate limiting to prevent OTP spam
2. Add forgot password with OTP
3. Add email verification for existing users
4. Add SMS OTP support (using Twilio)
5. Add OTP attempt limits (max 3 wrong attempts)
6. Add blacklist for suspicious emails

## Notes

- OTPs are stored in MongoDB and auto-deleted after expiration
- Welcome email is sent automatically after signup
- Frontend has beautiful OTP input UI with animations
- Both signup and login support OTP
- Regular password login is still available
