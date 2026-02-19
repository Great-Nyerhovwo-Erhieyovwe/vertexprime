# API Documentation - Signup & Authentication

## Base URL
```
http://localhost:4000
https://api.vertexprime.live (Production)
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Signup Endpoints

### 1. Send OTP Email

Generates a 6-digit OTP and sends it to the user's email address.

**Endpoint:** `POST /api/auth/send-otp`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Error Responses:**

- **400 - Invalid Email:**
```json
{
  "message": "Invalid email address"
}
```

- **400 - Email Already Registered:**
```json
{
  "message": "Email already registered"
}
```

- **500 - Email Service Error:**
```json
{
  "message": "Failed to send OTP email"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:4000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

---

### 2. Verify OTP & Create Account

Verifies the OTP and creates a new user account.

**Endpoint:** `POST /api/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
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

**Request Body Properties:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| otp | string | Yes | 6-digit OTP code |
| userData.firstName | string | Yes | User's first name |
| userData.lastName | string | Yes | User's last name |
| userData.username | string | Yes | Unique username (3+ chars) |
| userData.country | string | Yes | Country of residence |
| userData.currency | string | Yes | Preferred currency |
| userData.accountType | string | Yes | Account type (individual/corporate/partnership) |
| userData.dateOfBirth | string | Yes | Date of birth (YYYY-MM-DD) |
| userData.password | string | Yes | Password (8+ chars, mixed case, number, special) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account created successfully!"
}
```

**Error Responses:**

- **400 - OTP Not Found:**
```json
{
  "message": "OTP not found. Please request a new OTP."
}
```

- **400 - OTP Expired:**
```json
{
  "message": "OTP has expired. Please request a new OTP."
}
```

- **400 - Invalid OTP:**
```json
{
  "message": "Invalid OTP. Please try again."
}
```

- **500 - Account Creation Failed:**
```json
{
  "message": "Failed to create account"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
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
  }'
```

**Email Verification Success:**
- OTP is deleted from storage
- User account is created with all provided information
- Email verification status set to `true`
- Welcome email is sent to the user
- Password is hashed using bcryptjs

---

## Login Endpoint (Existing)

### Login

Authenticates user and returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- **401 - Invalid Credentials:**
```json
{
  "message": "Invalid credentials"
}
```

---

## User Endpoints (Authenticated)

### Get Current User

Retrieves the current authenticated user's information.

**Endpoint:** `GET /api/user/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "trader",
  "balanceUsd": 10000,
  "roi": 5.25
}
```

**Error Responses:**

- **401 - Unauthorized:**
```json
(Empty response with 401 status)
```

---

## Validation Rules

### Email Validation
- Must be a valid email format
- Must not be already registered
- Case-insensitive storage

### OTP Validation
- Must be exactly 6 digits
- Must match the stored OTP for the email
- Must not be expired (10-minute window)

### Username Validation
- Minimum 3 characters
- Maximum 100 characters
- Must be unique
- Allowed characters: alphanumeric, underscore, hyphen

### Password Validation
- Minimum 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Must contain at least one special character

### Age Validation
- User must be at least 18 years old
- Date of birth must be valid
- Calculated based on current date

### Account Type Validation
- Must be one of: "individual", "corporate", "partnership"

### Country Validation
- Must be selected from provided list
- Supported countries: US, UK, Canada, Australia, India, Germany, France, Singapore, Dubai, Other

### Currency Validation
- Must be selected from provided list
- Supported currencies: USD, EUR, GBP, AUD, INR, SGD, AED, CAD

---

## Response Status Codes

| Status | Meaning | Description |
|--------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Access denied |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

**Recommended for Production:**
- 5 OTP requests per email per hour
- 10 login attempts per email per hour
- 100 requests per IP per hour

---

## OTP Specifications

### Generation
- Random 6-digit number
- Range: 100000 - 999999
- Generated using: `Math.floor(Math.random() * 900000) + 100000`

### Storage
- **Development:** In-memory Map (cleared on server restart)
- **Production:** Redis with key expiration

### Expiration
- 10 minutes (600 seconds)
- Checked on verification
- Automatically deleted on successful verification or expiration

### Email Format
- HTML template with professional design
- Includes OTP in large, readable format
- Includes expiration notice
- Branded with VertexPrime Capital logo

---

## Email Templates

### OTP Email Template

**Subject:** VertexPrime Capital - Email Verification OTP

**From:** noreply@vertexprime.com

**Components:**
1. Branded header with logo
2. Welcome message
3. 6-digit OTP code (large, bold)
4. Expiration notice (10 minutes)
5. Security warning
6. Company footer

### Welcome Email Template

**Subject:** Welcome to VertexPrime Capital!

**From:** noreply@vertexprime.com

**Components:**
1. Personalized greeting with user's first name
2. Account creation confirmation
3. Getting started steps
4. Links to dashboard and resources
5. Company footer with copyright

---

## Security Considerations

### Password Security
- Hashed using bcryptjs with 10 salt rounds
- Never stored in plain text
- Never returned in API responses

### OTP Security
- Random generation (not sequential)
- One-time use (deleted after verification)
- Time-limited (10 minutes)
- Email verification only (not SMS)
- Server-side validation

### Email Verification
- Required for account activation
- Prevents fake email registrations
- OTP sent to provided email
- Email must be verified before login

### API Security
- HTTPS/TLS in production
- CORS enabled for authorized origins
- Helmet.js security headers
- Input validation and sanitization
- Error message sanitization (no sensitive data)

---

## Error Handling

All errors return JSON with a message field:

```json
{
  "message": "Error description"
}
```

**Common Errors:**
- Invalid email format
- Email already registered
- OTP not found
- OTP expired
- Invalid OTP
- Password too weak
- Username too short
- Account creation failed
- Email sending failed

---

## Integration Example

### Frontend (React/TypeScript)

```typescript
// Send OTP
async function sendOTP(email: string) {
  const response = await fetch('http://localhost:4000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
}

// Verify OTP
async function verifyOTP(email: string, otp: string, userData: any) {
  const response = await fetch('http://localhost:4000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, userData })
  });
  return response.json();
}

// Login
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

// Get current user
async function getUser(token: string) {
  const response = await fetch('http://localhost:4000/api/user/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

---

## Database Schema

### users Table

```sql
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
```

---

## Postman Collection

### Setup
1. Create new collection: "VertexPrime Auth"
2. Create new environment with variables:
   - `base_url`: http://localhost:4000
   - `email`: test@example.com
   - `otp`: (obtained from email)
   - `token`: (obtained from login)

### Requests

**1. Send OTP**
```
POST {{base_url}}/api/auth/send-otp
Body: { "email": "{{email}}" }
```

**2. Verify OTP**
```
POST {{base_url}}/api/auth/verify-otp
Body: {
  "email": "{{email}}",
  "otp": "{{otp}}",
  "userData": { ... }
}
```

**3. Login**
```
POST {{base_url}}/api/auth/login
Body: { "email": "{{email}}", "password": "..." }
```

**4. Get User**
```
GET {{base_url}}/api/user/me
Header: Authorization: Bearer {{token}}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 2026 | Initial release with OTP signup |

---

## Support

For API issues or questions:
1. Check error messages in response
2. Review validation rules
3. Check server logs for errors
4. See SETUP_GUIDE.md for troubleshooting
5. Review CODE_SNIPPETS.md for examples

---

**Last Updated:** February 2026  
**Status:** Production Ready ✅
