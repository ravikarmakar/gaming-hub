import express from "express";
import {
  createGroups,
  getGroups,
  groupDetails,
  updateGroup,
} from "../../controllers/event-controllers/group.controller.js";

const router = express.Router();

router.post(
  "/create",
  createGroups
);
router.put("/:groupId", updateGroup);
router.get("/:groupId", groupDetails);
router.get("/", getGroups);

export default router;
