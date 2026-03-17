/**
 * Admin Support/Messaging Controller
 *
 * Handles:
 * 1. Support Tickets - Users submit issues, admin responds and resolves
 * 2. Direct Messages - Admin sends messages to users (warnings, notices, etc.)
 * 3. Email - Admin sends emails to individual or bulk users
 */

import { provider } from "../services/dataProvider.js";

/**
 * ===== SUPPORT TICKETS =====
 */

/**
 * List all support tickets
 * Returns: Array of tickets with status filters (open, in-progress, resolved, closed)
 */
export async function listTickets(req, res) {
    try {
        const tickets = await provider.find('support_tickets', {});
        return res.json(tickets);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * Update ticket (add reply, change status)
 * 
 * Request body:
 * {
 *   status: 'open' | 'in-progress' | 'resolved' | 'closed',
 *   reply: 'admin response message'
 * }
 * 
 * When admin replies:
 * - Adds reply to ticket replies array
 * - Includes admin email and timestamp
 * - User gets notification (optional)
 */
export async function updateTicket(req, res) {
    try {
        const { id } = req.params;
        const { status, reply } = req.body;

        if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Fetch ticket
        const ticket = await provider.findOne('support_tickets', { _id: id });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Build new replies array if adding a reply
        let replies = ticket.replies || [];
        if (reply) {
            replies.push({
                from: 'admin',
                message: reply,
                adminEmail: req.user?.email || 'admin',
                timestamp: new Date(),
            });
        }

        const updates = {
            status,
            replies,
            lastReplyAt: new Date(),
            lastReplyBy: req.user?.email || 'admin',
        };

        if (status === 'resolved' || status === 'closed') {
            updates.resolvedAt = new Date();
            updates.resolvedBy = req.user?.email || 'admin';
        }

        await provider.updateOne('support_tickets', { _id: id }, updates);
        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * ===== DIRECT MESSAGES =====
 */

/**
 * Send message to user
 * 
 * Request body:
 * {
 *   userId: 'user_id',
 *   message: 'message content',
 *   type: 'direct' | 'warning' | 'notice'
 * }
 * 
 * Types:
 * - 'direct': Regular message from admin
 * - 'warning': Alert about account issue (e.g., suspicious activity)
 * - 'notice': Important announcement (e.g., maintenance, updates)
 */
export async function sendMessage(req, res) {
    try {
        const { userId, message, type = 'direct' } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ message: 'Missing userId or message' });
        }

        if (!['direct', 'warning', 'notice'].includes(type)) {
            return res.status(400).json({ message: 'Invalid message type' });
        }

        const messageDoc = {
            userId,
            message,
            type,
            from: 'admin',
            fromEmail: req.user?.email || 'admin',
            sentAt: new Date(),
            read: false,
        };

        const result = await provider.insertOne('messages', messageDoc);
        return res.json({ success: true, id: result.insertedId || result.insertedId });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * ===== EMAIL =====
 */

/**
 * Send email to user(s)
 * 
 * Request body:
 * {
 *   to: 'email@example.com' | ['email1@example.com', 'email2@example.com'],
 *   subject: 'Email subject',
 *   body: 'Email body (HTML supported)',
 *   userId: 'optional user ID for log tracking'
 * }
 * 
 * Stores email log for audit trail
 * In production, integrate with nodemailer to actually send emails
 */
export async function sendEmail(req, res) {
    try {
        const { to, subject, body, userId } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ message: 'Missing to, subject, or body' });
        }

        const recipients = Array.isArray(to) ? to : [to];

        const emailLog = {
            recipients,
            subject,
            body,
            userId: userId || null,
            sentBy: req.user?.email || 'admin',
            sentAt: new Date(),
            status: 'sent',
            // In production, add delivery status tracking here
        };

        const result = await provider.insertOne('email_logs', emailLog);

        // TODO: In production, integrate with nodemailer here to actually send emails
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail({ to: recipients, subject, html: body });

        return res.json({ success: true, id: result.insertedId });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}
