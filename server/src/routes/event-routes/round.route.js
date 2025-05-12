import express from "express";
import {
  getRounds,
  createRound,
  getRoundDetails,
} from "../../controllers/event-controllers/round.controller.js";
import {
  protectRoute,
  authorizeRoles,
} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  protectRoute,
  authorizeRoles("organizer", "moderator", "staff"),
  createRound
);
router.get("/:roundId", protectRoute, getRoundDetails);
router.get("/", getRounds);

export default router;
