import mongoose from "mongoose";
import { CustomError } from "../../shared/utils/CustomError.js";
import Event from "./event.model.js";
import User from "../user/user.model.js";
import Team from "../team/team.model.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";

/**
 * Validates that eventId is a valid ObjectId
 */
export const validateEventId = (req, res, next) => {
    const { eventId } = req.params;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        return next(new CustomError("Invalid Event ID", 400));
    }
    next();
};

/**
 * Fetches the event and attaches it to req.eventDoc
 * Assumes eventId has been validated
 */
export const attachEventDoc = TryCatchHandler(async (req, res, next) => {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
        throw new CustomError("Event not found", 404);
    }
    req.eventDoc = event;
    next();
});

/**
 * Verifies the user has a team and attaches it to req.teamDoc
 */
export const verifyUserTeam = TryCatchHandler(async (req, res, next) => {
    const { userId } = req.user;
    const user = await User.findById(userId).select("teamId");
    
    if (!user || !user.teamId) {
        throw new CustomError("You are not part of any team", 400);
    }

    const team = await Team.findById(user.teamId);
    if (!team) {
        throw new CustomError("Team not found", 404);
    }

    req.teamDoc = team;
    next();
});
