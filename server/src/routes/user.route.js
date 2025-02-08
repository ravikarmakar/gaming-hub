import express from "express";
import { getAllUsers, getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserProfile);

export default router;
