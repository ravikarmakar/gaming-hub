import Event from "./event.model.js";
import { GAMES_MAPS } from "./event.constants.js";
import User from "../user/user.model.js";
import Team from "../team/team.model.js";
import Organizer from "../organizer/organizer.model.js";
import EventRegistration from "./models/event-registration.model.js";
import Round from "./models/round.model.js";
import Group from "./models/group.model.js";
import Leaderboard from "./models/leaderBoard.model.js";
import SaveEvent from "./models/saveEvent.model.js";
import JoinRequest from "../join-request/join-request.model.js";
import { Notification } from "../notification/notification.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { getTournamentRegistrants } from "../../shared/utils/tournament.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { logger } from "../../shared/utils/logger.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";

export const findEventById = async (id) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }
  return event;
};

/**
 * Business logic for creating an event
 */
export const createEventService = async (orgId, rawData) => {
  // Check for existing event
  const exists = await Event.findOne({
    title: rawData.title,
    orgId: orgId,
  });

  if (exists) {
    throw new CustomError("Event already exists", 409);
  }

  const eventType = (rawData.eventType || "tournament").toLowerCase();
  
  // 1. Handle Maps
  let assignedMaps = [];
  if (eventType === "scrims") {
    const gameKey = rawData.game?.toLowerCase();
    const availableMaps = GAMES_MAPS[gameKey] || [];
    if (availableMaps.length > 0) {
      const shuffled = [...availableMaps];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const count = Number(rawData.matchCount) || 1;
      assignedMaps = shuffled.slice(0, count);
    }
  } else {
    if (typeof rawData.map === 'string') {
      try { assignedMaps = JSON.parse(rawData.map); }
      catch (e) { assignedMaps = []; }
    } else {
      assignedMaps = Array.isArray(rawData.map) ? rawData.map : [];
    }
  }

  // 2. Handle Roadmaps
  const roadmaps = [];
  const roadmapTypes = { roadmap: "tournament", invitedTeamsRoadmap: "invitedTeams", t1SpecialRoadmap: "t1-special" };
  Object.entries(roadmapTypes).forEach(([key, type]) => {
    if (rawData[key]) {
      try {
        let data = typeof rawData[key] === 'string' ? JSON.parse(rawData[key]) : rawData[key];
        if (Array.isArray(data)) {
          data = data.map((r, i) => ({ ...r, name: `Round ${i + 1}`, order: i + 1 }));
        }
        roadmaps.push({ type, data });
      } catch (e) { logger.error(`Error parsing ${key} in createEventService:`, e); }
    }
  });

  // 3. Handle Boolean Flags & Dependent Fields
  const isPaid = String(rawData.isPaid) === 'true';
  const entryFee = isPaid ? (Number(rawData.entryFee) || 0) : 0;
  const hasRoadmap = String(rawData.hasRoadmap) === 'true';
  const hasInvitedTeams = String(rawData.hasInvitedTeams) === 'true';
  const hasT1SpecialTeams = String(rawData.hasT1SpecialTeams || rawData.hasT1SpecialRoadmap) === 'true';

  // 4. Handle JSON Specialized Fields
  const parseFlexible = (field, fallback = []) => {
    const value = rawData[field];
    if (!value) return fallback;
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed) return fallback;

    // If it looks like JSON, try parsing it
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        logger.error(`JSON Parse Error for ${field}:`, e);
      }
    }

    // Fallback for simple array fields (map, invitedTeams)
    if (["map", "invitedTeams"].includes(field)) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }

    return fallback;
  };

  const prizeDistribution = parseFlexible('prizeDistribution');
  const invitedRoundMappings = parseFlexible('invitedRoundMappings');
  const t1SpecialRoundMappings = parseFlexible('t1SpecialRoundMappings');

  // Validation: Registration must end before or at the start of the event
  const startDateObj = new Date(rawData.startDate);
  const regEndAtObj = new Date(rawData.registrationEndsAt);
  if (regEndAtObj > startDateObj) {
    throw new CustomError("Registration must end before or at the start of the event", 400);
  }
  
  // 5. Handle Invited Teams (map to IDs)
  let invitedTeams = parseFlexible('invitedTeams');
  if (Array.isArray(invitedTeams)) {
    invitedTeams = invitedTeams.map(t => (t.teamId || t._id || t));
  } else {
    invitedTeams = [];
  }

  const event = await Event.create({
    title: rawData.title,
    description: rawData.description || "",
    game: rawData.game,
    prizePool: Number(rawData.prizePool) || 0,
    category: rawData.category,
    matchCount: Number(rawData.matchCount) || 1,
    orgId,
    eventType,
    map: assignedMaps,
    roadmaps,
    isPaid,
    entryFee,
    hasRoadmap,
    hasInvitedTeams,
    hasT1SpecialTeams,
    prizeDistribution,
    invitedRoundMappings,
    t1SpecialRoundMappings,
    invitedTeams,
    startDate: startDateObj,
    registrationEndsAt: regEndAtObj,
    eventEndAt: rawData.eventEndAt ? new Date(rawData.eventEndAt) : null,
    maxSlots: parseInt(rawData.slots) || 0,
    registrationStatus: "registration-open",
    registrationMode: rawData.registrationMode || "open",
    registeredTeams: [],
    joinedSlots: 0,
    image: rawData.image,
    imageFileId: rawData.imageFileId,
    views: 0,
    likes: 0
  });

  logger.info(`Event created with image: ${event.image}, imageFileId: ${event.imageFileId}`);

  return event;
};

