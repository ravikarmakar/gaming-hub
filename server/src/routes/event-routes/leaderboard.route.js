import express from "express";

import {
  createLeaderboardForRoundsGroups,
  getLeaderboardEntries,
  getLeaderboardByGroup,
  updateTeamScore,
  updateGroupResults
} from "../../controllers/event-controllers/leaderboard.controller.js";

const router = express.Router();

router.post("/create", createLeaderboardForRoundsGroups);
router.get("/", getLeaderboardEntries);
router.get("/:groupId", getLeaderboardByGroup);
router.put("/:groupId/score", updateTeamScore);
// ✅ Batch Update Results & Complete Group
router.put("/:groupId/results", updateGroupResults);

export default router;
