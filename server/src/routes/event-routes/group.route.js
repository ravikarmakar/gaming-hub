import express from "express";
import {
  createGroups,
  getGroups,
  groupDetails,
  updateGroup,
} from "../../controllers/event-controllers/group.controller.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { Scopes, Roles } from "../../constants/roles.js";

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
