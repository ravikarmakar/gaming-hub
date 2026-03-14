import express from "express";
import {
  createGroups,
  createSingleGroup,
  getGroups,
  groupDetails,
  updateGroup,
  deleteGroup,
  injectTeam,
  mergeQualifiedTeamsIntoGroup,
} from "../controllers/group.controller.js";
import { authorize } from "../../../shared/middleware/rbac.middleware.js";
import { isAuthenticated } from "../../../shared/middleware/auth.middleware.js";
import { Scopes, Roles } from "../../../shared/constants/roles.js";

const router = express.Router();

router.post(
  "/manual-create",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  createSingleGroup
);

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

router.post(
  "/inject-team",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  injectTeam
);

router.delete(
  "/:groupId",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  deleteGroup
);

router.post(
  "/:groupId/merge-qualified",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  mergeQualifiedTeamsIntoGroup
);

router.get("/:groupId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), groupDetails);
router.get("/", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), getGroups);

export default router;
