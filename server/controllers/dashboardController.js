/**
 * Dashboard Controller
 * =====================
 * Handles all dashboard-related operations:
 * - Fetching user profile and portfolio data
 * - Retrieving transaction history
 * - Getting notifications
 * - Managing user settings
 * 
 * All endpoints require JWT authentication via the 'authenticate' middleware
 */

import { provider } from "../services/dataProvider.js";

/**
 * GET /dashboard/user
 * Fetch authenticated user's profile information
 */
export async function getUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const authUser = req.user;

        if (!authUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return res.json({
            id: authUser._id || authUser.id,
            email: authUser.email,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            username: authUser.username,
            country: authUser.country,
            currency: authUser.currency,
            accountType: authUser.accountType,
            emailVerified: authUser.emailVerified,
            createdAt: authUser.createdAt,
            role: authUser.role
        });
    } catch (e) {
        console.error('Error fetching user:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /dashboard/portfolio
 * Fetch user's portfolio metrics and balance information
 */
export async function getPortfolio(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user._id || req.user.id;
        const portfolio = await provider.findOne('portfolios', { userId });
        const user = await provider.findOne('users', { _id: userId });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!portfolio) {
            return res.json({
                totalBalance: user.balanceUsd || 0,
                balanceUsd: user.balanceUsd || 0,
                roi: user.roi || 0,
                activeTradesCount: 0,
                activeInvestments: 0,
                openPositions: []
            });
        }

        return res.json({
            totalBalance: portfolio.totalValue || 0,
            balanceUsd: portfolio.totalValue || 0,
            roi: user.roi || 0,
            activeTradesCount: portfolio.openPositions?.length || 0,
            activeInvestments: portfolio.openPositions?.length || 0,
            openPositions: portfolio.openPositions || []
        });
    } catch (e) {
        console.error('Error fetching portfolio:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /dashboard/transactions
 * Fetch user's transaction history (trades, deposits, withdrawals)
 */
export async function getTransactions(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const userId = req.user._id || req.user.id;
        const transactions = await provider.find('transactions', {
            userId
        });

        const paginatedTransactions = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(offset, offset + limit);

        return res.json({
            transactions: paginatedTransactions,
            total: transactions.length,
            limit,
            offset
        });
    } catch (e) {
        console.error('Error fetching transactions:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /dashboard/notifications
 * Fetch user's notifications (alerts, price changes, trade updates, etc)
 */
export async function getNotifications(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user._id || req.user.id;
        const filter = {
            userId
        };

        if (req.query.unreadOnly === 'true') {
            filter.read = false;
        }

        const notifications = await provider.find('notifications', filter);

        const sortedNotifications = notifications.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        return res.json({
            notifications: sortedNotifications,
            unreadCount: sortedNotifications.filter(n => !n.read).length
        });
    } catch (e) {
        console.error('Error fetching notifications:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * PATCH /dashboard/notifications/:notificationId/read
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { notificationId } = req.params;
        const userId = req.user._id || req.user.id;
        const notification = await provider.findOne('notifications', {
            _id: notificationId,
            userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const result = await provider.updateOne('notifications',
            { _id: notificationId },
            { read: true }
        );

        if (result.modifiedCount === 0 && result.matchedCount === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.json({ success: true, message: 'Notification marked as read' });
    } catch (e) {
        console.error('Error marking notification as read:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /dashboard/stats
 * Fetch dashboard statistics and summary metrics
 */
export async function getDashboardStats(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user._id || req.user.id;
        const user = await provider.findOne('users', { _id: userId });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const transactions = await provider.find('transactions', {
            userId
        });

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const monthlyTransactions = transactions.filter(
            t => new Date(t.date) > thirtyDaysAgo
        );
        const monthlyProfit = monthlyTransactions.reduce((sum, t) => {
            return sum + (t.type === 'buy' ? -t.amount * t.price : t.amount * t.price);
        }, 0);

        return res.json({
            totalBalance: user.balanceUsd || 0,
            activeTradesCount: transactions.filter(t => t.status === 'pending').length,
            roi: user.roi || 0,
            activeInvestments: transactions.filter(t => 
                (t.type === 'buy' || t.type === 'hold') && t.status === 'completed'
            ).length,
            monthlyProfit: monthlyProfit,
            lastTransactionDate: transactions.length > 0 
                ? new Date(Math.max(...transactions.map(t => new Date(t.date))))
                : null
        });
    } catch (e) {
        console.error('Error fetching dashboard stats:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * PUT /dashboard/user/settings
 * Update user settings and preferences
 */
export async function updateUserSettings(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { currency, country, accountType, notifications } = req.body;

        const updates = {};
        if (currency) updates.currency = currency;
        if (country) updates.country = country;
        if (accountType) updates.accountType = accountType;
        if (notifications) updates.notifications = notifications;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const userId = req.user._id || req.user.id;
        const result = await provider.updateOne('users',
            { _id: userId },
            updates
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            success: true,
            message: 'Settings updated successfully',
            updates
        });
    } catch (e) {
        console.error('Error updating user settings:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}
