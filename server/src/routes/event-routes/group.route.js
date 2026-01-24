import express from "express";
import {
  createGroups,
  getGroups,
  groupDetails,
} from "../../controllers/event-controllers/group.controller.js";

const router = express.Router();

router.post(
  "/create",
  createGroups
);
router.get("/:groupId", groupDetails);
router.get("/", getGroups);

export default router;
