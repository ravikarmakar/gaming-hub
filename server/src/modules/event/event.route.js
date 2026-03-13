import express from "express";
import { authorize } from "../../shared/middleware/rbac.middleware.js";
import { Scopes, Roles } from "../../shared/constants/roles.js";
import { upload } from "../../shared/middleware/multer.middleware.js";
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
  fetchTournamentsByTeam,
  fetchInvitedTeams,
  fetchT1SpecialTeams,
} from "./event.controller.js";

import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";
import { cache } from "../../shared/middleware/cache.middleware.js";

const router = express.Router();

// Public routes
router.get("/all-events", cache(300), fetchAllEvents);
router.get("/org-events/:orgId", cache(300), fetchEventByOrg);
router.get("/event-details/:eventId", cache(300), fetchEventDetailsById);

// Protected routes (RBAC handled by authorize)
router.post("/create-event", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), upload.single("image"), createEvent);
router.post("/register-event/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), registerEvent);
router.get("/is-registered/:eventId/teams/:teamId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), cache(300), isTeamRegistered);
router.get("/registered-teams/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), fetchAllRegisteredTeams);
router.get("/invited-teams/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), fetchInvitedTeams);
router.get("/t1-special-teams/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), fetchT1SpecialTeams);
router.get("/team-events/:teamId", isAuthenticated, cache(300), fetchTournamentsByTeam);

router.put("/:eventId", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), upload.single("image"), updateEvent);
router.put("/unregister/:eventId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER], { attachDoc: true }), unregisterEvent);
router.delete("/:eventId", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { parentScope: Scopes.ORG, attachDoc: true }), deleteEvent);
router.patch("/close-registration/:eventId", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), closeRegistration);
router.post("/:eventId/start", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), startEvent);
router.post("/:eventId/finish", isAuthenticated, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), finishEvent);

export default router;
