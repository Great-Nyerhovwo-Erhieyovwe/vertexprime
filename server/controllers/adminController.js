import { provider } from "../services/dataProvider.js";

export async function listUsers(req, res) {
    try {
        const users = await provider.find('users', {});
        return res.json(users.map(u => ({ id: u._id || u.id, email: u.email, role: u.role, createdAt: u.createdAt })));
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function createUser(req, res) {
    try {
        const { email, password, role = 'trader' } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
        const result = await provider.insertOne('users', { email, password, role, createdAt: new Date(), emailVerified: false, balanceUsd: 0, roi: 0 });
        return res.json({ success: true, id: result.insertedId || (result.ops && result.ops[0]?._id) });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { email, role } = req.body;
        const updates = {};
        if (email) updates.email = email;
        if (role) updates.role = role;
        if (Object.keys(updates).length === 0) return res.json({ success: true });
        await provider.updateOne('users', { _id: id }, updates);
        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        await provider.deleteOne('users', { _id: id });
        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}

// Plans
export async function listPlans(req, res) {
    try {
        const plans = await provider.find('upgrade_plans', {});
        return res.json(plans);
    } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function createPlan(req, res) {
    try {
        const { name, priceMonthly, priceAnnual, features } = req.body;
        await provider.insertOne('upgrade_plans', { name, priceMonthly, priceAnnual, features, createdAt: new Date() });
        return res.json({ success: true });
    } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function updatePlan(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        await provider.updateOne('upgrade_plans', { _id: id }, updates);
        return res.json({ success: true });
    } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}

export async function deletePlan(req, res) {
    try {
        const { id } = req.params;
        await provider.deleteOne('upgrade_plans', { _id: id });
        return res.json({ success: true });
    } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
}
