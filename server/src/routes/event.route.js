import express from "express";

import {
  createEvent,
  fetchEventByOrg,
  fetchEventDetailsById,
  fetchAllEvents,
  registerEvent,
  isTeamRegistered,
  fetchAllRegisteredTeams,
  updateEvent,
  deleteEvent,
  closeRegistration,
} from "../controllers/event.controller.js";
import { authorizeRoles, protectRoute } from "../middleware/authMiddleware.js";
import { isAuthenticated, isVerified } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

// router.get("/", getAllEvents);
router.get("/all-events", fetchAllEvents);

router.use(isAuthenticated, isVerified);

router.post("/create-event", upload.single("image"), createEvent);
router.get("/org-events/:orgId", fetchEventByOrg);
router.get("/event-details/:eventId", fetchEventDetailsById);
router.post("/register-event/:eventId", registerEvent);
router.get("/is-registered/:eventId/teams/:teamId", isTeamRegistered);
router.get("/registered-teams/:eventId", fetchAllRegisteredTeams);

router.put("/:eventId", authorizeRoles("organizer"), updateEvent);
router.delete("/:eventId", authorizeRoles("organizer"), deleteEvent);
// router.put("/remove-team/:eventId/:teamId", protectRoute, removeTeam); // to-do
router.patch("/close-registration/:eventId", protectRoute, closeRegistration);

// router.get("/featured", featuredEvents);
// router.get("/trending", TrendingEvents);

export default router;

// ✅ GET /events/:eventId/groups/:groupId/leaderboard → Leaderboard fetch karna
