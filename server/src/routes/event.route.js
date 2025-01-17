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
router.get("/:id", getSingleEvent);
router.get("/organizer/:id");
router.post("/create", createEvent);
router.put("/:eventId", updateEvent);
router.delete("/:eventId", deleteEvent);

export default router;
