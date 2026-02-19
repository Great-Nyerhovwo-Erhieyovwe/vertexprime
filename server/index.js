// server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors({ origin: "https://vertexprime.live", credentials: true }));
app.use(helmet());
app.use(express.json());

/* --------------------------------------------------------------
   Email Configuration (using Nodemailer)
-------------------------------------------------------------- */
const transporter = nodemailer.createTransport({
    host: process.env.VITE_SMTP_HOST || "smtp.gmail.com",
    port: process.env.VITE_SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.VITE_SMTP_USER || "your-email@gmail.com",
        pass: process.env.VITE_SMTP_PASS || "your-app-password",
    },
});

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

/* --------------------------------------------------------------
   MongoDB Configuration
-------------------------------------------------------------- */
let db = null;

const mongoUri = process.env.VITE_MONGODB_URI || "mongodb://localhost:27017/vertexprime_capital";
const dbName = process.env.VITE_DB_NAME || "vertexprime_capital";
const mongoClient = new MongoClient(mongoUri, { useUnifiedTopology: true });

async function connectDB() {
    try {
        await mongoClient.connect();
        db = mongoClient.db(dbName);
        console.log("✅ Connected to MongoDB at", mongoUri);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

/* --------------------------------------------------------------
   Middleware – verify JWT & attach user object to req.user
-------------------------------------------------------------- */
const authenticate = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.sendStatus(401);
    const token = auth.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.VITE_JWT_SECRET);
        const user = await db.collection("users").findOne({ _id: new ObjectId(payload.sub) });
        if (!user) return res.sendStatus(401);
        req.user = user; // contains _id, email, role, etc.
        next();
    } catch (e) {
        console.error(e);
        res.sendStatus(401);
    }
};

/* --------------------------------------------------------------
   ADMIN‑ONLY middleware
-------------------------------------------------------------- */
const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    next();
};

