import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventDetails,
  updateEvent,
  deleteEvent,
  registerEvent,
  leaveEvent,
  closeRegistration,
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
// router.put("/remove-team/:eventId/:teamId", protectRoute, removeTeam); // to-do
router.patch("/close-registration/:eventId", protectRoute, closeRegistration);

// router.get("/featured", featuredEvents);
// router.get("/trending", TrendingEvents);
// router.get("/organizer/:id");

export default router;

// ✅ PATCH /events/:eventId/close-registration → Registration close karna
// ✅ POST /events/:eventId/start-round → Round create karna aur teams ko groups me assign karna
// ✅ GET /events/:eventId/groups → Group-wise teams ka data
// ✅ PATCH /events/:eventId/groups/:groupId/leaderboard → Score update karna
// ✅ GET /events/:eventId/groups/:groupId/leaderboard → Leaderboard fetch karna
// ✅ POST /events/:eventId/next-round → Next round ke qualified teams ko set karna
