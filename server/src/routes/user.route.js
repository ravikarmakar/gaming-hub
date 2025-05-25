import express from "express";
import {
  getplayers,
  getUserProfile,
  searchByUsername,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getplayers);
router.get("/search-users", searchByUsername);
// router.get("/players", getplayers);
router.get("/:id", getUserProfile);

export default router;
