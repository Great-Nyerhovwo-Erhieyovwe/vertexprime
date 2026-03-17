/**
 * Admin Transactions Controller
 *
 * Handles admin operations for managing deposits and withdrawals:
 * - List all transactions (pending, approved, rejected)
 * - Approve/reject transactions
 * - Add admin notes
 * - When a deposit is approved, credit the user's balance
 */

import { provider } from "../services/dataProvider.js";

/**
 * List all transactions
 * Returns: Array of transaction objects with user info, amounts, status
 */
export async function listTransactions(req, res) {
    try {
        const transactions = await provider.find('transactions', {});
        return res.json(transactions);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * Update transaction status (approve/reject)
 * 
 * Request body:
 * {
 *   status: 'pending' | 'approved' | 'rejected',
 *   adminNotes: 'reason or additional notes',
 *   creditUser: true // if deposit and approving, credit balance
 * }
 */
export async function updateTransaction(req, res) {
    try {
        const { id } = req.params;
        const { status, adminNotes, creditUser } = req.body;
        
        // status: 'pending' → 'approved' or 'rejected'
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Fetch transaction to get details
        const transaction = await provider.findOne('transactions', { _id: id });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // Update transaction record with new status
        const updates = {
            status,
            adminNotes: adminNotes || '',
            updatedAt: new Date(),
            reviewedBy: req.user?.email || 'admin',
        };
        await provider.updateOne('transactions', { _id: id }, updates);

        // If deposit is approved and creditUser flag is true, add funds to user balance
        if (status === 'approved' && creditUser && transaction.type === 'deposit') {
            const user = await provider.findOne('users', { _id: transaction.userId });
            if (user) {
                const newBalance = (user.balanceUsd || 0) + Number(transaction.amount || 0);
                await provider.updateOne('users', { _id: transaction.userId }, { balanceUsd: newBalance });
            }
        }

        // If withdrawal is approved, deduct from balance (optional - depends on flow)
        if (status === 'approved' && transaction.type === 'withdrawal') {
            const user = await provider.findOne('users', { _id: transaction.userId });
            if (user) {
                const newBalance = Math.max(0, (user.balanceUsd || 0) - Number(transaction.amount || 0));
                await provider.updateOne('users', { _id: transaction.userId }, { balanceUsd: newBalance });
            }
        }

        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}
