import express from "express";

import {
  getAllPlayers,
  getPlayerById,
  searchByUsername,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getAllPlayers);
router.get("/search-users", searchByUsername);
router.get("/:id", getPlayerById);

export default router;
