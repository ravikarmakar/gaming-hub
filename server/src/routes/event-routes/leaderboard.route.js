import express from "express";
import {
  createLeaderboardForRoundsGroups,
  getLeaderboardEntries,
  getLeaderboardByGroup,
  updateTeamScore,
  updateGroupResults
} from "../../controllers/event-controllers/leaderboard.controller.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { Scopes, Roles } from "../../constants/roles.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  createLeaderboardForRoundsGroups
);

router.get("/", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), getLeaderboardEntries);
router.get("/:groupId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), getLeaderboardByGroup);

router.put(
  "/:groupId/score",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  updateTeamScore
);

// ✅ Batch Update Results & Complete Group
router.put(
  "/:groupId/results",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  updateGroupResults
);

export default router;
