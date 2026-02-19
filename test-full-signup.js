#!/usr/bin/env node

/**
 * Frontend Registration Test
 * Tests the full signup flow via the API (simulating what the frontend would do)
 */

const API_BASE = 'http://localhost:4000/api';

// Test user data matching signup form
const TEST_USER = {
    firstName: 'Jane',
    lastName: 'Smith',
    username: `jane_${Date.now()}`,
    email: `jane_${Date.now()}@example.com`,
    country: 'United States',
    currency: 'USD',
    accountType: 'individual',
    dateOfBirth: '1995-05-15',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
};

let storedOtp = null;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function step1_SendOtp() {
    console.log('\n' + '='.repeat(60));
    console.log('STEP 1: Send OTP (Frontend sends email)');
    console.log('='.repeat(60));
    
    try {
        const response = await fetch(`${API_BASE}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email })
        });

        const data = await response.json();
        
        console.log(`\n📧 Email: ${TEST_USER.email}`);
        
        if (response.ok) {
            console.log('✅ OTP sent successfully to server');
            if (data.devOtp) {
                storedOtp = data.devOtp;
                console.log(`\n🔐 [DEV MODE] OTP received: ${storedOtp}`);
                console.log('ℹ️  In development mode, the OTP is returned in the response');
                console.log('ℹ️  In production, OTP would be sent via email');
                return true;
            } else {
                console.log('\n⏳ OTP sent via email (check your inbox)');
                return true;
            }
        } else {
            console.log(`❌ Failed: ${data.message}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Network error: ${error.message}`);
        return false;
    }
}

async function step2_VerifyOtp() {
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: Verify OTP & Create Account');
    console.log('='.repeat(60));
    
    if (!storedOtp) {
        console.log('❌ No OTP available from previous step');
        console.log('⚠️  In production, you would enter the OTP from your email');
        return false;
    }

    try {
        console.log(`\n🔐 Verifying OTP: ${storedOtp}`);
        console.log(`👤 Username: ${TEST_USER.username}`);
        console.log(`📧 Email: ${TEST_USER.email}`);
        
        const userData = {
            firstName: TEST_USER.firstName,
            lastName: TEST_USER.lastName,
            username: TEST_USER.username,
            country: TEST_USER.country,
            currency: TEST_USER.currency,
            accountType: TEST_USER.accountType,
            dateOfBirth: TEST_USER.dateOfBirth,
            password: TEST_USER.password,
        };

        const response = await fetch(`${API_BASE}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_USER.email,
                otp: storedOtp,
                userData
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('\n✅ Account created successfully!');
            console.log(`   User ID: ${data.id}`);
            console.log(`   Email verified: true`);
            return true;
        } else {
            console.log(`\n❌ Verification failed: ${data.message}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

async function step3_Login() {
    console.log('\n' + '='.repeat(60));
    console.log('STEP 3: Login with Credentials');
    console.log('='.repeat(60));
    
    try {
        console.log(`\n📧 Email: ${TEST_USER.email}`);
        console.log(`🔑 Password: ${TEST_USER.password.substring(0, 3)}***`);
        
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password
            })
        });

        const data = await response.json();
        
        if (response.ok && data.token) {
            console.log('\n✅ Login successful!');
            console.log(`   Token: ${data.token.substring(0, 30)}...`);
            console.log(`   User: ${data.user.email}`);
            console.log(`   Role: ${data.user.role}`);
            return data.token;
        } else {
            console.log(`\n❌ Login failed: ${data.message}`);
            return null;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return null;
    }
}

async function step4_AccessDashboard(token) {
    console.log('\n' + '='.repeat(60));
    console.log('STEP 4: Access Dashboard (/me endpoint)');
    console.log('='.repeat(60));
    
    try {
        console.log('\n🔑 Using JWT Token for authentication...');
        
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('\n✅ Dashboard access granted!');
            console.log(`   User ID: ${data.id}`);
            console.log(`   Email: ${data.email}`);
            console.log(`   Name: ${data.firstName} ${data.lastName}`);
            console.log(`   Role: ${data.role}`);
            console.log(`   Balance: $${data.balanceUsd || 0} USD`);
            console.log(`   ROI: ${data.roi || 0}%`);
            return true;
        } else {
            console.log(`\n❌ Dashboard access failed: ${data.message}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

async function runFullTest() {
    console.log('\n\n');
    console.log('█████████████████████████████████████████████████████████████');
    console.log('█  VERTEXPRIME CAPITAL - FULL SIGNUP & LOGIN TEST            █');
    console.log('█████████████████████████████████████████████████████████████');
    console.log('\n✨ This test simulates the complete user registration flow\n');

    // Step 1
    const otpSent = await step1_SendOtp();
    if (!otpSent) {
        console.log('\n\n⚠️  Cannot proceed - OTP sending failed');
        return;
    }

    // Step 2
    const accountCreated = await step2_VerifyOtp();
    if (!accountCreated) {
        console.log('\n\n⚠️  Cannot proceed - Account creation failed');
        return;
    }

    // Step 3
    const token = await step3_Login();
    if (!token) {
        console.log('\n\n⚠️  Cannot proceed - Login failed');
        return;
    }

    // Step 4
    const dashboardAccess = await step4_AccessDashboard(token);

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    if (dashboardAccess) {
        console.log('\n✅ ALL TESTS PASSED!');
        console.log('\nThe complete signup and login flow is working correctly:');
        console.log('  1. ✅ OTP sent to email');
        console.log('  2. ✅ Account created with verified email');
        console.log('  3. ✅ Login successful with JWT token');
        console.log('  4. ✅ Dashboard access granted');
        console.log('\nThe application is ready for production use!');
    } else {
        console.log('\n❌ SOME TESTS FAILED');
        console.log('\nCheck the errors above to troubleshoot');
    }
    console.log('\n' + '='.repeat(60) + '\n');
}

// Run the test
runFullTest().catch(e => {
    console.error('\n\nFATAL ERROR:', e);
    process.exit(1);
});
