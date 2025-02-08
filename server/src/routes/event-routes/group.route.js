import express from "express";
import {
  createGroup,
  getGroups,
  getOneGroup,
} from "../../controllers/event-controllers/group.controller.js";

const router = express.Router();

router.post("/:roundId/group", createGroup);
router.get("/", getGroups);
router.get("/:groupId", getOneGroup);

export default router;
