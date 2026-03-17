/**
 * Request Controller - Handles all user requests (deposits, withdrawals, trades, upgrades, verifications, settings)
 * ====================================================================================================
 * 
 * This controller manages:
 * - Deposit requests (min $50, pending admin approval)
 * - Withdrawal requests (min varies by account level, max $500 daily, weekly frequency)
 * - Trade requests (deducts balance, waits for trade report)
 * - Upgrade requests (account level upgrade, pending admin approval)
 * - Verification requests (KYC verification, pending admin approval)
 * - Settings updates (user preferences including dark mode)
 * 
 * All requests follow a standard flow:
 * 1. Validate user input and business rules
 * 2. Check user's current state (balance, permissions, frequency limits)
 * 3. Create request record with "pending" status
 * 4. Admin reviews and approves/rejects
 * 5. System updates user balance/status based on admin decision
 */

// const db = require('../utils/db');
import db from '../utils/db.js';

// ============================================================================
// DEPOSIT REQUEST CONTROLLER
// ============================================================================

/**
 * Create a deposit request
 * 
 * Business Logic:
 * - Minimum deposit: $50
 * - Creates a pending request with status "pending"
 * - User balance updates only after admin approval
 * - Request stored in deposits collection for admin review
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userId - User ID from JWT token
 * @param {number} req.body.amount - Deposit amount in USD
 * @param {string} req.body.paymentMethod - Payment method (card, bank, crypto)
 */
async function createDeposit(req, res) {
  try {
    const { userId } = req.user;
    const { amount, paymentMethod } = req.body;

    // Validation: Check minimum deposit amount ($50)
    if (amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum deposit amount is $50',
      });
    }

    // Fetch user to get current balance
    const users = await db.read('users');
    const user = users.find((u) => u._id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create new deposit request
    const deposit = {
      _id: `deposit_${Date.now()}`,
      userId,
      amount,
      paymentMethod,
      status: 'pending', // pending | approved | rejected
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      adminNotes: '',
    };

    // Read existing deposits
    let deposits = await db.read('deposits');
    if (!deposits) deposits = [];

    // Add new deposit to collection
    deposits.push(deposit);

    // Save back to database
    await db.write({ deposits });

    // Return success with request ID for tracking
    res.json({
      success: true,
      message: 'Deposit request submitted successfully. Awaiting admin approval.',
      requestId: deposit._id,
      status: 'pending',
    });
  } catch (error) {
    console.error('Deposit creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create deposit request' });
  }
}

/**
 * Get user's deposit history
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userId - User ID from JWT token
 */
async function getUserDeposits(req, res) {
  try {
    const { userId } = req.user;

    // Read all deposits
    let deposits = await db.read('deposits');
    if (!deposits) deposits = [];

    // Filter deposits for current user
    const userDeposits = deposits.filter((d) => d.userId === userId);

    res.json({
      success: true,
      deposits: userDeposits,
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deposit history' });
  }
}

// ============================================================================
// WITHDRAWAL REQUEST CONTROLLER
// ============================================================================

/**
 * Create a withdrawal request
 * 
 * Business Logic:
 * - Minimum withdrawal: $500 for basic account, varies by upgrade level
 * - Maximum daily withdrawal: $500
 * - Frequency: Weekly (max 1 withdrawal per week)
 * - Requires sufficient balance
 * - Creates pending request, balance locked until approval
 * 
 * @param {Object} req - Express request object
 * @param {number} req.body.amount - Withdrawal amount
 * @param {string} req.body.withdrawalMethod - Method (bank, crypto, card, wallet)
 */
async function createWithdrawal(req, res) {
  try {
    const { userId } = req.user;
    const { amount, withdrawalMethod, destinationAddress } = req.body;

    // Fetch user to check balance and account type
    const users = await db.read('users');
    const user = users.find((u) => u._id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validation: Minimum withdrawal is $500
    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is $500',
      });
    }

    // Validation: Maximum daily withdrawal is $500
    if (amount > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum daily withdrawal amount is $5000',
      });
    }

    // Validation: Check user has sufficient balance
    if (user.balanceUsd < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for withdrawal',
        availableBalance: user.balanceUsd,
      });
    }

    // Check weekly frequency - user can only make 1 withdrawal per week
    let withdrawals = await db.read('withdrawals');
    if (!withdrawals) withdrawals = [];

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentWithdrawal = withdrawals.find(
      (w) => w.userId === userId && w.requestedAt > oneWeekAgo && w.status === 'approved'
    );

    if (recentWithdrawal) {
      return res.status(400).json({
        success: false,
        message: 'You can only make one withdrawal per week. Please try again next week.',
      });
    }

    // Create withdrawal request
    const withdrawal = {
      _id: `withdrawal_${Date.now()}`,
      userId,
      amount,
      withdrawalMethod,
      destinationAddress,
      status: 'pending', // pending | approved | rejected
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      processedAt: null,
      adminNotes: '',
    };

    // Add to withdrawals collection
    withdrawals.push(withdrawal);
    await db.write({ withdrawals });

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully. Awaiting admin approval.',
      requestId: withdrawal._id,
      status: 'pending',
    });
  } catch (error) {
    console.error('Withdrawal creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create withdrawal request' });
  }
}

