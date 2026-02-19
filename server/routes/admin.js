import express from "express";
import * as adminCtrl from "../controllers/adminController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();
router.use(authenticate, requireAdmin);

// Users
router.get('/users', adminCtrl.listUsers);
router.post('/users', adminCtrl.createUser);
router.patch('/users/:id', adminCtrl.updateUser);
router.delete('/users/:id', adminCtrl.deleteUser);

// Plans
router.get('/plans', adminCtrl.listPlans);
router.post('/plans', adminCtrl.createPlan);
router.patch('/plans/:id', adminCtrl.updatePlan);
router.delete('/plans/:id', adminCtrl.deletePlan);

export default router;
