import express from "express";
import * as adminController from "./admin.controller.js";
import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/rbac.middleware.js";
import { Scopes, Roles } from "../../shared/constants/roles.js";

const router = express.Router();

// All routes require Super Admin access
router.use(isAuthenticated);
router.use(authorize(Scopes.PLATFORM, [Roles.PLATFORM.SUPER_ADMIN]));

router.get("/stats", adminController.getDashboardStats);
router.get("/activity", adminController.getRecentActivity);
router.get("/entities/:type", adminController.getEntities);
router.patch("/entities/:type/:id/status", adminController.updateStatus);

export default router;
