/**
 * Admin Trades Controller
 *
 * Handles admin operations for managing user trades:
 * - List all active and closed trades
 * - Close/modify trades manually
 * - View trade performance
 * - Add admin notes to trades
 */

import { provider } from "../services/dataProvider.js";

/**
 * List all trades
 * Returns: Array of trade objects with entry price, exit price, status, result
 */
export async function listTrades(req, res) {
    try {
        const trades = await provider.find('trades', {});
        return res.json(trades);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * Update trade status (close/modify manually)
 * 
 * Request body:
 * {
 *   status: 'active' | 'closed',
 *   result: 'win' | 'loss' | 'cancelled',
 *   exitPrice: 1234.56,  // actual exit price if manually closed
 *   adminNotes: 'reason for manual intervention'
 * }
 * 
 * When admin closes a trade:
 * - Calculates profit/loss based on entry and exit prices
 * - Records the result
 * - Updates user ROI if needed
 */
export async function updateTrade(req, res) {
    try {
        const { id } = req.params;
        const { status, result, exitPrice, adminNotes } = req.body;

        if (!['active', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (status === 'closed' && !['win', 'loss', 'cancelled'].includes(result)) {
            return res.status(400).json({ message: 'Invalid result' });
        }

        // Fetch trade to calculate P/L if needed
        const trade = await provider.findOne('trades', { _id: id });
        if (!trade) return res.status(404).json({ message: 'Trade not found' });

        let profitLoss = 0;
        if (exitPrice && trade.entryPrice) {
            // Calculate profit/loss: (exitPrice - entryPrice) * quantity
            const priceChange = exitPrice - trade.entryPrice;
            profitLoss = priceChange * (trade.quantity || 1);
        }

        // Update trade record
        const updates = {
            status,
            result: status === 'closed' ? result : trade.result,
            exitPrice: exitPrice || trade.exitPrice,
            profitLoss,
            adminNotes: adminNotes || '',
            closedAt: status === 'closed' ? new Date() : trade.closedAt,
            closedBy: status === 'closed' ? (req.user?.email || 'admin') : trade.closedBy,
        };
        await provider.updateOne('trades', { _id: id }, updates);

        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}
