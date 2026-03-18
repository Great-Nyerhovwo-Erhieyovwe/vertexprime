/**
 * VertexPrime Capital - Backend Server
 * ====================================
 * 
 * Main Express server setup with:
 * - MongoDB connection (primary)
 * - Local db.json fallback (secondary)
 * - CORS and security middleware
 * - API route management
 * 
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────┐
 * │  Frontend (React + Vite) - http://localhost:5173 │
 * └─────────────────┬───────────────────────────────┘
 *                   │ HTTP Requests (JWT auth)
 *                   ▼
 * ┌─────────────────────────────────────────────────┐
 * │  Express Server - http://localhost:4000         │
 * │  ├─ CORS middleware (cross-origin)              │
 * │  ├─ JSON body parser                            │
 * │  └─ API routes (/api/auth, /api/dashboard)      │
 * └─────────────────┬───────────────────────────────┘
 *                   │
 *                   ├──► MongoDB Atlas (Primary DB)
 *                   └──► db.json (Fallback DB)
 */

// ============================================
// IMPORTS
// ============================================
import 'dotenv/config';                    // Load environment variables from .env
import express from 'express';              // Web framework
import cors from 'cors';                    // Cross-Origin Resource Sharing
import helmet from 'helmet';                // Security headers
import routes from './routes/index.js';     // API routes
import { connectMongo, getDb } from './utils/db.js'; // MongoDB utilities
import { provider } from './services/dataProvider.js'; // Data provider (MongoDB/JSON)
import jwt from 'jsonwebtoken';             // JWT token handling (optional, for reference)
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ============================================
// INITIALIZE EXPRESS APP
// ============================================
const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// CORS CONFIGURATION
// ============================================
// Determines which frontend URLs can make requests to this backend
// Essential for cross-origin requests from React frontend
const FRONTEND_ORIGIN = 
    process.env.FRONTEND_ORIGIN || 
    process.env.VITE_FRONTEND_ORIGIN || 
    'http://localhost:5173', 'vertexprime.onrender.com';

// Configure CORS to allow requests from frontend
// credentials: true allows cookies to be sent with requests
app.use(cors({ 
    origin: FRONTEND_ORIGIN, 
    credentials: true 
}));

// ============================================
// SECURITY & MIDDLEWARE
// ============================================
// Helmet sets security headers (prevents XSS, clickjacking, etc.)
app.use(helmet());

// Parse JSON request bodies (e.g., POST /login with { email, password })
app.use(express.json());

// Parse URL-encoded request bodies (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// ============================================
// API ROUTES
// ============================================
// Mount all API routes under /api prefix
// Routes structure:
//   /api/auth/*           - Authentication (login, signup, OTP)
//   /api/admin/*          - Admin operations
//   /api/dashboard/*      - User dashboard (requires JWT auth)
app.use('/api', routes);

// app.use('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// })

// ===========================================
// Build setup for ES Modules
// ===========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// SERVE FRONTEND (React build in /dist)
// ============================================

// 1. Serve static files (JS, CSS, images)
app.use(express.static(path.join(__dirname, 'dist')));

// 2. SPA fallback (VERY IMPORTANT FIX)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================
// GLOBAL ERROR HANDLER (MUST BE LAST)
// ============================================
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});


// ============================================
// DATABASE CONNECTION & SERVER STARTUP
// ============================================
/**
 * Startup sequence:
 * 1. Read MONGO_URI from environment variables
 * 2. Attempt to connect to MongoDB Atlas
 * 3. If successful, use MongoDB as primary database
 * 4. If failed, fall back to local db.json file
 * 5. Start Express server on specified PORT
 */
async function start() {
    // Read MongoDB connection URI from environment
    const uri = process.env.MONGO_URI || process.env.VITE_MONGODB_URI;
    const dbName = process.env.DB_NAME || process.env.VITE_DB_NAME || 'vertexprime';
    
    // ============================================
    // Attempt MongoDB Connection
    // ============================================
    if (uri) {
        // MongoDB credentials are in the URI:
        // mongodb+srv://username:password@cluster.mongodb.net/
        // Add a timeout to prevent hanging
        const mongoPromise = connectMongo(uri, dbName);
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 5000));
        const db = await Promise.race([mongoPromise, timeoutPromise]);
        
        if (db) {
            // ✅ MongoDB connected successfully
            console.log('✅ Connected to MongoDB');
            console.log('🔒 Primary data store: MongoDB Atlas');
        } else {
            // ❌ MongoDB connection failed
            console.log('⚠️  MongoDB unavailable — falling back to local JSON db.json');
            console.log('📁 Fallback data store: db.json file');
        }
    } else {
        // No MongoDB URI configured
        console.log('⚠️  No MongoDB URI provided in .env');
        console.log('📁 Using fallback data store: db.json file');
    }


    // ============================================
    // Start Express Server
    // ============================================
    app.listen(PORT, () => {
        console.log(`🚀 API listening on http://localhost:${PORT}`);
        console.log(`📱 Frontend URL: ${FRONTEND_ORIGIN}`);
        console.log('\n✨ Server ready for requests!\n');
    });
}

// ============================================
// ERROR HANDLING FOR STARTUP
// ============================================
start().catch((e) => {
    console.error('❌ Failed to start server:', e);
    process.exit(1); // Exit with error code
});
