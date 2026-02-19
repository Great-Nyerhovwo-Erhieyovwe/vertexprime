import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { provider } from "../services/dataProvider.js";

// Simple in-memory OTP store (replace with Redis in production)
const otpStore = new Map();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.VITE_SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || process.env.VITE_SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.VITE_SMTP_PASS,
    }
});

function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);
    return otp;
}

async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.VITE_EMAIL_FROM || 'noreply@vertexprime.com',
        to: email,
        subject: 'VertexPrime Capital - Verification Code',
        text: `Your verification code is: ${otp}`,
    };
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error('Failed to send email', e.message || e);
        return false;
    }
}

export async function sendOtp(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Missing email' });
        const existing = await provider.findOne('users', { email });
        if (existing) return res.status(400).json({ message: 'Email already registered' });
        const otp = generateOTP();
        console.log(`Generated OTP for ${email}: ${otp}`); // local dev only
        otpStore.set(email, { otp, ts: Date.now() });
        
        // In development mode, allow proceeding without actually sending email
        if (process.env.NODE_ENV === 'development' || process.env.VITE_APP_ENV === 'development') {
            console.log(`📧 [DEV MODE] OTP would be sent to ${email}: ${otp}`);
            return res.json({ success: true, devOtp: otp }); // Include OTP for testing
        }
        
        const sent = await sendOTPEmail(email, otp);
        if (!sent) return res.status(500).json({ message: 'Failed to send OTP' });
        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function verifyOtp(req, res) {
    try {
        const { email, otp, userData } = req.body;
        if (!email || !otp || !userData) return res.status(400).json({ message: 'Missing params' });
        const stored = otpStore.get(email);
        if (!stored) return res.status(400).json({ message: 'OTP not found' });
        if (Date.now() - stored.ts > 10 * 60 * 1000) { otpStore.delete(email); return res.status(400).json({ message: 'OTP expired' }); }
        if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        const hashed = await bcrypt.hash(userData.password, 10);
        const user = {
            email,
            password: hashed,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            country: userData.country || '',
            currency: userData.currency || 'USD',
            accountType: userData.accountType || 'trader',
            dateOfBirth: userData.dateOfBirth || null,
            role: 'trader',
            emailVerified: true,
            createdAt: new Date(),
            balanceUsd: 0,
            roi: 0,
        };
        const result = await provider.insertOne('users', user);
        otpStore.delete(email);
        return res.json({ success: true, id: result.insertedId || (result.ops && result.ops[0] && result.ops[0]._id) });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
        const user = await provider.findOne('users', { email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
        
        // Generate JWT token for frontend
        const jwt = await import('jsonwebtoken').then(m => m.default);
        const token = jwt.sign(
            { sub: (user._id || user.id)?.toString() || user.email, role: user.role },
            process.env.JWT_SECRET || process.env.VITE_JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || process.env.VITE_JWT_EXPIRES_IN || '24h' }
        );
        
        return res.json({ 
            success: true, 
            token,
            user: { 
                id: (user._id || user.id)?.toString(), 
                email: user.email, 
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            } 
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function me(req, res) {
    if (!req.user) return res.sendStatus(401);
    const { _id, id, email, role, balanceUsd, roi, firstName, lastName } = req.user;
    return res.json({ id: (_id || id)?.toString(), email, role, balanceUsd, roi, firstName, lastName });
}

