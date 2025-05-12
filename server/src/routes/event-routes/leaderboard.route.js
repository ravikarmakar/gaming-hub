import express from "express";
import {
  createLeaderboardForRoundsGroups,
  getLeaderboardEntries,
  getLeaderboardByGroup,
} from "../../controllers/event-controllers/leaderboard.controller.js";
import { protectRoute } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", createLeaderboardForRoundsGroups);
router.get("/", getLeaderboardEntries);
router.get("/:groupId", protectRoute, getLeaderboardByGroup);

export default router;
