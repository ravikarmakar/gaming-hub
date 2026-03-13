import mongoose from "mongoose";
import { Roles } from "../../shared/constants/roles.js";

/**
 * Role Schema for user permissions across different scopes.
 * 
 * Scope-to-ScopeModel Mapping:
 * - "platform" scope → No scopeModel needed (platform-wide roles)
 * - "org" scope → scopeModel: "Organization" or "Organizer" (organization roles)
 * - "team" scope → scopeModel: "Team" (team-specific roles)
 * 
 * Each scope has its own set of valid roles:
 * - Platform roles: super_admin, staff, user
 * - Org roles: owner, co_owner, manager, staff, player
 * - Team roles: owner, manager, player
 */
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
        Roles.ORG.STAFF,
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

// Cross-field validation: Ensure scope, role, and scopeModel are compatible
roleSchema.pre("validate", function (next) {
  const scope = this.scope;
  const role = this.role;
  const scopeModel = this.scopeModel;

  // Validate role matches scope
  if (scope === "platform") {
    const platformRoles = [Roles.PLATFORM.SUPER_ADMIN, Roles.PLATFORM.STAFF, Roles.PLATFORM.USER];
    if (!platformRoles.includes(role)) {
      return next(new Error(`Role "${role}" is not valid for platform scope`));
    }
    // Platform scope should not have scopeModel or scopeId
    if (scopeModel || this.scopeId) {
      return next(new Error("Platform scope should not have a scopeModel or scopeId"));
    }
  } else if (scope === "org") {
    const orgRoles = [
      Roles.ORG.OWNER,
      Roles.ORG.CO_OWNER,
      Roles.ORG.MANAGER,
      Roles.ORG.STAFF,
    ];
    if (!orgRoles.includes(role)) {
      return next(new Error(`Role "${role}" is not valid for org scope`));
    }
    // Org scope should have Organization or Organizer as scopeModel
    if (!["Organization", "Organizer"].includes(scopeModel)) {
      return next(new Error(`scopeModel "${scopeModel}" is not valid for org scope. Use "Organization" or "Organizer"`));
    }
  } else if (scope === "team") {
    const teamRoles = [Roles.TEAM.OWNER, Roles.TEAM.MANAGER, Roles.TEAM.PLAYER];
    if (!teamRoles.includes(role)) {
      return next(new Error(`Role "${role}" is not valid for team scope`));
    }
    // Team scope should have Team as scopeModel
    if (scopeModel !== "Team") {
      return next(new Error(`scopeModel "${scopeModel}" is not valid for team scope. Use "Team"`));
    }
  }

  next();
});
