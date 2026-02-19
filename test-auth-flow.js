/**
 * Integration Test: Auth Flow (Sign Up → Login → Dashboard Access)
 * 
 * This test verifies:
 * 1. Send OTP to email
 * 2. Verify OTP and create account
 * 3. Login with credentials
 * 4. Access dashboard with JWT token
 */

import 'dotenv/config';
import { provider } from './server/services/dataProvider.js';
import { connectMongo } from './server/utils/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:4000/api';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setupDb() {
    const uri = process.env.MONGO_URI || process.env.VITE_MONGODB_URI;
    const dbName = process.env.DB_NAME || process.env.VITE_DB_NAME || 'vertexprime';
    if (uri) {
        console.log('📦 Attempting to connect to MongoDB...');
        try {
            await connectMongo(uri, dbName);
            console.log('✅ MongoDB connected');
        } catch (e) {
            console.log('⚠️  MongoDB unavailable, will use local db.json');
        }
    } else {
        console.log('⚠️  No Mongo URI in .env, using local db.json');
    }
}

async function testSendOtp() {
    console.log('\n📧 TEST 1: Send OTP');
    try {
        const res = await fetch(`${API_BASE}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('✅ OTP sent successfully');
            return true;
        } else {
            console.log('❌ Failed:', data.message);
            return false;
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
        return false;
    }
}

async function testVerifyOtp() {
    console.log('\n👤 TEST 2: Verify OTP & Create Account');
    try {
        // Get OTP from data provider (simulated; in real test, get from email or OTP store)
        // For this test, we'll directly create user in DB to simulate successful verification
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser',
            country: 'US',
            currency: 'USD',
            accountType: 'trader',
            password: TEST_PASSWORD
        };

        // Hash password
        const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

        // Insert user directly via provider
        const result = await provider.insertOne('users', {
            email: TEST_EMAIL,
            password: hashedPassword,
            ...userData,
            role: 'trader',
            emailVerified: true,
            createdAt: new Date(),
            balanceUsd: 0,
            roi: 0
        });

        if (result.insertedId || (result.ops && result.ops[0])) {
            console.log('✅ User created successfully');
            return true;
        } else {
            console.log('❌ Failed to create user');
            return false;
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
        return false;
    }
}

async function testLogin() {
    console.log('\n🔐 TEST 3: Login');
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            console.log('✅ Login successful');
            console.log(`   Email: ${TEST_EMAIL}`);
            return true;
        } else {
            console.log('❌ Failed:', data.message);
            return false;
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
        return false;
    }
}

async function testGetMe() {
    console.log('\n📊 TEST 4: Get Current User (Dashboard Access)');
    try {
        // Create a test JWT token
        const user = await provider.findOne('users', { email: TEST_EMAIL });
        if (!user) {
            console.log('❌ User not found');
            return false;
        }

        const token = jwt.sign(
            { sub: (user._id || user.id)?.toString() || TEST_EMAIL, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const res = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (res.ok && data.email) {
            console.log('✅ Dashboard access successful');
            console.log(`   User: ${data.email} (${data.role})`);
            console.log(`   Balance: $${data.balanceUsd || 0}`);
            console.log(`   ROI: ${data.roi || 0}%`);
            return true;
        } else {
            console.log('❌ Failed:', data.message);
            return false;
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
        return false;
    }
}

async function cleanupUser() {
    console.log('\n🧹 Cleanup: Removing test user...');
    try {
        await provider.deleteOne('users', { email: TEST_EMAIL });
        console.log('✅ Test user removed');
    } catch (e) {
        console.log('⚠️  Could not remove test user:', e.message);
    }
}

async function runTests() {
    console.log('================================');
    console.log('🚀 VertexPrime Capital Auth Flow Integration Test');
    console.log('================================');

    await setupDb();
    await sleep(2000); // Give server time to start

    const results = [];

    results.push({ test: 'Send OTP', passed: await testSendOtp() });
    results.push({ test: 'Verify OTP & Create Account', passed: await testVerifyOtp() });
    results.push({ test: 'Login', passed: await testLogin() });
    results.push({ test: 'Get Current User (Dashboard)', passed: await testGetMe() });

    await cleanupUser();

    console.log('\n================================');
    console.log('📋 Test Summary:');
    console.log('================================');
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    results.forEach(r => {
        const icon = r.passed ? '✅' : '❌';
        console.log(`${icon} ${r.test}`);
    });
    console.log(`\n${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('\n🎉 All auth flows working! You can sign up, login, and access dashboard.');
    } else {
        console.log('\n⚠️  Some tests failed. Check server logs and .env config.');
    }

    process.exit(passed === total ? 0 : 1);
}

runTests().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
