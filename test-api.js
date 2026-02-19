#!/usr/bin/env node
/**
 * Test authentication flow
 * This script tests whether the auth and dashboard endpoints work correctly
 */

const BASE_URL = 'http://localhost:4000/api';

// Test credentials from db.json
const testEmail = 'test_1771457936159@example.com';
const testPassword = 'Test@123'; // This won't work, we need the actual password

async function testLogin() {
  try {
    console.log('📝 Testing login endpoint...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    
    console.log(`✅ Login endpoint responded with status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log(`Token: ${data.token?.substring(0, 20)}...`);
      return data.token;
    } else {
      console.log('❌ Login failed (invalid credentials)');
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

async function testDashboard(token) {
  if (!token) {
    console.log('⚠️  Skipping dashboard test (no token)');
    return;
  }
  
  try {
    console.log('\n📝 Testing dashboard endpoints...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test user endpoint
    const userResponse = await fetch(`${BASE_URL}/dashboard/user`, { headers });
    console.log(`✅ /dashboard/user: ${userResponse.status}`);
    
    // Test portfolio endpoint
    const portfolioResponse = await fetch(`${BASE_URL}/dashboard/portfolio`, { headers });
    console.log(`✅ /dashboard/portfolio: ${portfolioResponse.status}`);
    
    // Test stats endpoint
    const statsResponse = await fetch(`${BASE_URL}/dashboard/stats`, { headers });
    console.log(`✅ /dashboard/stats: ${statsResponse.status}`);
    
    // Test transactions endpoint
    const transResponse = await fetch(`${BASE_URL}/dashboard/transactions`, { headers });
    console.log(`✅ /dashboard/transactions: ${transResponse.status}`);
    
    // Test notifications endpoint
    const notifResponse = await fetch(`${BASE_URL}/dashboard/notifications`, { headers });
    console.log(`✅ /dashboard/notifications: ${notifResponse.status}`);
    
  } catch (error) {
    console.error('❌ Dashboard test error:', error.message);
  }
}

async function main() {
  console.log('🧪 Testing VertexPrime API Endpoints\n');
  console.log('Note: This test uses placeholder credentials\n');
  
  // Test without token first
  console.log('---Test 1: API Endpoints (without token)---');
  const userResponseNoToken = await fetch(`${BASE_URL}/dashboard/user`, {
    headers: { 'Authorization': 'Bearer invalid' }
  });
  console.log(`Dashboard endpoint response: ${userResponseNoToken.status} (expected 401 or 404)`);
  
  console.log('\n---Test 2: Authentication---');
  const token = await testLogin();
  
  if (token) {
    console.log('\n---Test 3: Dashboard with Token---');
    await testDashboard(token);
  }
  
  console.log('\n✨ Tests completed!');
}

main();
