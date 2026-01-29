import mongoose from "mongoose";
import { Roles } from "../constants/roles.js";

export const roleSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ["platform", "org", "team"],
      required: true,
    },
    role: {
      type: String,
      enum: [
        Roles.PLATFORM.SUPER_ADMIN,
        Roles.PLATFORM.STAFF,
        Roles.PLATFORM.USER,
        Roles.ORG.OWNER,
        Roles.ORG.CO_OWNER,
        Roles.ORG.MANAGER,
        Roles.ORG.STAFF,
        Roles.ORG.PLAYER,
        Roles.TEAM.OWNER,
        Roles.TEAM.MANAGER,
        Roles.TEAM.PLAYER,
      ],
      required: true,
    },
    scopeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: function () {
        return this.scope !== "platform";
      },
      refPath: "scopeModel",
    },
    scopeModel: {
      type: String,
      enum: ["Organization", "Team", "Organizer"],
      required: function () {
        return this.scope !== "platform";
      },
    },
  },
  { _id: false }
);
