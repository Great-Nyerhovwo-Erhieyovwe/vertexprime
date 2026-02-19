# Code Snippets & Examples

## Quick Reference Guide

### 1. Email Configuration (in server)

```javascript
// Install Nodemailer
npm install nodemailer

// In server/index.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Send email
await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Subject",
    html: "<html>...</html>"
});
```

### 2. OTP Generation

```javascript
// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store with expiration (10 minutes)
const otpStore = new Map();
otpStore.set(email, { otp, timestamp: Date.now() });

// Verify expiration
const TEN_MINUTES = 10 * 60 * 1000;
if (Date.now() - storedData.timestamp > TEN_MINUTES) {
    // OTP expired
}
```

### 3. Password Hashing

```javascript
const bcrypt = require('bcryptjs');

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### 4. Form Validation Example

```typescript
// Email validation
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
}

// Age validation
const birthDate = new Date(dateOfBirth);
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
}
if (age < 18) {
    errors.dateOfBirth = 'Must be 18+';
}

// Password validation
if (password.length < 8) {
    errors.password = 'Minimum 8 characters';
}
if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
}
```

### 5. API Call Example

```typescript
// Send OTP
const response = await fetch('http://localhost:4000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: formData.email }),
});

const data = await response.json();
if (response.ok) {
    console.log('OTP sent successfully');
} else {
    console.error('Failed:', data.message);
}
```

### 6. Password Strength Calculation

```typescript
const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    
    // Length checks
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 20;
    
    // Character type checks
    if (/[a-z]/.test(pwd)) strength += 15;  // lowercase
    if (/[A-Z]/.test(pwd)) strength += 15;  // uppercase
    if (/[0-9]/.test(pwd)) strength += 15;  // number
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;  // special
    
    return Math.min(strength, 100);
};

// Color based on strength
const getPasswordStrengthColor = (strength: number) => {
    if (strength < 30) return 'from-red-500 to-red-600';
    if (strength < 60) return 'from-yellow-500 to-orange-600';
    if (strength < 80) return 'from-green-500 to-emerald-600';
    return 'from-green-400 to-green-600';
};
```

### 7. Framer Motion Animations

```typescript
// Container animation
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' }
    }
};

// Use animation
<motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
>
    {/* Content */}
</motion.div>

// Scale animation (checkmark)
<motion.div
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 0.5 }}
>
    <AiOutlineCheckCircle size={64} />
</motion.div>
```

### 8. Database Schema (PostgreSQL)

```sql
-- Create users table with signup fields
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(100),
    currency VARCHAR(10),
    account_type VARCHAR(50),
    date_of_birth DATE,
    role VARCHAR(50) DEFAULT 'trader',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
```

### 9. Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vertexprime

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx

# JWT
JWT_SECRET=your-very-secret-key-here

# Server
PORT=4000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:4000
```

### 10. Modal Implementation Example

```typescript
{showOtpModal && (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8"
        >
            {/* Modal content */}
        </motion.div>
    </motion.div>
)}
```

### 11. Error Handling Pattern

```typescript
try {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        const result = await response.json();
        // Handle success
    } else {
        const error = await response.json();
        setErrors({ [field]: error.message });
        setShowFailureModal(true);
    }
} catch (error) {
    console.error('Error:', error);
    setFailureMessage('Network error. Please try again.');
    setShowFailureModal(true);
}
```

### 12. Form State Management

```typescript
const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    country: '',
    currency: '',
    accountType: 'individual',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
});

// Update field
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
};
```

### 13. Step Navigation

```typescript
// Move to next step with validation
const handleNext = () => {
    if (validateStep(step)) {
        setStep(step + 1);
    }
};

// Go back to previous step
const handleBack = () => {
    setStep(step - 1);
    setErrors({});
};

// Submit final form
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    
    setIsLoading(true);
    try {
        const response = await fetch('/api/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email: formData.email })
        });
        
        if (response.ok) {
            setShowOtpModal(true);
        }
    } finally {
        setIsLoading(false);
    }
};
```

### 14. Loading State Component

```typescript
{isLoading ? (
    <div className="flex items-center justify-center gap-2">
        <AiOutlineLoading3Quarters className="animate-spin" size={20} />
        <span>Processing...</span>
    </div>
) : (
    'Create Account'
)}
```

### 15. Password Requirements Display

```typescript
{formData.password && (
    <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full bg-gradient-to-r ${getPasswordStrengthColor(passwordStrength)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            <span className="text-xs font-semibold text-gray-300">
                {getPasswordStrengthText(passwordStrength)}
            </span>
        </div>
        <ul className="text-xs text-gray-400 space-y-1">
            <li className={formData.password.length >= 8 ? 'text-green-400' : ''}>
                ✓ At least 8 characters
            </li>
            {/* More items */}
        </ul>
    </div>
)}
```

## Testing with Postman

### Test OTP Sending
```
POST http://localhost:4000/api/auth/send-otp
Headers: Content-Type: application/json

Body:
{
  "email": "test@example.com"
}

Expected Response:
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### Test OTP Verification
```
POST http://localhost:4000/api/auth/verify-otp
Headers: Content-Type: application/json

Body:
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

Expected Response:
{
  "success": true,
  "message": "Account created successfully!"
}
```

## Common Issues & Solutions

### Issue: Email Not Sending
```javascript
// Check credentials
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***' : 'NOT SET');

// Test connection
const testConnection = () => {
    transporter.verify((error, success) => {
        if (error) console.log('Error:', error);
        if (success) console.log('Server ready');
    });
};
```

### Issue: OTP Not Expiring
```javascript
// Ensure timestamp is set correctly
otpStore.set(email, {
    otp: generateOTP(),
    timestamp: Date.now()  // Use Date.now()
});

// Verify expiration logic
const isExpired = Date.now() - storedData.timestamp > TEN_MINUTES;
```

### Issue: Form Not Submitting
```javascript
// Check all required fields
console.log('Form Data:', formData);
console.log('Errors:', errors);
console.log('Is Loading:', isLoading);

// Verify API endpoint
fetch('/api/auth/send-otp')
    .then(r => console.log('Status:', r.status))
    .catch(e => console.log('Error:', e));
```

## Performance Tips

- Use React.memo for modal components
- Debounce password strength calculation
- Lazy load modals
- Use useCallback for handler functions
- Optimize re-renders with proper state structure
- Cache email validation regex
- Use server-side rate limiting

---

For more detailed information, see the comprehensive documentation files:
- SIGNUP_DOCUMENTATION.md
- SETUP_GUIDE.md
- SIGNUP_FEATURES.md
