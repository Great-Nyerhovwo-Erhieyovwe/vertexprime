/**
 * Admin Verifications Controller
 *
 * Handles admin operations for KYC and identity verifications:
 * - List pending verifications
 * - Approve or reject with reason
 * - Mark user as verified when approved
 */

import { provider } from "../services/dataProvider.js";

/**
 * List all verifications (pending, approved, rejected)
 * Returns: Array of verification objects with user info and document details
 */
export async function listVerifications(req, res) {
    try {
        const verifications = await provider.find('verifications', {});
        return res.json(verifications);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * Update verification status (approve/reject)
 * 
 * Request body:
 * {
 *   status: 'pending' | 'approved' | 'rejected',
 *   reason: 'rejection reason or approval notes'
 * }
 * 
 * When approved:
 * - Sets verification.status = 'approved'
 * - Marks user as emailVerified = true
 * - Records reviewer email and timestamp
 */
export async function updateVerification(req, res) {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Fetch verification to get userId
        const verification = await provider.findOne('verifications', { _id: id });
        if (!verification) return res.status(404).json({ message: 'Verification not found' });

        // Update verification record
        const updates = {
            status,
            reason: reason || '',
            reviewedAt: new Date(),
            reviewedBy: req.user?.email || 'admin',
        };
        await provider.updateOne('verifications', { _id: id }, updates);

        // If approved, mark user as verified
        if (status === 'approved' && verification.userId) {
            await provider.updateOne('users', { _id: verification.userId }, {
                emailVerified: true,
                verificationApprovedAt: new Date(),
            });
        }

        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}