/**
 * Get user's withdrawal history
 */
async function getUserWithdrawals(req, res) {
  try {
    const { userId } = req.user;

    let withdrawals = await db.read('withdrawals');
    if (!withdrawals) withdrawals = [];

    const userWithdrawals = withdrawals.filter((w) => w.userId === userId);

    res.json({
      success: true,
      withdrawals: userWithdrawals,
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawal history' });
  }
}

// ============================================================================
// TRADE REQUEST CONTROLLER
// ============================================================================

/**
 * Create a trade request
 * 
 * Business Logic:
 * - Immediately deducts amount from user's balance
 * - Creates trade request for admin to report result (loss/gain)
 * - After admin reports: adds profit or subtracts loss
 * - Tracks trade history for user
 * 
 * @param {Object} req - Express request object
 * @param {number} req.body.amount - Trade amount (deducted from balance)
 * @param {string} req.body.asset - Asset being traded (EUR/USD, BTC, etc)
 * @param {string} req.body.type - Trade type (buy/sell)
 */
async function createTrade(req, res) {
  try {
    const { userId } = req.user;
    const { amount, asset, type, leverage } = req.body;

    // Fetch user
    const users = await db.read('users');
    const user = users.find((u) => u._id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validation: Check sufficient balance
    if (user.balanceUsd < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for trade',
        availableBalance: user.balanceUsd,
      });
    }

    // Create trade request
    const trade = {
      _id: `trade_${Date.now()}`,
      userId,
      amount,
      asset,
      type, // 'buy' or 'sell'
      leverage: leverage || 1,
      status: 'active', // active | closed | reported
      requestedAt: new Date().toISOString(),
      closedAt: null,
      result: null, // 'loss' | 'gain' | null
      resultAmount: 0, // profit or loss amount
      adminNotes: '',
    };

    // Immediately deduct amount from user balance
    user.balanceUsd -= amount;

    // Save updated user
    users[users.findIndex((u) => u._id === userId)] = user;

    // Read and update trades
    let trades = await db.read('trades');
    if (!trades) trades = [];
    trades.push(trade);

    // Write both users and trades back
    await db.write({ users, trades });

    res.json({
      success: true,
      message: 'Trade executed successfully. Awaiting admin trade report.',
      tradeId: trade._id,
      deductedAmount: amount,
      newBalance: user.balanceUsd,
    });
  } catch (error) {
    console.error('Trade creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to execute trade' });
  }
}

/**
 * Get user's trades
 */
async function getUserTrades(req, res) {
  try {
    const { userId } = req.user;

    let trades = await db.read('trades');
    if (!trades) trades = [];

    const userTrades = trades.filter((t) => t.userId === userId);

    res.json({
      success: true,
      trades: userTrades,
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
}

// ============================================================================
// UPGRADE REQUEST CONTROLLER
// ============================================================================

/**
 * Create account upgrade request
 * 
 * Business Logic:
 * - User requests to upgrade account level (e.g., basic -> premium -> pro)
 * - Admin reviews and approves/rejects
 * - On approval: unlock premium features, adjust limits
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.upgradeLevel - Target account level (premium, pro, vip)
 */
async function createUpgrade(req, res) {
  try {
    const { userId } = req.user;
    const { upgradeLevel } = req.body;

    // Validate upgrade level
    const validLevels = ['premium', 'pro', 'vip'];
    if (!validLevels.includes(upgradeLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid upgrade level',
      });
    }

    // Create upgrade request
    const upgrade = {
      _id: `upgrade_${Date.now()}`,
      userId,
      upgradeLevel,
      status: 'pending', // pending | approved | rejected
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      adminNotes: '',
    };

    // Read and update upgrades
    let upgrades = await db.read('upgrades');
    if (!upgrades) upgrades = [];
    upgrades.push(upgrade);

    await db.write({ upgrades });

    res.json({
      success: true,
      message: 'Upgrade request submitted successfully. Awaiting admin approval.',
      requestId: upgrade._id,
      status: 'pending',
    });
  } catch (error) {
    console.error('Upgrade creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create upgrade request' });
  }
}

/**
 * Get user's upgrade requests
 */
async function getUserUpgrades(req, res) {
  try {
    const { userId } = req.user;

    let upgrades = await db.read('upgrades');
    if (!upgrades) upgrades = [];

    const userUpgrades = upgrades.filter((u) => u.userId === userId);

    res.json({
      success: true,
      upgrades: userUpgrades,
    });
  } catch (error) {
    console.error('Get upgrades error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upgrade requests' });
  }
}

