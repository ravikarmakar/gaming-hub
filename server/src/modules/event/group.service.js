import mongoose from "mongoose";
import Group from "./models/group.model.js";
import Round from "./models/round.model.js";
import Event from "./event.model.js";
import Team from "../team/team.model.js";
import EventRegistration from "./models/event-registration.model.js";
import Leaderboard from "./models/leaderBoard.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { getTournamentRegistrants } from "../../shared/utils/tournament.js";
import { logger } from "../../shared/utils/logger.js";

/**
 * Strategy methods for Invitations
 */

export const validateInvitation = async (inviteeId, groupId, session = null) => {
    const group = await Group.findById(groupId).session(session);
    if (!group) throw new CustomError("Group not found", 404);

    // Sender must be an official of the event's organization
    const round = await Round.findById(group.roundId).populate("eventId").session(session);
    if (!round || !round.eventId) throw new CustomError("Round or Event not found", 404);
    
    // We assume RBAC middleware handles general organizer permissions, 
    // but we check if the group already has this team.
    if (group.teams.some(teamId => teamId.equals(inviteeId))) {
        throw new CustomError("This team is already in the group", 400);
    }

    return { resource: group };
};

export const acceptInvitation = async (userId, groupId, session = null) => {
    // userId is the person accepting (Team Captain/Owner)
    const team = await Team.findOne({ captain: userId }).session(session);
    if (!team) throw new CustomError("You must be a team captain to accept group invitations", 403);

    // Check capacity (Standard 12 teams) with atomic check
    const updatedGroup = await Group.findOneAndUpdate(
        { _id: groupId, $expr: { $lt: [{ $size: "$teams" }, 12] }, teams: { $ne: team._id } },
        { $push: { teams: team._id } },
        { session, new: true }
    );

    if (!updatedGroup) {
        // Double check why it failed
        const group = await Group.findById(groupId).session(session);
        if (!group) throw new CustomError("Group not found", 404);
        if (group.teams.some(teamId => teamId.equals(team._id))) {
            throw new CustomError("Team already in group", 400);
        }
        if (group.teams.length >= 12) {
            throw new CustomError("Group is full", 400);
        }
    }

    const round = await Round.findById(group.roundId).populate("eventId").session(session);
    if (!round) throw new CustomError("Round not found", 404);

    // 1. Ensure team is registered for the event
    let registration = await EventRegistration.findOne({
        eventId: round.eventId._id,
        teamId: team._id
    }).session(session);

    if (!registration) {
        // If not registered, create an approved registration (Invited flow)
        const { players, substitutes } = getTournamentRegistrants(team.teamMembers);
        
        // Atomic Slot Increment for Event
        const updatedEvent = await Event.findOneAndUpdate(
            {
                _id: round.eventId._id,
                $expr: {
                    $or: [
                        { $eq: ["$maxSlots", null] },
                        { $lt: ["$joinedSlots", "$maxSlots"] }
                    ]
                }
            },
            { $inc: { joinedSlots: 1 }, $push: { registeredTeams: team._id } },
            { new: true, session }
        );

        if (!updatedEvent) {
            throw new CustomError("Event slots are full", 400);
        }

        registration = await EventRegistration.create([{
            eventId: round.eventId._id,
            teamId: team._id,
            status: "approved",
            players,
            substitutes,
        }], { session });
        
        // Spread is because create returns an array when session is used
        if (Array.isArray(registration)) registration = registration[0];
    }

    // 2. Add team to group handled above atomically

    // 3. Update Leaderboard
    const leaderboard = await Leaderboard.findOneAndUpdate(
        { groupId: group._id },
        { 
            $push: { 
                teamScore: {
                    teamId: team._id,
                    score: 0,
                    kills: 0,
                    wins: 0
                }
            } 
        },
        { session, new: true }
    );

    if (!leaderboard) {
        throw new CustomError("Leaderboard not found for this group", 404);
    }

    return {
        resultMessage: `Successfully joined ${updatedGroup.groupName}`,
        cacheKeys: [`event_details:${round.eventId._id}`, `group_details:${updatedGroup._id}`],
        socketData: null // Group chat sync is handled via chat gateway if needed
    };
};
