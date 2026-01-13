import express from "express";

import {
  createEvent,
  fetchEventByOrg,
  fetchEventDetailsById,
  getAllEvents,
  getEventDetails,
  updateEvent,
  deleteEvent,
  registerEvent,
  leaveEvent,
  closeRegistration,
} from "../controllers/event.controller.js";
import { authorizeRoles, protectRoute } from "../middleware/authMiddleware.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.get("/", getAllEvents);

router.use(isAuthenticated);

router.post("/create-event", upload.single("image"), createEvent);
router.get("/org-events/:orgId", fetchEventByOrg);
router.get("/event-details/:eventId", fetchEventDetailsById);

router.get("/:eventId", getEventDetails);
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