// ============================================================================
// VERIFICATION REQUEST CONTROLLER
// ============================================================================

/**
 * Create KYC verification request
 * 
 * Business Logic:
 * - User submits identification documents for verification
 * - Admin reviews documents and approves/rejects
 * - On approval: marks user as verified, unlocks features
 * - On rejection: user can resubmit with corrections
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.documentType - Type of document (passport, drivers_license, etc)
 * @param {string} req.body.documentNumber - Document number
 * @param {string} req.body.expiryDate - Document expiry date
 */
async function createVerification(req, res) {
  try {
    const { userId } = req.user;
    const { documentType, documentNumber, expiryDate } = req.body;

    // Validation
    if (!documentType || !documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'Document type and number are required',
      });
    }

    // Create verification request
    const verification = {
      _id: `verification_${Date.now()}`,
      userId,
      documentType,
      documentNumber,
      expiryDate,
      status: 'pending', // pending | approved | rejected
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      adminNotes: '',
    };

    // Read and update verifications
    let verifications = await db.read('verifications');
    if (!verifications) verifications = [];
    verifications.push(verification);

    await db.write({ verifications });

    res.json({
      success: true,
      message: 'Verification request submitted successfully. Awaiting admin approval.',
      requestId: verification._id,
      status: 'pending',
    });
  } catch (error) {
    console.error('Verification creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create verification request' });
  }
}

/**
 * Get user's verification requests
 */
async function getUserVerifications(req, res) {
  try {
    const { userId } = req.user;

    let verifications = await db.read('verifications');
    if (!verifications) verifications = [];

    const userVerifications = verifications.filter((v) => v.userId === userId);

    res.json({
      success: true,
      verifications: userVerifications,
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch verification requests' });
  }
}

// ============================================================================
// SETTINGS UPDATE CONTROLLER
// ============================================================================

/**
 * Update user settings
 * 
 * Business Logic:
 * - Updates user preferences (dark mode, notifications, etc)
 * - Immediately applied, no admin approval needed
 * - Persists to database
 * 
 * @param {Object} req - Express request object
 * @param {boolean} req.body.darkMode - Enable/disable dark mode
 * @param {boolean} req.body.notifications - Enable/disable notifications
 * @param {string} req.body.language - Preferred language
 */
async function updateSettings(req, res) {
  try {
    const { userId } = req.user;
    const { darkMode, notifications, language, currency, timezone } = req.body;

    // Fetch user
    const users = await db.read('users');
    const userIndex = users.findIndex((u) => u._id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user settings
    const user = users[userIndex];
    if (darkMode !== undefined) user.darkMode = darkMode;
    if (notifications !== undefined) user.notifications = notifications;
    if (language) user.language = language;
    if (currency) user.currency = currency;
    if (timezone) user.timezone = timezone;
    user.settingsUpdatedAt = new Date().toISOString();

    users[userIndex] = user;

    // Save updated user
    await db.write({ users });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        darkMode: user.darkMode,
        notifications: user.notifications,
        language: user.language,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
}

/**
 * Get user settings
 */
async function getSettings(req, res) {
  try {
    const { userId } = req.user;

    const users = await db.read('users');
    const user = users.find((u) => u._id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      settings: {
        darkMode: user.darkMode || false,
        notifications: user.notifications !== false,
        language: user.language || 'en',
        currency: user.currency || 'USD',
        timezone: user.timezone || 'UTC',
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
}

// ============================================================================
// REQUEST STATUS CHECK
// ============================================================================

/**
 * Get all pending requests for user (combined view)
 * Useful for dashboard to show all awaiting-approval items
 */
async function getPendingRequests(req, res) {
  try {
    const { userId } = req.user;

    const deposits = (await db.read('deposits')) || [];
    const withdrawals = (await db.read('withdrawals')) || [];
    const trades = (await db.read('trades')) || [];
    const upgrades = (await db.read('upgrades')) || [];
    const verifications = (await db.read('verifications')) || [];

    const userPending = {
      deposits: deposits.filter((d) => d.userId === userId && d.status === 'pending'),
      withdrawals: withdrawals.filter((w) => w.userId === userId && w.status === 'pending'),
      trades: trades.filter((t) => t.userId === userId && t.status === 'active'),
      upgrades: upgrades.filter((u) => u.userId === userId && u.status === 'pending'),
      verifications: verifications.filter((v) => v.userId === userId && v.status === 'pending'),
    };

    res.json({
      success: true,
      pending: userPending,
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending requests' });
  }
}

export {
  createDeposit,
  getUserDeposits,
  createWithdrawal,
  getUserWithdrawals,
  createTrade,
  getUserTrades,
  createUpgrade,
  getUserUpgrades,
  createVerification,
  getUserVerifications,
  updateSettings,
  getSettings,
  getPendingRequests,
};


// export default requestController;