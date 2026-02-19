# VertexPrime Capital - Advanced Signup System

## Overview
This document describes the comprehensive signup system with email verification, OTP, multi-step form, and professional UI/UX.

## Features Implemented

### 1. **Multi-Step Form (4 Stages)**
- **Step 1: Personal Information**
  - First Name
  - Last Name
  - Username (3+ characters)

- **Step 2: Account Details**
  - Email Address (validated)
  - Country Selection (10+ options)
  - Currency Selection (8+ options)
  - Account Type (Individual, Corporate, Partnership)

- **Step 3: Age Verification**
  - Date of Birth input
  - Automatic age validation (18+ required)
  - Educational info display

- **Step 4: Security & Terms**
  - Password creation with strength indicator
  - Confirm password field
  - Terms & Conditions agreement
  - Show/hide password toggles

### 2. **Professional UI Design**
- **Typography**
  - Poppins font for headings (bold, modern)
  - Inter font for body text (clean, readable)

- **Color Scheme**
  - Gradient background (slate-900 → blue-900)
  - Glass-morphism cards with blur effect
  - Blue-cyan accent colors

- **Responsive Design**
  - Mobile-first approach
  - Grid layouts for multi-column inputs
  - Touch-friendly button sizes

### 3. **Form Validations**
✓ Email format validation  
✓ Password minimum length (8 characters)  
✓ Password confirmation matching  
✓ Username requirements (3+ chars)  
✓ Age verification (18+)  
✓ All required fields checked  
✓ Real-time error display with animations  

### 4. **Password Strength Indicator**
- Visual progress bar with gradient colors
- 5-level strength system (Weak → Strong)
- Requirements checklist:
  - Minimum 8 characters
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character

### 5. **Password Visibility Toggle**
- Eye icon button for show/hide password
- Separate toggles for password and confirm password
- Smooth visual transitions

### 6. **Email Verification System**
- OTP generation (6-digit random code)
- Email sending via Nodemailer
- 10-minute OTP expiration
- OTP stored temporarily (in-memory, use Redis in production)
- Verification modal with countdown

### 7. **Modals & Feedback**
- **OTP Verification Modal**
  - 6-digit OTP input
  - Resend OTP option
  - Real-time validation
  - Loading state

- **Success Modal**
  - Animated checkmark icon
  - Welcome message
  - Auto-redirect after 4 seconds

- **Failure Modal**
  - Error icon animation
  - Descriptive error messages
  - Retry button

- **Terms & Conditions Modal**
  - 6 detailed sections:
    1. Risk Disclosure
    2. Investment Risks
    3. Account Security
    4. Age & Legal Requirements
    5. Limitation of Liability
    6. Terms of Service Agreement

### 8. **Loading Animations**
- Animated chart bars (Forex-like visualization)
- Spinner icon during processing
- Smooth transitions between states
- Progress indicators on multi-step form

### 9. **Progressive Disclosure**
- Step progress bar with visual indicators
- Step labels (Personal → Account → Verification → Security)
- Back button for easy navigation
- Form state persists while moving through steps

## Backend Integration

### Email Configuration
```javascript
// Configure in .env file
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password // Use Gmail App Password
```

### API Endpoints

#### 1. Send OTP
```
POST /api/auth/send-otp
Body: { email: "user@example.com" }
Response: { success: true, message: "OTP sent to your email" }
```

#### 2. Verify OTP & Create Account
```
POST /api/auth/verify-otp
Body: {
  email: "user@example.com",
  otp: "123456",
  userData: {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe123",
    country: "United States",
    currency: "USD",
    accountType: "individual",
    dateOfBirth: "1990-01-01",
    password: "SecurePass123!"
  }
}
Response: { success: true, message: "Account created successfully!" }
```

## Database Schema

Required user table columns:
```sql
- id (PRIMARY KEY)
- email (UNIQUE, NOT NULL)
- password (NOT NULL, hashed)
- first_name
- last_name
- username (UNIQUE, NOT NULL)
- country
- currency
- account_type
- date_of_birth
- role (default: 'trader')
- email_verified (default: false)
- created_at (TIMESTAMP DEFAULT NOW())
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install nodemailer
```

### 2. Configure Environment Variables
Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/db
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password
JWT_SECRET=your-secret-key
```

### 3. Enable Gmail App Password (if using Gmail)
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Create App Password for Node.js
4. Use this password in EMAIL_PASSWORD

### 4. Test Email Sending
The server will log OTP generation and sending attempts.

## Frontend Usage

### Import Signup Component
```tsx
import Signup from '@/pages/auth/Signup/Signup'
```

### Route Configuration
```tsx
// In your router/navigation
{
  path: '/signup',
  component: Signup
}
```

## Security Considerations

✓ **Password Hashing**: Uses bcryptjs with salt rounds  
✓ **OTP Expiration**: 10-minute validity window  
✓ **Email Verification**: Required before account activation  
✓ **CORS Protection**: Limited to authorized origins  
✓ **Helmet.js**: Security headers enabled  
✓ **Input Validation**: All inputs validated server-side  
✓ **SSL/TLS**: Use HTTPS in production  

## Production Checklist

- [ ] Move OTP storage from Map to Redis
- [ ] Configure production email service (SendGrid, AWS SES, etc.)
- [ ] Set secure environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Implement rate limiting on auth endpoints
- [ ] Add logging and monitoring
- [ ] Test email delivery thoroughly
- [ ] Set up SSL certificates

## Customization Options

### Change Colors
Edit the Tailwind color classes in `Signup.tsx`:
- `from-blue-600 to-cyan-600` - Primary gradient
- `from-slate-900 via-blue-900` - Background gradient

### Adjust Password Requirements
Modify `calculatePasswordStrength()` function to change strength criteria.

### Email Templates
Edit email HTML in `sendOTPEmail()` and welcome email functions.

### OTP Expiration
Change `10 * 60 * 1000` to desired milliseconds in OTP verification.

## Troubleshooting

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Verify Gmail App Password is generated correctly
- Check firewall/network connectivity
- Check console logs for errors

### OTP Not Working
- Verify database connection
- Check OTP store is being populated
- Verify timestamp calculation

### Form Not Submitting
- Check browser console for errors
- Verify API endpoint is accessible
- Check CORS configuration
- Verify form validation passes

## Future Enhancements

- [ ] SMS OTP as alternative to email
- [ ] Social login (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] Email templates in database
- [ ] Customizable verification periods
- [ ] User invitation system
- [ ] Profile picture upload
- [ ] Account recovery options
