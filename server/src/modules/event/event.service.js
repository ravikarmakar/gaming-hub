import Event from "./event.model.js";
import User from "../user/user.model.js";
import Team from "../team/team.model.js";
import Organizer from "../organizer/organizer.model.js";
import EventRegistration from "./models/event-registration.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { getTournamentRegistrants } from "../../shared/utils/tournament.js";

export const findEventById = async (id) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }
  return event;
};

/**
 * Strategy methods for Join Requests
 */

export const validateJoinRequest = async (userId, eventId, session = null) => {
  const q = Event.findById(eventId);
  if (session) q.session(session);
  const event = await q;

  if (!event || event.isDeleted) throw new CustomError("Event not found", 404);

  const orgQuery = event.orgId ? Organizer.findById(event.orgId) : null;
  if (orgQuery && session) orgQuery.session(session);
  const recipientId = orgQuery ? (await orgQuery)?.ownerId : (event.organizerId || event.createdBy || event.ownerId);

  return { resource: event, recipientId };
};

export const acceptJoinRequest = async (requesterId, eventId, handledBy, session = null) => {
  const requesterQuery = User.findById(requesterId);
  if (session) requesterQuery.session(session);
  const requester = await requesterQuery;
  if (!requester) throw new CustomError("Requester not found", 404);

  if (!requester.teamId) throw new CustomError("Requester must have a team to join events", 400);

  const event = await Event.findById(eventId);
  if (!event || event.isDeleted) throw new CustomError("Event no longer exists", 404);

  const teamQuery = Team.findById(requester.teamId);
  if (session) teamQuery.session(session);
  const team = await teamQuery;
  if (!team) throw new CustomError("Team not found", 404);

  // Atomic update for slots
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      $expr: {
        $or: [
          { $eq: ["$maxSlots", null] },
          { $lt: ["$joinedSlots", "$maxSlots"] }
        ]
      }
    },
    { $inc: { joinedSlots: 1 }, $push: { registeredTeams: requester.teamId } },
    { new: true, session }
  );

  if (!updatedEvent) {
    throw new CustomError("Event is full. Registration could not be completed.", 400);
  }

  const { players, substitutes } = getTournamentRegistrants(team.teamMembers);

  if (players.length < 4) {
    throw new CustomError("Team must have an IGL, Rusher, Sniper, and Support to join.", 400);
  }


  await EventRegistration.create([{
    eventId: eventId,
    teamId: requester.teamId,
    status: "approved",
    players,
    substitutes,
  }], { session });

  await createNotification({
    recipient: requesterId,
    sender: handledBy,
    type: "EVENT_REGISTRATION_SUCCESS",
    content: { title: "Deployment Approved!", message: `Your team joined ${event.title}.` },
    relatedData: { eventId },
  }, { session });

  return {
    responseData: null,
    socketEventData: null,
    requesterId,
    cacheKeys: [`user_profile:${requesterId}`]
  };
};
