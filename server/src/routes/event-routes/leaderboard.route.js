import express from "express";
import {
  createLeaderboardForRoundsGroups,
  getLeaderboardEntries,
  getLeaderboardByGroup,
} from "../../controllers/event-controllers/leaderboard.controller.js";

const router = express.Router();

router.post("/create", createLeaderboardForRoundsGroups);
router.get("/", getLeaderboardEntries);
router.get("/:groupId", getLeaderboardByGroup);

export default router;
