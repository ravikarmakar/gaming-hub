import mongoose from "mongoose";
import { Roles } from "../config/roles.js";

const roleSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ["platform", "org"],
      required: true,
    },
    role: {
      type: String,
      enum: [
        Roles.PLATFORM.SUPER_ADMIN,
        Roles.PLATFORM.STAFF,
        Roles.PLATFORM.USER,
        Roles.ORG.OWNER,
        Roles.ORG.MANAGER,
        Roles.ORG.STAFF,
        Roles.ORG.PLAYER,
      ],
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: function () {
        return this.scope === "org";
      },
    },
  },
  { _id: false }
);

export default roleSchema;
