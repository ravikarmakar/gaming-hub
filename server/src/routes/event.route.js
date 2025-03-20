import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventDetails,
  updateEvent,
  deleteEvent,
  registerEvent,
  leaveEvent,
} from "../controllers/event.controller.js";
import { authorizeRoles, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/:eventId", getEventDetails);
router.post("/", protectRoute, authorizeRoles("organizer"), createEvent);
router.put("/:eventId", authorizeRoles("organizer"), updateEvent);
router.delete("/:eventId", authorizeRoles("organizer"), deleteEvent);
router.post("/register/:eventId", protectRoute, registerEvent);
router.put("/unregister/:eventId", protectRoute, leaveEvent);
// router.get("/featured", featuredEvents);
// router.get("/trending", TrendingEvents);
// router.get("/organizer/:id");

export default router;
