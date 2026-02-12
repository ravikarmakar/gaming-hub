import express from "express";
import {
  getPlayers,
  getPlayerById,
} from "./user.controller.js";
import { isAuthenticated } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getPlayers);
router.get("/:id", getPlayerById);

export default router;
