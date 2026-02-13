import express from "express";
import {
  getPlayers,
  getPlayerById,
} from "./user.controller.js";
import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getPlayers);
router.get("/:id", getPlayerById);

// Fix for reported missing endpoints
import { updatePlayerRole, addStaff } from "./user.controller.js";
import { authorize } from "../../shared/middleware/rbac.middleware.js";
import { Scopes, Roles } from "../../shared/constants/roles.js";

router.put("/:id/update-role", updatePlayerRole); // Self/Admin check in controller or add middleware
router.post("/add-staff", authorize(Scopes.PLATFORM, [Roles.PLATFORM.ADMIN, Roles.PLATFORM.OWNER]), addStaff);

export default router;
