# Quick Setup Guide - Email & OTP System

## Step 1: Install Nodemailer
```bash
npm install nodemailer
```

## Step 2: Update Database Schema
If using PostgreSQL, add these columns to your users table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
```

## Step 3: Configure Email Service

### Option A: Using Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow setup steps

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Add to .env file**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### Option B: Using Other Email Services

**SendGrid:**
```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
```

**AWS SES:**
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
```

## Step 4: Test Email Sending

Create a test file: `test-email.js`

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'your-test-email@gmail.com',
    subject: 'Test Email',
    text: 'This is a test email from VertexPrime Capital'
}, (error, info) => {
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Email sent:', info.response);
    }
});
```

Run with:
```bash
node test-email.js
```

## Step 5: Start the Server

```bash
npm run start
```

Your server should start on http://localhost:4000

## Step 6: Test the Signup Flow

1. Navigate to `/signup` in your application
2. Fill in personal information (Step 1)
3. Fill in account details (Step 2)
4. Enter date of birth (Step 3)
5. Create password (Step 4)
6. Agree to terms
7. Click "Create Account"
8. Check email for OTP
9. Enter OTP in modal
10. Account created successfully!

## Troubleshooting

### "EAUTH: Invalid login" Error
- Check EMAIL_USER and EMAIL_PASSWORD
- Verify Gmail App Password (not regular password)
- Check 2FA is enabled on Gmail account

### OTP Modal Not Appearing
- Check browser console for errors
- Verify API endpoint is responding
- Check CORS configuration

### Emails Not Received
- Check spam folder
- Verify EMAIL_USER value is correct
- Check email service logs
- Try sending test email

## API Testing with Postman

### Request 1: Send OTP
```
POST http://localhost:4000/api/auth/send-otp
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Request 2: Verify OTP
```
POST http://localhost:4000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456",
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe123",
    "country": "United States",
    "currency": "USD",
    "accountType": "individual",
    "dateOfBirth": "1990-01-01",
    "password": "SecurePass123!"
  }
}
```

## Environment Variables Checklist

- [ ] DATABASE_URL configured
- [ ] EMAIL_USER configured
- [ ] EMAIL_PASSWORD configured
- [ ] JWT_SECRET configured
- [ ] PORT configured (default: 4000)
- [ ] NODE_ENV set (development/production)

## Next Steps

1. Test signup form thoroughly
2. Monitor email delivery
3. Set up error logging
4. Configure production email service
5. Enable rate limiting on auth endpoints
6. Set up monitoring and alerts
