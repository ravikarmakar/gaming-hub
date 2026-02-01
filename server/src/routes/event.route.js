import express from "express";
import { authorize } from "../middleware/rbac.middleware.js";
import { Scopes, Roles } from "../constants/roles.js";
import { upload } from "../middleware/multer.middleware.js";
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
  unregisterEvent,
  startEvent,
  finishEvent,
} from "../controllers/event.controller.js";

import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/all-events", fetchAllEvents);

// Protected routes (RBAC handled by authorize)
router.post("/create-event", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), upload.single("image"), createEvent);
router.get("/org-events/:orgId", isAuthenticated, authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.MANAGER, Roles.ORG.STAFF]), fetchEventByOrg);
router.get("/event-details/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), fetchEventDetailsById);
router.post("/register-event/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), registerEvent);
router.get("/is-registered/:eventId/teams/:teamId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), isTeamRegistered);
router.get("/registered-teams/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), fetchAllRegisteredTeams);

router.put("/:eventId", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), upload.single("image"), updateEvent);
router.put("/unregister/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), unregisterEvent);
router.delete("/:eventId", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { parentScope: Scopes.ORG, attachDoc: true }), deleteEvent);
router.patch("/close-registration/:eventId", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), closeRegistration);
router.post("/:eventId/start", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), startEvent);
router.post("/:eventId/finish", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), finishEvent);

export default router;
