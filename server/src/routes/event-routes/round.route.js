import express from "express";
import {
  getRounds,
  createRound,
  getOneRound,
} from "../../controllers/event-controllers/round.controller.js";

const router = express.Router();

router.post("/:eventId/round", createRound);
router.get("/", getRounds);
router.get("/:roundId", getOneRound);

export default router;
