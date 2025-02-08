import express from "express";
import { createPrizeForEvent } from "../../controllers/event-controllers/prize.controller.js";

const router = express.Router();

router.post("/:eventId", createPrizeForEvent);

export default router;
