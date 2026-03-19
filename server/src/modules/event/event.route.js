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
  toggleLikeEvent,
} from "./event.controller.js";

import { validateEventId, attachEventDoc, verifyUserTeam } from "./event.middleware.js";
import { isAuthenticated, optionalAuthenticate, isVerified } from "../../shared/middleware/auth.middleware.js";
import { cache } from "../../shared/middleware/cache.middleware.js";

const router = express.Router();

// Public routes
router.get("/all-events", cache(300), fetchAllEvents);
router.get("/org-events/:orgId", cache(300), fetchEventByOrg);
router.get("/event-details/:eventId", optionalAuthenticate, validateEventId, attachEventDoc, cache(300), fetchEventDetailsById);

// Protected routes (RBAC handled by authorize)
router.post("/create-event", isAuthenticated, isVerified, authorize(Scopes.ORG, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER, Roles.ORG.MANAGER]), upload.single("image"), createEvent);
router.post("/register-event/:eventId", isAuthenticated, validateEventId, attachEventDoc, verifyUserTeam, registerEvent);
router.get("/is-registered/:eventId/teams/:teamId", isAuthenticated, validateEventId, cache(300), isTeamRegistered);
router.get("/registered-teams/:eventId", isAuthenticated, validateEventId, attachEventDoc, fetchAllRegisteredTeams);
router.get("/invited-teams/:eventId", isAuthenticated, validateEventId, attachEventDoc, fetchInvitedTeams);
router.get("/t1-special-teams/:eventId", isAuthenticated, validateEventId, attachEventDoc, fetchT1SpecialTeams);
router.get("/team-events/:teamId", isAuthenticated, cache(300), fetchTournamentsByTeam);

router.put("/:eventId", isAuthenticated, isVerified, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), upload.single("image"), updateEvent);
router.put("/unregister/:eventId", isAuthenticated, validateEventId, attachEventDoc, verifyUserTeam, unregisterEvent);
router.delete("/:eventId", isAuthenticated, isVerified, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { parentScope: Scopes.ORG, attachDoc: true }), deleteEvent);
router.patch("/close-registration/:eventId", isAuthenticated, isVerified, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), closeRegistration);
router.post("/:eventId/start", isAuthenticated, isVerified, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), startEvent);
router.post("/:eventId/finish", isAuthenticated, isVerified, authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG, attachDoc: true }), finishEvent);
router.post("/:eventId/like", isAuthenticated, validateEventId, attachEventDoc, toggleLikeEvent);

export default router;
