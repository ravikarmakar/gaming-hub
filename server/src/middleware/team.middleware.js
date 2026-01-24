import { findUserById } from "../services/user.service.js";
import { findTeamById } from "../services/team.service.js";
import { TryCatchHandler } from "./error.middleware.js";
import { CustomError } from "../utils/CustomError.js";

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
