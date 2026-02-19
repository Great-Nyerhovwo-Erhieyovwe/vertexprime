#!/usr/bin/env node

/**
 * Quick Test: Auth Flow (OTP → Signup → Login → Dashboard)
 */

const API_BASE = 'http://localhost:4000/api';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

let generatedOtp = null;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            console.log(`   Email: ${TEST_EMAIL}`);
            if (data.devOtp) {
                generatedOtp = data.devOtp;
                console.log(`   [DEV] OTP: ${generatedOtp}`);
            }
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
    console.log('\n🔐 TEST 2: Verify OTP & Create Account');
    
    if (!generatedOtp) {
        console.log('❌ No OTP available from previous test');
        return false;
    }

    try {
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            username: `testuser_${Date.now()}`,
            country: 'US',
            currency: 'USD',
            accountType: 'trader',
            password: TEST_PASSWORD,
            dateOfBirth: '1990-01-01'
        };

        const res = await fetch(`${API_BASE}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                otp: generatedOtp,
                userData
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log('✅ OTP verified and account created');
            console.log(`   User ID: ${data.id}`);
            return true;
        } else {
            console.log('❌ Verification failed:', data.message);
            return false;
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
        return false;
    }
}

async function testLogin() {
    console.log('\n🔑 TEST 3: Login');
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });

        const data = await res.json();
        if (res.ok && data.token) {
            console.log('✅ Login successful');
            console.log(`   Token: ${data.token.substring(0, 20)}...`);
            console.log(`   User: ${data.user.email}`);
            return data.token;
        } else {
            console.log('❌ Login failed:', data.message);
            return null;
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
        return null;
    }
}

async function testMeEndpoint(token) {
    console.log('\n👤 TEST 4: Get Current User (/me)');
    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (res.ok) {
            console.log('✅ User info retrieved');
            console.log(`   ID: ${data.id}`);
            console.log(`   Email: ${data.email}`);
            console.log(`   Role: ${data.role}`);
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

async function runTests() {
    console.log('🚀 Starting Auth Flow Tests');
    console.log('============================');

    // Test 1: Send OTP
    const otpSent = await testSendOtp();
    if (!otpSent) {
        console.log('\n⚠️  Cannot proceed without OTP');
        return;
    }

    // Test 2: Verify OTP (will need manual OTP input in real scenario)
    const otpVerified = await testVerifyOtp();
    
    // Test 3: Login
    const token = await testLogin();
    if (!token) {
        console.log('\n⚠️  Cannot proceed without valid login');
        return;
    }

    // Test 4: Get User Info
    await testMeEndpoint(token);

    console.log('\n============================');
    console.log('✅ All tests completed!');
}

// Run tests
runTests().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
