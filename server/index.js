// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg"); // or any DB driver you use

const app = express();
app.use(cors({ origin: "https://your-frontend-domain.com", credentials: true }));
app.use(helmet());
app.use(express.json());

/* --------------------------------------------------------------
   DB – replace with your own connection / ORM
-------------------------------------------------------------- */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/* --------------------------------------------------------------
   Middleware – verify JWT & attach user object to req.user
-------------------------------------------------------------- */
const authenticate = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.sendStatus(401);
    const token = auth.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [
            payload.sub,
        ]);
        if (!rows[0]) return res.sendStatus(401);
        req.user = rows[0]; // contains id, email, role, etc.
        next();
    } catch (e) {
        console.error(e);
        res.sendStatus(401);
    }
};

/* --------------------------------------------------------------
   ADMIN‑ONLY middleware
-------------------------------------------------------------- */
const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    next();
};

/* --------------------------------------------------------------
   1️⃣ Auth – login (returns JWT)
-------------------------------------------------------------- */
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const { rows } = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.json({ token });
});

/* --------------------------------------------------------------
   2️⃣ Get current user (used by front‑end to know role)
-------------------------------------------------------------- */
app.get("/api/user/me", authenticate, async (req, res) => {
    const { id, email, role, balance_usd, roi } = req.user;
    res.json({ id, email, role, balanceUsd: balance_usd, roi });
});

/* --------------------------------------------------------------
   ADMIN ROUTES – all protected by authenticate + requireAdmin
-------------------------------------------------------------- */
const adminRouter = express.Router();
adminRouter.use(authenticate, requireAdmin);

/* ----- Users ----- */
adminRouter.get("/users", async (req, res) => {
    const { rows } = await pool.query(
        "SELECT id, email, role, created_at AS \"createdAt\" FROM users ORDER BY id ASC"
    );
    res.json(rows);
});

adminRouter.post("/users", async (req, res) => {
    const { email, password, role = "trader" } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
        "INSERT INTO users (email, password, role) VALUES ($1, $2, $3)",
        [email, hash, role]
    );
    res.json({ success: true });
});

adminRouter.patch("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { email, role } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (email) {
        fields.push(`email=$${idx++}`);
        values.push(email);
    }
    if (role) {
        fields.push(`role=$${idx++}`);
        values.push(role);
    }
    if (fields.length === 0) return res.json({ success: true });

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id=$${idx}`;
    await pool.query(sql, values);
    res.json({ success: true });
});

adminRouter.post("/users/:id/password", async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hash, id]);
    res.json({ success: true });
});

adminRouter.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ success: true });
});

/* ----- Upgrade Plans ----- */
adminRouter.get("/plans", async (req, res) => {
    const { rows } = await pool.query(
        `SELECT id, name, price_monthly AS "priceMonthly", price_annual AS "priceAnnual", features
     FROM upgrade_plans ORDER BY id ASC`
    );
    // Assuming `features` is stored as a JSON array in the DB
    res.json(rows);
});

adminRouter.post("/plans", async (req, res) => {
    const { name, priceMonthly, priceAnnual, features } = req.body;
    await pool.query(
        `INSERT INTO upgrade_plans (name, price_monthly, price_annual, features)
     VALUES ($1, $2, $3, $4)`,
        [name, priceMonthly, priceAnnual, JSON.stringify(features)]
    );
    res.json({ success: true });
});

adminRouter.patch("/plans/:id", async (req, res) => {
    const { id } = req.params;
    const { name, priceMonthly, priceAnnual, features } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
        fields.push(`name=$${idx++}`);
        values.push(name);
    }
    if (priceMonthly !== undefined) {
        fields.push(`price_monthly=$${idx++}`);
        values.push(priceMonthly);
    }
    if (priceAnnual !== undefined) {
        fields.push(`price_annual=$${idx++}`);
        values.push(priceAnnual);
    }
    if (features) {
        fields.push(`features=$${idx++}`);
        values.push(JSON.stringify(features));
    }
    if (fields.length === 0) return res.json({ success: true });

    values.push(id);
    const sql = `UPDATE upgrade_plans SET ${fields.join(", ")} WHERE id=$${idx}`;
    await pool.query(sql, values);
    res.json({ success: true });
});

adminRouter.delete("/plans/:id", async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM upgrade_plans WHERE id=$1", [id]);
    res.json({ success: true });
});

/* Mount admin router */
app.use("/api/admin", adminRouter);

/* --------------------------------------------------------------
   Global error handler (optional but nice)
-------------------------------------------------------------- */
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

/* --------------------------------------------------------------
   Start server
-------------------------------------------------------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API listening on ${PORT}`));