/**
 * Business logic for updating an event
 */
export const updateEventService = async (eventId, eventDoc, rawData) => {
  const updateData = {};
  const event = eventDoc;

  // 1. Whitelist and map basic fields
  const allowedFields = [
    "title", "game", "description", "startDate", "registrationEndsAt",
    "eventEndAt", "prizePool", "category", "eventType", "prizeDistribution",
    "hasRoadmap", "roadmaps",
    "isPaid", "entryFee", "matchCount", "map", "invitedRoundMappings", "maxInvitedSlots",
    "hasInvitedTeams", "invitedTeams", "invitedTeamsRoadmap",
    "hasT1SpecialTeams", "t1SpecialRoadmap", "t1SpecialRoundMappings", "t1SpecialTeams",
    "image", "imageFileId"
  ];

  allowedFields.forEach(field => {
    if (rawData[field] !== undefined) {
      if (["hasT1SpecialTeams", "hasRoadmap", "hasInvitedTeams", "isPaid"].includes(field)) {
        updateData[field] = String(rawData[field]) === 'true';
      } else {
        updateData[field] = rawData[field];
      }
    }
  });

  // Handle T1 Special flag mismatch
  if (rawData.hasT1SpecialRoadmap !== undefined) {
    updateData.hasT1SpecialTeams = String(rawData.hasT1SpecialRoadmap) === 'true';
  }

  // 2. Handle Roadmap Consolidation
  if (rawData.roadmap || rawData.invitedTeamsRoadmap || rawData.t1SpecialRoadmap) {
    const roadmaps = event.roadmaps ? [...event.roadmaps] : [];
    const types = { roadmap: "tournament", invitedTeamsRoadmap: "invitedTeams", t1SpecialRoadmap: "t1-special" };

    Object.entries(types).forEach(([key, type]) => {
      if (rawData[key]) {
        try {
          let data = typeof rawData[key] === 'string' ? JSON.parse(rawData[key]) : rawData[key];
          if (Array.isArray(data)) data = data.map((r, i) => ({ ...r, name: `Round ${i + 1}`, order: i + 1 }));
          const idx = roadmaps.findIndex(r => r.type === type);
          if (idx !== -1) roadmaps[idx].data = data;
          else roadmaps.push({ type, data });
        } catch (e) { logger.error(`Error parsing ${key} in updateEventService:`, e); }
      }
    });
    updateData.roadmaps = roadmaps;
  }

  // 3. JSON Parsing for specialized fields
  const parseFlexible = (field) => {
    const value = rawData[field];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        logger.error(`JSON Parse Error for ${field} in updateEventService:`, e);
      }
    }

    if (["map", "invitedTeams"].includes(field)) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }

    return undefined;
  };

  const jsonFields = ["invitedTeams", "map", "prizeDistribution", "invitedRoundMappings", "t1SpecialRoundMappings"];
  jsonFields.forEach(field => {
    const parsed = parseFlexible(field);
    if (parsed !== undefined) {
      updateData[field] = parsed;
    }
  });

  // Normalize invited teams to IDs
  if (Array.isArray(updateData.invitedTeams)) {
    updateData.invitedTeams = updateData.invitedTeams.map(t => (t.teamId || t._id || t));
  }

  // 4. Handle Numeric Conversions & Dependent Logic
  if (rawData.slots !== undefined) {
    const slotsNum = parseInt(rawData.slots);
    updateData.maxSlots = isNaN(slotsNum) ? event.maxSlots : slotsNum;
  }
  if (updateData.matchCount !== undefined) updateData.matchCount = Number(updateData.matchCount) || 1;
  if (updateData.prizePool !== undefined) updateData.prizePool = Number(updateData.prizePool) || 0;

  if (updateData.isPaid !== undefined) {
    const finalIsPaid = updateData.isPaid;
    if (!finalIsPaid) {
      updateData.entryFee = 0;
    } else if (rawData.entryFee !== undefined) {
      updateData.entryFee = Number(rawData.entryFee) || 0;
    }
  }

  // 5. Scrims Map Assignment
  const currentEventType = updateData.eventType || event.eventType;
  if (currentEventType === "scrims") {
    const gameName = updateData.game || event.game;
    const gameKey = gameName?.toLowerCase();
    const availableMaps = GAMES_MAPS[gameKey] || [];
    const matchCount = updateData.matchCount !== undefined ? updateData.matchCount : (event.matchCount || 1);

    const gameChanged = updateData.game && updateData.game !== event.game;
    const matchCountChanged = updateData.matchCount !== undefined && updateData.matchCount !== event.matchCount;
    const typeChangedToScrims = updateData.eventType === "scrims" && event.eventType !== "scrims";
    const mapEmpty = !event.map || event.map.length === 0;

    if (availableMaps.length > 0 && (gameChanged || matchCountChanged || mapEmpty || typeChangedToScrims)) {
      const shuffled = [...availableMaps];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      updateData.map = shuffled.slice(0, matchCount);
    }

    if (typeChangedToScrims) {
      updateData.roadmaps = [];
      updateData.invitedTeams = [];
      updateData.hasRoadmap = false;
      updateData.hasInvitedTeams = false;
    }
  }

  // 6. Registration/Progress Sync
  if (rawData.status) {
    if (rawData.status === 'completed') {
      updateData.eventProgress = 'completed';
      updateData.registrationStatus = 'registration-closed';
    } else {
      updateData.registrationStatus = rawData.status;
    }
  }
  if (updateData.registrationStatus === 'live') {
    updateData.eventProgress = 'ongoing';
  } else if (updateData.eventProgress === 'ongoing') {
    updateData.registrationStatus = 'live';
  }

  // 7. Data Consistency Checks (Disallow roadmap edits once started)
  if (event.eventProgress !== "pending") {
    const restricted = ["roadmap", "hasRoadmap", "invitedTeams", "hasInvitedTeams", "invitedTeamsRoadmap", "roadmaps", "registeredTeams", "invitedRoundMappings"];
    restricted.forEach(key => delete updateData[key]);
  }

  // 8. Custom Business Validations
  if (updateData.maxSlots !== undefined && updateData.maxSlots < event.joinedSlots) {
    throw new CustomError(`Cannot set slots below currently joined: ${event.joinedSlots}`, 400);
  }

  const newStart = updateData.startDate ? new Date(updateData.startDate) : event.startDate;
  const newRegEnd = updateData.registrationEndsAt ? new Date(updateData.registrationEndsAt) : event.registrationEndsAt;
  if (newRegEnd > newStart) {
    throw new CustomError("Registration must end before or at the start of the event", 400);
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedEvent) {
    throw new CustomError("Event not found", 404);
  }

  logger.info(`Event updated with image: ${updatedEvent.image}, imageFileId: ${updatedEvent.imageFileId}`);

  return updatedEvent;
};

