import express from "express";
import * as adminCtrl from "../controllers/adminController.js";
import * as transactionsCtrl from "../controllers/adminTransactionsController.js";
import * as verificationsCtrl from "../controllers/adminVerificationsController.js";
import * as tradesCtrl from "../controllers/adminTradesController.js";
import * as messagingCtrl from "../controllers/adminMessagingController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

/**
 * PUBLIC ROUTES (no auth required)
 */
// Admin login endpoint - returns JWT
router.post('/login', adminCtrl.adminLogin);

/**
 * PROTECTED ROUTES (require JWT + admin role)
 * All routes below are protected by authenticate + requireAdmin middleware
 */
router.use(authenticate, requireAdmin);

/**
 * DASHBOARD & SUMMARY
 */
// Overview metrics: total users, deposits, withdrawals, active, verified
router.get('/summary', adminCtrl.adminSummary);

/**
 * USERS MANAGEMENT
 */
// List all users with details (balance, role, status, etc.)
router.get('/users', adminCtrl.listUsers);
// Create new user
router.post('/users', adminCtrl.createUser);
// Update user (balance, ROI, ban, freeze, delete, etc.)
router.patch('/users/:id', adminCtrl.updateUser);
// Delete user
router.delete('/users/:id', adminCtrl.deleteUser);

/**
 * TRANSACTIONS MANAGEMENT
 * Admin can approve/reject deposits and withdrawals
 */
// List all transactions (deposits, withdrawals, pending/approved/rejected)
router.get('/transactions', transactionsCtrl.listTransactions);
// Approve or reject transaction, credit user balance if needed
router.patch('/transactions/:id', transactionsCtrl.updateTransaction);

/**
 * TRADES MANAGEMENT
 * Admin can view and manually close/modify trades
 */
// List all trades (active and closed)
router.get('/trades', tradesCtrl.listTrades);
// Close or modify a trade manually (set result, exit price, notes)
router.patch('/trades/:id', tradesCtrl.updateTrade);

/**
 * VERIFICATIONS MANAGEMENT
 * Admin can approve/reject KYC and identity verifications
 */
// List all pending verifications
router.get('/verifications', verificationsCtrl.listVerifications);
// Approve or reject verification
router.patch('/verifications/:id', verificationsCtrl.updateVerification);

/**
 * SUPPORT TICKETS MANAGEMENT
 * Admin can respond to user support tickets
 */
// List all support tickets
router.get('/tickets', messagingCtrl.listTickets);
// Add reply to ticket or change status (open, in-progress, resolved, closed)
router.patch('/tickets/:id', messagingCtrl.updateTicket);

/**
 * MESSAGING
 * Admin can send direct messages and warnings to users
 */
// Send direct message, warning, or notice to a user
router.post('/messages', messagingCtrl.sendMessage);

/**
 * EMAIL
 * Admin can send emails to users
 */
// Send email to individual or bulk users
router.post('/email', messagingCtrl.sendEmail);

/**
 * UPGRADE PLANS
 * Admin can create, view, and modify upgrade plans
 */
// List all upgrade plans
router.get('/plans', adminCtrl.listPlans);
// Create new upgrade plan
router.post('/plans', adminCtrl.createPlan);
// Update plan details (name, price, features)
router.patch('/plans/:id', adminCtrl.updatePlan);
// Delete plan
router.delete('/plans/:id', adminCtrl.deletePlan);

export default router;
