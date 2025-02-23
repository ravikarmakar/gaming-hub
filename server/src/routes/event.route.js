import express from "express";
import {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

// Event Routes
router.get("/", getAllEvents);
router.post("/create", createEvent);
router.get("/:id", getSingleEvent);
router.put("/:eventId", updateEvent);
router.delete("/:eventId", deleteEvent);
// router.get("/featured", featuredEvents);
// router.get("/trending", TrendingEvents);
// router.get("/organizer/:id");

export default router;
