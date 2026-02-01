import express from "express";
import {
  getRounds,
  createRound,
  getRoundDetails,
  updateRound,
  deleteRound,
} from "../../controllers/event-controllers/round.controller.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { Scopes, Roles } from "../../constants/roles.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  createRound
);

router.put(
  "/:roundId",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.MANAGER], { parentScope: Scopes.ORG }),
  updateRound
);

router.delete(
  "/:roundId",
  isAuthenticated,
  authorize(Scopes.EVENT, [Roles.ORG.OWNER, Roles.ORG.CO_OWNER], { parentScope: Scopes.ORG }),
  deleteRound
);

router.get("/:roundId", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), getRoundDetails);
router.get("/", isAuthenticated, authorize(Scopes.PLATFORM, [Roles.PLATFORM.USER]), getRounds);

export default router;
