import express from "express";
import {
  createGroups,
  getGroups,
  groupDetails,
  updateGroup,
} from "../controllers/group.controller.js";
import { authorize } from "../../../shared/middleware/rbac.middleware.js";
import { isAuthenticated } from "../../../shared/middleware/auth.middleware.js";
import { Scopes, Roles } from "../../../shared/constants/roles.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  createGroups
);

router.put(
  "/:groupId",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  updateGroup
);

router.get("/:groupId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), groupDetails);
router.get("/", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), getGroups);

export default router;
