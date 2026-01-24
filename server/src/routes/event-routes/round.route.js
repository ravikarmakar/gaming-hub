import express from "express";
import {
  getRounds,
  createRound,
  getRoundDetails,
} from "../../controllers/event-controllers/round.controller.js";
import {
  isAuthenticated,
  isVerified,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated, isVerified);

router.post(
  "/create",
  createRound
);
router.get("/:roundId", getRoundDetails);
router.get("/", getRounds);

export default router;
