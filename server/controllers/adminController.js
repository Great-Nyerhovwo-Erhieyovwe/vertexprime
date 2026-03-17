import { provider } from "../services/dataProvider.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Admin summary: aggregate basic metrics
export async function adminSummary(req, res) {
  try {
    const users = await provider.find("users", {});
    const transactions = await provider.find("transactions", {});
    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.emailVerified).length;
    const activeUsers = users.filter(u => (u.balanceUsd || 0) > 0).length;
    const totalDeposits = transactions.filter(t => t.type === "deposit" && t.status === "approved").reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const totalWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "approved").reduce((s, t) => s + (Number(t.amount) || 0), 0);

    return res.json({ totalUsers, verifiedUsers, activeUsers, totalDeposits, totalWithdrawals });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

// Admin login: try DB user first, then fallback to env-admin
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await provider.findOne('users', { email });
    if (user) {
      const ok = await bcrypt.compare(password, user.password || '');
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      if (user.role !== 'admin') return res.status(403).json({ message: 'Not authorized as admin' });
      const sub = (user._id || user.id)?.toString() || user.email;
      const token = jwt.sign({ sub, role: 'admin' }, process.env.JWT_SECRET || process.env.VITE_JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || process.env.VITE_JWT_EXPIRES_IN || '24h' });
      return res.json({ success: true, token, user: { id: sub, email: user.email, role: 'admin' } });
    }

    // fallback to env-configured admin
    const adminEmail = process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
    const adminPass = process.env.VITE_ADMIN_PASS || process.env.ADMIN_PASS;
    if (email !== adminEmail || password !== adminPass) return res.status(401).json({ message: 'Invalid admin credentials' });
    const sub = adminEmail;
    const token = jwt.sign({ sub, role: 'admin' }, process.env.JWT_SECRET || process.env.VITE_JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || process.env.VITE_JWT_EXPIRES_IN || '24h' });
    return res.json({ success: true, token, user: { id: sub, email: adminEmail, role: 'admin' } });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

// Users CRUD
export async function listUsers(req, res) {
  try {
    const users = await provider.find('users', {});
    return res.json(users);
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function createUser(req, res) {
  try {
    const payload = req.body || {};
    if (!payload.email || !payload.password) return res.status(400).json({ message: 'Missing fields' });
    // hash password
    payload.password = await bcrypt.hash(payload.password, 10);
    const result = await provider.insertOne('users', { ...payload, createdAt: new Date().toISOString() });
    return res.json({ success: true, result });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    // prevent accidental overwrite of _id
    delete updates._id; delete updates.id;
    const result = await provider.updateOne('users', { _id: id }, updates);
    return res.json({ success: true, result });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const result = await provider.deleteOne('users', { _id: id });
    return res.json({ success: true, result });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

// Plans CRUD
export async function listPlans(req, res) {
  try {
    const plans = await provider.find('upgrade_plans', {});
    return res.json(plans);
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function createPlan(req, res) {
  try {
    const payload = req.body || {};
    payload.createdAt = new Date().toISOString();
    const result = await provider.insertOne('upgrade_plans', payload);
    return res.json({ success: true, result });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const result = await provider.updateOne('upgrade_plans', { _id: id }, updates);
    return res.json({ success: true, result });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    const result = await provider.deleteOne('upgrade_plans', { _id: id });
    return res.json({ success: true, result });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}
