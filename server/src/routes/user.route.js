import express from "express";
import { getplayers, getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getplayers);
// router.get("/players", getplayers);
router.get("/:id", getUserProfile);

export default router;