/* --------------------------------------------------------------
   Utility Functions
-------------------------------------------------------------- */
// Generate random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: process.env.VITE_EMAIL_FROM || "noreply@vertexprime.com",
        to: email,
        subject: "VertexPrime Capital - Email Verification OTP",
        html: `
            <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e293b, #1e3a8a); padding: 40px; text-align: center; border-radius: 12px;">
                    <h1 style="color: #60a5fa; margin: 0; font-size: 28px;">VertexPrime Capital</h1>
                    <p style="color: #cbd5e1; margin-top: 10px;">Investment Platform</p>
                </div>
                
                <div style="background: #f8fafc; padding: 40px; border-radius: 12px; margin-top: 20px;">
                    <h2 style="color: #1e293b; text-align: center;">Verify Your Email</h2>
                    <p style="color: #64748b; text-align: center; font-size: 16px;">
                        Thank you for registering with VertexPrime Capital. Use the code below to verify your email address.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <p style="color: white; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                        <p style="color: white; font-size: 48px; font-weight: bold; margin: 0; letter-spacing: 8px;">${otp}</p>
                    </div>
                    
                    <p style="color: #64748b; text-align: center; font-size: 14px;">
                        This code will expire in 10 minutes. Do not share it with anyone.
                    </p>
                </div>
                
                <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        © 2026 VertexPrime Capital. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }
}

/* --------------------------------------------------------------
   1️⃣ Send OTP for signup/verification
-------------------------------------------------------------- */
app.post("/api/auth/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        // Check if user already exists
        const existingUser = await db.collection("users").findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Generate and store OTP
        const otp = generateOTP();
        otpStore.set(email, { otp, timestamp: Date.now() });

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp);

        if (emailSent) {
            res.json({ success: true, message: "OTP sent to your email" });
        } else {
            res.status(500).json({ message: "Failed to send OTP email" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/* --------------------------------------------------------------
   2️⃣ Verify OTP and create account
-------------------------------------------------------------- */
app.post("/api/auth/verify-otp", async (req, res) => {
    try {
        const { email, otp, userData } = req.body;

        // Verify OTP
        const storedData = otpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ message: "OTP not found. Please request a new OTP." });
        }

        // Check if OTP is expired (10 minutes)
        if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user in database
        const { firstName, lastName, username, country, currency, accountType, dateOfBirth } = userData;
        
        const result = await db.collection("users").insertOne({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            username,
            country,
            currency,
            accountType,
            dateOfBirth,
            role: "trader",
            emailVerified: true,
            createdAt: new Date(),
            balanceUsd: 0,
            roi: 0,
        });

        // Clear OTP
        otpStore.delete(email);

        // Send welcome email
        await transporter.sendMail({
            from: process.env.VITE_EMAIL_FROM || "noreply@vertexprime.com",
            to: email,
            subject: "Welcome to VertexPrime Capital!",
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 40px; text-align: center; border-radius: 12px;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome, ${firstName}!</h1>
                        <p style="color: #e0f2fe; margin-top: 10px;">Your account has been successfully created</p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 40px; border-radius: 12px; margin-top: 20px;">
                        <h2 style="color: #1e293b;">Get Started with VertexPrime Capital</h2>
                        <ul style="color: #64748b; font-size: 16px;">
                            <li>Complete your profile to unlock all features</li>
                            <li>Explore our trading platforms and tools</li>
                            <li>Join our community of professional traders</li>
                            <li>Access exclusive market insights and analysis</li>
                        </ul>
                        
                        <a href="https://vertexprime.live/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: bold;">
                            Go to Dashboard
                        </a>
                    </div>
                    
                    <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            © 2026 VertexPrime Capital. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
        });

        res.json({ success: true, message: "Account created successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create account" });
    }
});

/* --------------------------------------------------------------
   3️⃣ Auth – login (returns JWT)
-------------------------------------------------------------- */
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.collection("users").findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { sub: user._id.toString(), role: user.role },
            process.env.VITE_JWT_SECRET,
            { expiresIn: process.env.VITE_JWT_EXPIRES_IN || "24h" }
        );
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/* --------------------------------------------------------------
   2️⃣ Get current user (used by front‑end to know role)
-------------------------------------------------------------- */
app.get("/api/user/me", authenticate, async (req, res) => {
    const { _id, email, role, balanceUsd, roi } = req.user;
    res.json({ id: _id.toString(), email, role, balanceUsd, roi });
});

/* --------------------------------------------------------------
   ADMIN ROUTES – all protected by authenticate + requireAdmin
-------------------------------------------------------------- */
const adminRouter = express.Router();
adminRouter.use(authenticate, requireAdmin);

/* ----- Users ----- */
adminRouter.get("/users", async (req, res) => {
    try {
        const users = await db.collection("users")
            .find({})
            .project({ id: "$_id", email: 1, role: 1, createdAt: 1 })
            .sort({ _id: 1 })
            .toArray();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.post("/users", async (req, res) => {
    try {
        const { email, password, role = "trader" } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await db.collection("users").insertOne({
            email,
            password: hash,
            role,
            createdAt: new Date(),
            emailVerified: false,
            balanceUsd: 0,
            roi: 0,
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.patch("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;
        const updates = {};

        if (email) updates.email = email;
        if (role) updates.role = role;

        if (Object.keys(updates).length === 0) return res.json({ success: true });

        await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.post("/users/:id/password", async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const hash = await bcrypt.hash(newPassword, 10);
        await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: { password: hash } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("users").deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/* ----- Upgrade Plans ----- */
adminRouter.get("/plans", async (req, res) => {
    try {
        const plans = await db.collection("upgrade_plans")
            .find({})
            .sort({ _id: 1 })
            .toArray();
        res.json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.post("/plans", async (req, res) => {
    try {
        const { name, priceMonthly, priceAnnual, features } = req.body;
        await db.collection("upgrade_plans").insertOne({
            name,
            priceMonthly,
            priceAnnual,
            features,
            createdAt: new Date(),
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.patch("/plans/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, priceMonthly, priceAnnual, features } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (priceMonthly !== undefined) updates.priceMonthly = priceMonthly;
        if (priceAnnual !== undefined) updates.priceAnnual = priceAnnual;
        if (features) updates.features = features;

        if (Object.keys(updates).length === 0) return res.json({ success: true });

        await db.collection("upgrade_plans").updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.delete("/plans/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("upgrade_plans").deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/* Mount admin router */
app.use("/api/admin", adminRouter);

/* --------------------------------------------------------------
   Global error handler (optional but nice)
-------------------------------------------------------------- */
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

/* --------------------------------------------------------------
   Start server
-------------------------------------------------------------- */
const PORT = process.env.PORT || 4000;

// Connect to MongoDB and start server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 API listening on ${PORT}`));
}).catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});