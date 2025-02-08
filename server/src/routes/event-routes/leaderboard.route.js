import express from "express";
import {
  createLeaderboardEntry,
  getLeaderboardEntries,
} from "../../controllers/event-controllers/leaderboard.controller.js";

const router = express.Router();

router.post("/:groupId/leaderboard", createLeaderboardEntry); // Create a new leaderboard entry
router.get("/", getLeaderboardEntries); // Fetch all leaderboard entries

export default router;