/**
 * Business logic for deleting an event
 */
export const deleteEventService = async (eventId) => {
  const result = await withOptionalTransaction(async (session) => {
    // 1. Find all Rounds for this event
    const rounds = await Round.find({ eventId }, "_id").session(session);
    const roundIds = rounds.map(r => r._id);

    // 2. Find all Groups for these Rounds
    const groups = await Group.find({ roundId: { $in: roundIds } }, "_id").session(session);
    const groupIds = groups.map(g => g._id);

    // 3. Delete the event record
    const deletedEvent = await Event.findByIdAndDelete(eventId, { session });

    if (!deletedEvent) {
      throw new CustomError("Event not found (or already deleted)", 404);
    }

    // 4. Cascade deletions for all associated data
    await Promise.all([
      EventRegistration.deleteMany({ eventId }, { session }),
      Round.deleteMany({ eventId }, { session }),
      Group.deleteMany({ roundId: { $in: roundIds } }, { session }),
      Leaderboard.deleteMany({ groupId: { $in: groupIds } }, { session }),
      SaveEvent.deleteMany({ event: eventId }, { session }),
      JoinRequest.deleteMany({ target: eventId, targetModel: 'Event' }, { session }),
      Notification.deleteMany({ "relatedData.eventId": eventId }, { session })
    ]);

    logger.info(`Cascading deletion completed for event ${eventId}. Cleaned up rounds: ${roundIds.length}, groups: ${groupIds.length}`);

    return deletedEvent;
  });

  return result;
};

/**
 * Business logic for registering a team to an event
 */
