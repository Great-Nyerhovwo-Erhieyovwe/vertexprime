# 🚀 Backend Architecture & API Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Layer](#database-layer)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Data Flow Examples](#data-flow-examples)
6. [Code Structure](#code-structure)

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                            │
│  http://localhost:5173                              │
│                                                      │
│  ├─ Login Page         (auth/Login)                 │
│  ├─ Signup Page        (auth/Signup)                │
│  ├─ Dashboard          (pages/dashboard)            │
│  └─ Sidebar            (components/Dashboard)       │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ HTTP Requests with JWT
                       │ (Authorization: Bearer <token>)
                       ▼
┌──────────────────────────────────────────────────────┐
│  Express Backend Server                             │
│  http://localhost:4000/api                          │
│                                                      │
│  Middleware Stack:                                   │
│  ├─ CORS (origin: http://localhost:5173)           │
│  ├─ Helmet (security headers)                       │
│  ├─ Body Parser (JSON/URL-encoded)                  │
│  └─ JWT Authentication                              │
│                                                      │
│  Routes:                                             │
│  ├─ /api/auth/*        (signup, login, OTP)        │
│  ├─ /api/dashboard/*   (profile, portfolio, data)  │
│  └─ /api/admin/*       (admin operations)          │
└──────────────────┬───────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
┌──────────────────┐  ┌─────────────────┐
│  MongoDB Atlas   │  │   db.json       │
│  (Primary)       │  │  (Fallback)     │
│                  │  │                 │
│  - users         │  │ - users         │
│  - transactions  │  │ - transactions  │
│  - notifications │  │ - notifications │
│  - portfolios    │  │ - portfolios    │
└──────────────────┘  └─────────────────┘
```

---

## Database Layer

### Dual Database Strategy

The backend supports **two databases simultaneously** for maximum reliability:

#### **Primary: MongoDB Atlas**
```
Connection String: mongodb+srv://user:password@cluster.mongodb.net/db-name
Status: Used if available and configured
Benefit: Cloud-hosted, scalable, fault-tolerant
```

#### **Fallback: db.json**
```
Location: ./db.json
Status: Used if MongoDB unavailable
Benefit: Works offline, no setup needed
```

### Data Provider Pattern

```javascript
// services/dataProvider.js - Smart data access layer
export const provider = {
  find(collection, filter)      // Gets ALL matching documents
  findOne(collection, filter)   // Gets first matching document
  insertOne(collection, doc)    // Adds new document to both DBs
  updateOne(collection, filter, updates)  // Updates both DBs
  deleteOne(collection, filter)           // Deletes from both DBs
}
```

**How it works:**
1. Try operation on MongoDB first
2. If successful, also sync to db.json
3. If MongoDB fails, fall back to db.json
4. For reads: MongoDB first, then db.json
5. Result: Always have up-to-date data in both places

---

## Authentication Flow

### JWT Token-Based Authentication

```
Step 1: User Submits Credentials
   ┌─────────────────────────────────┐
   │ POST /api/auth/login            │
   │ Body: { email, password }       │
   └─────────────────────────────────┘
                │
                ▼
Step 2: Backend Verifies & Creates Token
   ┌─────────────────────────────────┐
   │ 1. Find user by email           │
   │ 2. Compare password (bcrypt)    │
   │ 3. Generate JWT token           │
   │    - sub: userId                │
   │    - role: userRole             │
   │    - exp: 24h                   │
   └─────────────────────────────────┘
                │
                ▼
Step 3: Return Token to Frontend
   ┌─────────────────────────────────┐
   │ Response:                       │
   │ {                               │
   │   token: "eyJhbGc...",         │
   │   user: {                       │
   │     id, email, role, ...       │
   │   }                             │
   │ }                               │
   └─────────────────────────────────┘
                │
                ▼
Step 4: Frontend Stores Token
   ┌─────────────────────────────────┐
   │ localStorage.setItem(            │
   │   'token',                       │
   │   'eyJhbGc...'                  │
   │ )                               │
   └─────────────────────────────────┘
                │
                ▼
Step 5: Frontend Sends Token with Requests
   ┌─────────────────────────────────┐
   │ GET /api/dashboard/user         │
   │ Headers:                        │
   │   Authorization: Bearer eyJhbGc │
   │   Content-Type: application/json│
   └─────────────────────────────────┘
                │
                ▼
Step 6: Backend Validates Token
   ┌─────────────────────────────────┐
   │ authenticate() middleware:      │
   │ 1. Extract token from header    │
   │ 2. Verify signature (JWT_SECRET)│
   │ 3. Decode to get userId        │
   │ 4. Fetch user from database     │
   │ 5. Set req.user = user          │
   └─────────────────────────────────┘
                │
                ▼
Step 7: Route Handler Gets User Context
   ┌─────────────────────────────────┐
   │ export async function getUser() │
   │ {                               │
   │   // req.user is already set!  │
   │   const user = req.user;       │
   │   return res.json(user);       │
   │ }                               │
   └─────────────────────────────────┘
```

### JWT Token Structure

```javascript
// Header
{
  "alg": "HS256",      // Algorithm (HMAC-SHA256)
  "typ": "JWT"         // Token type
}

// Payload (Decoded)
{
  "sub": "user123",           // Subject (userId)
  "role": "trader",           // User role
  "iat": 1708357089,          // Issued at (timestamp)
  "exp": 1708443489           // Expires at (24h later)
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET_KEY
)
```

---

## API Endpoints

### Authentication Endpoints

#### `POST /api/auth/send-otp`
Send OTP to email for signup verification
```
Request:
{
  "email": "user@example.com"
}

Response (Development):
{
  "success": true,
  "devOtp": "123456"    // Only in development mode
}

Response (Production):
{
  "success": true,
  "message": "OTP sent to email"
}
```

#### `POST /api/auth/verify-otp`
Verify OTP and create user account
```
Request:
{
  "email": "user@example.com",
  "otp": "123456",
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "password": "SecurePass123!",
    "country": "US",
    "currency": "USD",
    "accountType": "trader",
    "dateOfBirth": "1990-01-15"
  }
}

Response:
{
  "success": true,
  "id": "user_id_123"
}
```

#### `POST /api/auth/login`
Login with email and password
```
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "trader"
  }
}
```

#### `GET /api/auth/me`
Get authenticated user info (requires JWT)
```
Request Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "id": "user_id_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "trader",
  "emailVerified": true,
  "balanceUsd": 5000,
  "roi": 12.5
}
```

### Dashboard Endpoints (Requires JWT Authentication)

#### `GET /api/dashboard/user`
Fetch authenticated user's profile
```
Request Headers:
Authorization: Bearer <token>

Response:
{
  "id": "user_id_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "country": "United States",
  "currency": "USD",
  "accountType": "trader",
  "emailVerified": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "role": "trader"
}
```

#### `GET /api/dashboard/portfolio`
Fetch user's portfolio and holdings
```
Response:
{
  "totalBalance": 125430.50,
  "balanceUsd": 125430.50,
  "roi": 18.5,
  "activeTradesCount": 8,
  "activeInvestments": 12,
  "openPositions": [
    {
      "symbol": "BTC",
      "amount": 0.5,
      "value": 21250,
      "entryPrice": 42500,
      "currentPrice": 42500,
      "change": 0
    }
  ]
}
```

#### `GET /api/dashboard/stats`
Fetch dashboard summary statistics
```
Response:
{
  "totalBalance": 125430.50,
  "activeTradesCount": 8,
  "roi": 18.5,
  "activeInvestments": 12,
  "monthlyProfit": 1500,
  "lastTransactionDate": "2024-02-15T10:30:00Z"
}
```

#### `GET /api/dashboard/transactions?limit=50&offset=0`
Fetch user's transaction history
```
Response:
{
  "transactions": [
    {
      "id": "txn123",
      "type": "buy",
      "symbol": "BTC",
      "amount": 0.5,
      "price": 42500,
      "date": "2024-02-15T10:30:00Z",
      "status": "completed"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### `GET /api/dashboard/notifications?unreadOnly=false`
Fetch user's notifications
```
Response:
{
  "notifications": [
    {
      "id": "notif123",
      "type": "success",
      "title": "Trade Executed",
      "message": "Your BTC buy order has been completed",
      "timestamp": "2024-02-15T10:30:00Z",
      "read": false
    }
  ],
  "unreadCount": 3
}
```

#### `PATCH /api/dashboard/notifications/:notificationId/read`
Mark notification as read
```
Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### `PUT /api/dashboard/user/settings`
Update user settings
```
Request:
{
  "currency": "EUR",
  "country": "Germany",
  "accountType": "investor",
  "notifications": {
    "email": true,
    "push": false
  }
}

Response:
{
  "success": true,
  "message": "Settings updated successfully",
  "updates": {
    "currency": "EUR",
    "country": "Germany"
  }
}
```

---

## Data Flow Examples

### Example 1: Complete Signup Flow

```
Frontend (React)                Backend (Express)              Database
─────────────────              ─────────────────              ────────

User fills form
        │
        ├─POST /auth/send-otp────────┐
        │                            │
        │◄─ { devOtp: "123456" } ────┤
        │                            ├─ Check email not registered
        │                            ├─ Generate OTP: 123456
        │                            ├─ Store in otpStore (memory)
        │                            └─ Send email (dev mode returns OTP)
        │
User enters OTP
        │
        ├─POST /auth/verify-otp──────┐
        │                            │
        │◄─ { success: true } ───────┤
        │                            ├─ Verify OTP matches
        │                            ├─ Hash password (bcrypt)
        │                            ├─ Create user document
        │                            ├─ Insert to MongoDB ────────► users collection
        │                            ├─ Also insert to db.json ──► db.json
        │                            └─ Delete OTP from otpStore
        │
User redirected to login
        │
        ├─POST /auth/login──────────┐
        │                            │
        │◄─ { token: "jwt..." } ────┤
        │                            ├─ Find user by email
        │                            ├─ Compare password (bcrypt)
        │                            ├─ Generate JWT token ─────┐
        │                            │                          │ Valid for 24 hours
        │                            │                   sub=userId
        │                            │                   role=trader
        │                            └─ Return token
        │
Token stored locally
        │
        └─GET /api/dashboard/user──┐ Authorization: Bearer jwt
                                   │
                        ┌──────────┤
                        │ Middleware:
                        ├─ Extract token
                        ├─ Verify signature
                        ├─ Decode JWT
                        ├─ Fetch user from DB ─────┐
                        │                          │
                        │                          ├─ MongoDB first
                        │                          ├─ If fails → db.json
                        │                          └─ User document
                        │
                        └─ Return user profile ───────► Frontend
```

### Example 2: Dashboard Data Fetch

```
Frontend useDashboard Hook    Backend APIs              Database
────────────────────────────  ─────────────────────     ────────

Component mounts
        │
        ├─ Get token from localStorage
        │
        ├─ Parallel fetch (Promise.all):
        │
        ├─ GET /dashboard/user ───────┐
        │                             │ authenticate() middleware
        │                             ├─ Validate JWT
        │◄─ User profile ────────────┤├─ Fetch user ────────► MongoDB
        │                             └─ Return user
        │
        ├─ GET /dashboard/portfolio ──┐
        │                             │ authenticate() middleware
        │                             ├─ Fetch user + holdings
        │◄─ Portfolio data ──────────┤└─ Calculate totals
        │                             │
        │
        ├─ GET /dashboard/stats ─────┐
        │                             │ authenticate() middleware
        │                             ├─ Fetch user metrics
        │◄─ Dashboard stats ────────┤└─ Calculate stats
        │                             │
        │
        └─ All data received
```

---

## Code Structure

### Backend Directory Structure

```
server/
├── index.js                  # Main Express server setup
│
├── controllers/              # Business logic
│   ├── authController.js     # Login, signup, OTP
│   └── dashboardController.js # User profile, portfolio, data
│
├── routes/                   # API route definitions
│   ├── index.js             # Route aggregator
│   ├── auth.js              # /api/auth routes
│   ├── dashboard.js         # /api/dashboard routes
│   └── admin.js             # /api/admin routes
│
├── middlewares/              # Request processing
│   ├── authenticate.js      # JWT validation
│   └── requireAdmin.js      # Admin role check
│
├── services/                 # Data access layer
│   └── dataProvider.js      # MongoDB + db.json provider
│
└── utils/                    # Helper functions
    ├── db.js                # MongoDB connection
    └── localDb.js           # db.json operations
```

### Control Flow

```
Request arrives
        │
        ├─ CORS middleware
        │
        ├─ Body parser middleware
        │
        ├─ Route matching
        │
        ├─ Authenticate middleware (if protected route)
        │   └─ Validates JWT token
        │   └─ Sets req.user
        │
        ├─ Route handler (controller function)
        │   ├─ Check req.user is set
        │   ├─ Query database via provider
        │   ├─ Process data
        │   └─ Return response
        │
        └─ Send JSON response to client
```

---

## Environment Variables

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database - MongoDB Atlas
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME=vertexprime

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# Frontend URL (for CORS)
FRONTEND_ORIGIN=http://localhost:5173

# Email (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@vertexprime.com
```

---

## Testing Endpoints

### Using curl

```bash
# Send OTP
curl -X POST http://localhost:4000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Verify OTP
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "otp":"123456",
    "userData":{"firstName":"John",...}
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Get user (with token)
curl -X GET http://localhost:4000/api/dashboard/user \
  -H "Authorization: Bearer eyJhbGc..."
```

### Using Node test file

```bash
node test-full-signup.js
```

---

**Last Updated:** February 19, 2026  
**Status:** ✅ Production Ready
