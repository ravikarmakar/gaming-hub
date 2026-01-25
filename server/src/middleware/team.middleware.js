import { findUserById } from "../services/user.service.js";
import { findTeamById } from "../services/team.service.js";
import { TryCatchHandler } from "./error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { TEAM_ACTIONS_ACCESS } from "../config/access.js";

/**
 * Middleware to ensure the user is part of a team.
 * Attaches userDoc and teamDoc to the request object.
 */
export const ensurePartOfTeam = TryCatchHandler(async (req, res, next) => {
    const user = await findUserById(req.user.userId);

    if (!user.teamId) {
        throw new CustomError("You are not part of any team.", 400);
    }

    const team = await findTeamById(user.teamId);

    if (team.isDeleted) {
        throw new CustomError("Team not found or has been deleted.", 404);
    }

    req.userDoc = user;
    req.teamDoc = team;
    next();
});

/**
 * Middleware to ensure the user is the captain of their team.
 * Can be used standalone or after ensurePartOfTeam.
 */
export const ensureTeamCaptain = TryCatchHandler(async (req, res, next) => {
    let team = req.teamDoc;
    let user = req.userDoc;

    if (!team) {
        user = await findUserById(req.user.userId);
        if (!user.teamId) throw new CustomError("You are not part of any team.", 400);
        team = await findTeamById(user.teamId);
        req.userDoc = user;
        req.teamDoc = team;
    }

    if (team.captain.toString() !== user._id.toString()) {
        throw new CustomError("Only the team captain can perform this action.", 403);
    }
    next();
});

/**
 * Middleware to ensure the user has specific system roles in the team.
 * Relies on ensurePartOfTeam having access to req.userDoc and req.teamDoc.
 * @param {string[]} allowedRoles - Array of allowed roles (e.g. [Roles.TEAM.OWNER, Roles.TEAM.MANAGER])
 */
export const verifyTeamRole = (allowedRoles) => {
    return TryCatchHandler(async (req, res, next) => {
        const team = req.teamDoc;
        const user = req.userDoc;

        // 1. Captain/Owner bypass (always allowed)
        if (team.captain.toString() === user._id.toString()) {
            return next();
        }

        // 2. Check User Roles
        const hasrole = user.roles.some(
            (r) =>
                r.scope === "team" &&
                r.scopeId.toString() === team._id.toString() &&
                allowedRoles.includes(r.role)
        );

        if (!hasrole) {
            throw new CustomError("You do not have permission to perform this action.", 403);
        }

        next();
    });
};

/**
 * Middleware to verify if the user has permission to perform a specific action.
 * @param {string} action - The action to check (e.g. TEAM_ACTIONS.removeMember)
 */
export const verifyTeamPermission = (action) => {
    return TryCatchHandler(async (req, res, next) => {
        const team = req.teamDoc;
        const user = req.userDoc;
        const allowedRoles = TEAM_ACTIONS_ACCESS[action];

        if (!allowedRoles) {
            throw new CustomError("Invalid action or no permissions defined for this action.", 500);
        }

        // 1. Captain/Owner bypass (always allowed)
        if (team.captain.toString() === user._id.toString()) {
            return next();
        }

        // 2. Check User Roles
        const hasPermission = user.roles.some(
            (r) =>
                r.scope === "team" &&
                r.scopeId.toString() === team._id.toString() &&
                allowedRoles.includes(r.role)
        );

        if (!hasPermission) {
            throw new CustomError("You do not have permission to perform this action.", 403);
        }

        next();
    });
};