export const registerEventService = async (eventId, userId, teamDoc, eventDoc) => {
  const minSize = eventDoc.category === 'solo' ? 1
    : eventDoc.category === 'duo' ? 2
      : eventDoc.category === 'squad' ? 4
        : 1;

  // Registration deadline check
  if (new Date() > new Date(eventDoc.registrationEndsAt)) {
    throw new CustomError("Registration for this event has ended", 400);
  }

  // Status check
  if (eventDoc.registrationStatus !== "registration-open") {
    throw new CustomError("Event registration is not open", 400);
  }

  // Check if already registered
  const existingReg = await EventRegistration.findOne({ eventId, teamId: teamDoc._id });
  if (existingReg) {
    throw new CustomError("Your team is already registered for this event", 400);
  }

  if (eventDoc.registrationMode === "open") {
    // Filter active members
    const activeMembers = teamDoc.teamMembers.filter(m => m.isActive);

    if (activeMembers.length < minSize) {
      throw new CustomError(`Your team must have at least ${minSize} active players to register.`, 400);
    }

    let players = [];
    let substitutes = [];

    if (eventDoc.category === 'squad') {
      const registrants = getTournamentRegistrants(teamDoc.teamMembers);
      players = registrants.players;
      substitutes = registrants.substitutes;

      if (players.length < 4) {
        throw new CustomError("Your team must have an IGL, Rusher, Sniper, and Support to join a squad tournament.", 400);
      }
    } else {
      players = activeMembers.slice(0, minSize).map(m => m.user);
      substitutes = activeMembers.slice(minSize).map(m => m.user);
    }

    await withOptionalTransaction(async (session) => {
      // Atomic Slot Increment
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          registrationStatus: "registration-open",
          $expr: { $lt: ["$joinedSlots", "$maxSlots"] }
        },
        { $inc: { joinedSlots: 1 }, $push: { registeredTeams: teamDoc._id } },
        { new: true, session }
      );

      if (!updatedEvent) {
        throw new CustomError("Event is full or registration is not open", 400);
      }

      await EventRegistration.create([{
        eventId: eventDoc._id,
        teamId: teamDoc._id,
        status: "approved",
        players,
        substitutes,
      }], { session });

      // Update team and user history
      const hasPlayed = teamDoc.playedTournaments?.some(id => id.toString() === eventId.toString());
      if (!hasPlayed) {
        await Team.updateOne(
          { _id: teamDoc._id },
          { $push: { playedTournaments: eventId } },
          { session }
        );
      }

      await User.updateMany(
        { _id: { $in: teamDoc.teamMembers.map((m) => m.user) }, eventHistory: { $ne: eventId } },
        { $push: { eventHistory: eventId } },
        { session }
      );
    });

    return { success: true, message: "Your Team successfully registered for the tournament" };
  } else {
    // Create JoinRequest for invite-only event
    await JoinRequest.create({
      requester: userId,
      target: eventId,
      targetModel: "Event",
      message: `Team ${teamDoc.teamName} wants to join ${eventDoc.title}.`,
    });

    return { success: true, message: "Registration request sent to organizer for approval" };
  }
};
/**
 * Business logic for unregistering a team from an event
 */
export const unregisterEventService = async (eventId, teamId) => {
  await withOptionalTransaction(async (session) => {
    const registration = await EventRegistration.findOneAndDelete(
      { eventId, teamId },
      { session }
    );

    if (!registration) {
      throw new CustomError("You are not registered for this event", 400);
    }

    // Atomic Slot Decrement and Remove from registeredTeams
    await Event.updateOne(
      { _id: eventId, joinedSlots: { $gt: 0 } },
      { $inc: { joinedSlots: -1 }, $pull: { registeredTeams: teamId } },
      { session }
    );
  });
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

/**
 * Handle ImageKit upload and optional old image cleanup
 */
export const handleImageUpload = async (filePath, fileName, oldFileId = null) => {
  try {
    const uploadRes = await uploadOnImageKit(
      filePath,
      fileName,
      "/events/posters"
    );

    if (uploadRes && oldFileId) {
      deleteFromImageKit(oldFileId).catch(err =>
        logger.error(`Failed to delete old image ${oldFileId}:`, err)
      );
    }

    return uploadRes ? { imageUrl: uploadRes.url, imageFileId: uploadRes.fileId } : null;
  } catch (err) {
    logger.error("Error in handleImageUpload service:", err);
    throw err;
  }
};

/**
 * Handle image deletion from ImageKit
 */
export const handleImageDelete = async (fileId) => {
  if (!fileId) return;
  try {
    await deleteFromImageKit(fileId);
  } catch (err) {
    logger.error(`Failed to delete image ${fileId}:`, err);
  }
};
