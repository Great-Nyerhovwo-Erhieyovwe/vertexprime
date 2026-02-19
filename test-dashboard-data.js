/**
 * Test script to verify dashboard data fetching works correctly
 * Tests real data endpoints with the newly updated database structure
 */

const API_URL = "http://localhost:4000/api";

// Test credentials from db.json
const testUser = {
  email: "test_1771457936159@example.com",
  password: "Test@123",
};

let authToken = null;

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { status: 0, error: error.message };
  }
}

// Test flow
async function runTests() {
  console.log("🧪 Dashboard Data Verification Tests\n");
  console.log("=".repeat(50));

  // Test 1: Login to get token
  console.log("\n1️⃣  Testing Login...");
  let loginResult = await apiCall("/auth/login", {
    method: "POST",
    body: { email: testUser.email, password: testUser.password },
  });

  if (loginResult.status === 200 && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log("✅ Login successful");
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
  } else {
    // Try with actual password from db
    console.log("❌ Login failed, trying alternative credentials...");
    console.log("   Status:", loginResult.status);
    console.log("   Response:", loginResult.data);
    return;
  }

  // Test 2: Fetch user profile
  console.log("\n2️⃣  Fetching User Profile...");
  let userResult = await apiCall("/dashboard/user");
  if (userResult.status === 200) {
    console.log("✅ User profile fetched");
    console.log(`   Name: ${userResult.data.firstName} ${userResult.data.lastName}`);
    console.log(`   Email: ${userResult.data.email}`);
    console.log(`   Balance: $${userResult.data.balanceUsd?.toLocaleString()}`);
    console.log(`   ROI: ${userResult.data.roi}%`);
  } else {
    console.log("❌ User profile fetch failed");
    console.log("   Status:", userResult.status);
    console.log("   Error:", userResult.data);
  }

  // Test 3: Fetch portfolio
  console.log("\n3️⃣  Fetching Portfolio Data...");
  let portfolioResult = await apiCall("/dashboard/portfolio");
  if (portfolioResult.status === 200) {
    console.log("✅ Portfolio fetched");
    console.log(`   Total Value: $${portfolioResult.data.totalValue?.toLocaleString()}`);
    console.log(`   Open Positions: ${portfolioResult.data.openPositions?.length || 0}`);
    if (portfolioResult.data.openPositions?.length > 0) {
      portfolioResult.data.openPositions.forEach((pos) => {
        console.log(
          `     - ${pos.symbol}: ${pos.amount} units @ $${pos.currentPrice} (Total: $${pos.value})`
        );
      });
    }
  } else {
    console.log("❌ Portfolio fetch failed");
    console.log("   Status:", portfolioResult.status);
  }

  // Test 4: Fetch transactions
  console.log("\n4️⃣  Fetching Transactions...");
  let txResult = await apiCall("/dashboard/transactions");
  if (txResult.status === 200) {
    console.log("✅ Transactions fetched");
    console.log(`   Total transactions: ${txResult.data.length || 0}`);
    if (txResult.data?.length > 0) {
      txResult.data.slice(0, 3).forEach((tx) => {
        console.log(
          `     - ${tx.type.toUpperCase()}: ${tx.symbol} - ${tx.amount} @ $${tx.price} (${new Date(tx.date).toLocaleDateString()})`
        );
      });
    }
  } else {
    console.log("❌ Transactions fetch failed");
    console.log("   Status:", txResult.status);
  }

  // Test 5: Fetch notifications
  console.log("\n5️⃣  Fetching Notifications...");
  let notifResult = await apiCall("/dashboard/notifications");
  if (notifResult.status === 200) {
    console.log("✅ Notifications fetched");
    console.log(`   Total notifications: ${notifResult.data?.length || 0}`);
    const unread = notifResult.data?.filter((n) => !n.read)?.length || 0;
    console.log(`   Unread: ${unread}`);
  } else {
    console.log("❌ Notifications fetch failed");
    console.log("   Status:", notifResult.status);
  }

  // Test 6: Fetch stats
  console.log("\n6️⃣  Fetching Dashboard Stats...");
  let statsResult = await apiCall("/dashboard/stats");
  if (statsResult.status === 200) {
    console.log("✅ Stats fetched");
    console.log(`   Total Balance: $${statsResult.data.totalBalance?.toLocaleString()}`);
    console.log(`   Active Trades: ${statsResult.data.activeTrades}`);
    console.log(`   Monthly Return: ${statsResult.data.monthlyReturn}%`);
    console.log(`   Yearly Return: ${statsResult.data.yearlyReturn}%`);
    console.log(`   Win Rate: ${statsResult.data.winRate}%`);
  } else {
    console.log("❌ Stats fetch failed");
    console.log("   Status:", statsResult.status);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✨ All tests completed!\n");
}

// Run tests
runTests().catch(console.error);
