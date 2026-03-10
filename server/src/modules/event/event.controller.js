import fs from "fs";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";

import Organizer from "../organizer/organizer.model.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import User from "../user/user.model.js";
import Event from "./event.model.js";
import { GAMES_MAPS } from "./event.constants.js";
import EventRegistration from "./models/event-registration.model.js";
import JoinRequest from "../join-request/join-request.model.js";
import Round from "./models/round.model.js";
import Group from "./models/group.model.js";

import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";

import { findUserById } from "../user/user.service.js";
import { findTeamById } from "../team/team.service.js";
import { findEventById } from "../event/event.service.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { logger } from "../../shared/utils/logger.js";
import Team from "../team/team.model.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";
import { getTournamentRegistrants } from "../../shared/utils/tournament.js";
import { redis } from "../../shared/config/redis.js";


/**
 * Clear event related caches
 * Invalidates all-events, org-specific events, and specific event details
 */
const clearEventCache = async (orgId, eventId = null) => {
  try {
    const prefixes = [
      "__express__GET:/api/v1/events/all-events:",
      `__express__GET:/api/v1/events/org-events/${orgId}:`
    ];

    if (eventId) {
      prefixes.push(`__express__GET:/api/v1/events/event-details/${eventId}:`);
    }

    await Promise.all(prefixes.map(prefix => redis.delByPrefix(prefix)));
    logger.info(`Cache cleared for org: ${orgId}${eventId ? `, event: ${eventId}` : ""}`);
  } catch (err) {
    logger.error("Error clearing event cache:", err);
  }
};


const requiredFields = [
  "title",
  "game",
  "startDate",
  "registrationEndsAt",
  "slots",
  "category",
  "registrationMode",
];

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const createEvent = TryCatchHandler(async (req, res, next) => {
  const { userId, roles } = req.user;

  try {
    const user = await findUserById(userId);

    const org = await Organizer.findById(user.orgId);
    if (!org || org.isDeleted) {
      throw new CustomError("Organization not found or inactive", 404);
    }

    const hasAuth = roles.some(
      (r) =>
        r.scope === "org" &&
        r.scopeModel === "Organizer" &&
        (r.role === Roles.ORG.OWNER || r.role === Roles.ORG.CO_OWNER || r.role === Roles.ORG.MANAGER) &&
        r.scopeId.toString() === user.orgId.toString()
    );
    if (!hasAuth) {
      throw new CustomError("Not authorized for this organization", 403);
    }

    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new CustomError(`${field} is required`, 400);
      }
    }

    const startDate = new Date(req.body.startDate);
    const registrationEndsAt = new Date(req.body.registrationEndsAt);

    const slotsNum = Number(req.body.slots);
    if (isNaN(slotsNum) || slotsNum <= 0) {
      throw new CustomError("Slots must be a number greater than 0", 400);
    }

    const prizePool = Number(req.body.prizePool) || 0;
    if (prizePool < 0) {
      throw new CustomError("Prize pool cannot be negative", 400);
    }

    if (registrationEndsAt > startDate) {
      throw new CustomError("Registration must end before or at the start of the event", 400);
    }

    if (req.body.eventEndAt) {
      const eventEndAt = new Date(req.body.eventEndAt);
      if (eventEndAt <= startDate) {
        throw new CustomError("Event must end after it starts", 400);
      }
    }

    const exists = await Event.findOne({
      title: req.body.title,
      orgId: user.orgId,
    });

    if (exists) {
      throw new CustomError("Event already exists", 409);
    }

    // handle image uploading logic here
    let imageUrl = null;
    let imageFileId = null;

    if (req.file) {
      const uploadRes = await uploadOnImageKit(
        req.file.path,
        `event-poster-${Date.now()}`,
        "/events/posters"
      );
      if (uploadRes) {
        imageUrl = uploadRes.url;
        imageFileId = uploadRes.fileId;
      }
    }

    // Auto-assign maps for scrims
    const eventType = (req.body.eventType || "tournament").toLowerCase();
    let assignedMaps = [];
    if (eventType === "scrims") {
      const gameKey = req.body.game?.toLowerCase();
      const availableMaps = GAMES_MAPS[gameKey] || [];
      if (availableMaps.length > 0) {
        const shuffled = [...availableMaps];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const count = Number(req.body.matchCount) || 1;
        assignedMaps = shuffled.slice(0, count);
      }
    } else {
      if (typeof req.body.map === 'string') {
        try { assignedMaps = JSON.parse(req.body.map); }
        catch (e) { assignedMaps = []; }
      } else {
        assignedMaps = Array.isArray(req.body.map) ? req.body.map : [];
      }
    }

    try {
      const event = await Event.create({
        title: req.body.title,
        game: req.body.game,
        eventType: (req.body.eventType || "tournament").toLowerCase(),
        category: (req.body.category || "solo").toLowerCase(),
        startDate,
        registrationEndsAt,
        maxSlots: slotsNum,
        registrationMode: req.body.registrationMode || "open",
        registrationStatus: "registration-open", // Use primary field
        orgId: user.orgId,
        description: req.body.description,
        prizePool: prizePool,
        isPaid: req.body.isPaid === 'true' || req.body.isPaid === true,
        entryFee: (req.body.isPaid === 'true' || req.body.isPaid === true) ? (Number(req.body.entryFee) || 0) : 0,
        matchCount: Number(req.body.matchCount) || 1,
        map: assignedMaps,
        image: imageUrl,
        imageFileId: imageFileId,
        eventEndAt: req.body.eventEndAt ? new Date(req.body.eventEndAt) : null,
        prizeDistribution: (() => {
          if (!req.body.prizeDistribution) return [];
          try {
            return typeof req.body.prizeDistribution === 'string'
              ? JSON.parse(req.body.prizeDistribution)
              : req.body.prizeDistribution;
          } catch (err) {
            logger.error("Error parsing prizeDistribution in createEvent:", err);
            return [];
          }
        })(),
        hasRoadmap: req.body.hasRoadmap === 'true' || req.body.hasRoadmap === true,
        roadmaps: (() => {
          const roadmaps = [];
          if (req.body.roadmap) {
            try {
              const data = typeof req.body.roadmap === 'string' ? JSON.parse(req.body.roadmap) : req.body.roadmap;
              roadmaps.push({ type: "tournament", data });
            } catch (e) { logger.error("Error parsing roadmap in createEvent:", e); }
          }
          if (req.body.invitedTeamsRoadmap) {
            try {
              const data = typeof req.body.invitedTeamsRoadmap === 'string' ? JSON.parse(req.body.invitedTeamsRoadmap) : req.body.invitedTeamsRoadmap;
              roadmaps.push({ type: "invitedTeams", data });
            } catch (e) { logger.error("Error parsing invitedTeamsRoadmap in createEvent:", e); }
          }
          return roadmaps;
        })(),
        hasInvitedTeams: req.body.hasInvitedTeams === 'true' || req.body.hasInvitedTeams === true,
        invitedTeams: (() => {
          if (!req.body.invitedTeams) return [];
          try {
            const teams = typeof req.body.invitedTeams === 'string' ? JSON.parse(req.body.invitedTeams) : req.body.invitedTeams;
            // The user said "store the team id only". 
            // If the incoming data is an array of objects like [{teamId: "..."}, ...], we should map it.
            // If it's already an array of IDs, we use it directly.
            return Array.isArray(teams) ? teams.map(t => (t.teamId || t._id || t)) : [];
          } catch (e) { return []; }
        })(),
        registeredTeams: [],
      });

      // Clear cache after successful creation
      await clearEventCache(user.orgId);

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: event,
      });
    } catch (err) {
      // Rollback ImageKit if DB failed
      if (imageFileId) {
        deleteFromImageKit(imageFileId).catch(deleteErr =>
          logger.error(`Failed to rollback ImageKit upload ${imageFileId} after DB error:`, deleteErr)
        );
      }
      throw err;
    }
  } finally {
    // Always cleanup local file
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { logger.error("Failed to delete local file:", e); }
    }
  }
});

export const fetchEventByOrg = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.params;

  if (!isValidObjectId(orgId)) {
    return next(new CustomError("Invalid Organization ID", 400));
  }

  const events = await Event.find({ orgId })
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();

  if (!events.length) {
    return res.status(200).json({
      success: true,
      message: "No events found for this organization",
      data: [],
    });
  }

  return res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

export const fetchEventDetailsById = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;

  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return next(new CustomError("Invalid event id", 400));
  }

  const event = await Event.findByIdAndUpdate(eventId, { $inc: { views: 1 } }, { new: true });

  if (!event) {
    return next(new CustomError("Event not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Event details fetched successfully",
    data: event,
  });
});

export const fetchAllEvents = TryCatchHandler(async (req, res, next) => {
  let { cursor, limit = 10, search, game, category, status } = req.query;

  limit = parseInt(limit);
  if (limit > 100) limit = 100;
  let query = {};

  if (search) {
    const sanitizedSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: sanitizedSearch, $options: "i" } },
      { description: { $regex: sanitizedSearch, $options: "i" } },
    ];
  }

  if (game && game !== 'all') {
    query.game = { $regex: `^${escapeRegex(game)}$`, $options: "i" };
  }
  if (category && category !== 'all') query.category = category.toLowerCase();
  if (status && status !== 'all') query.registrationStatus = status;

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const events = await Event.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  let nextCursor = null;
  if (events.length > limit) {
    const lastEvent = events.pop();
    nextCursor = lastEvent._id;
  }
  const hasMore = nextCursor !== null;

  res.status(200).json({
    success: true,
    data: events,
    nextCursor,
    hasMore
  });
});

export const registerEvent = TryCatchHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return next(new CustomError("Invalid Event ID", 400));
  }

  const user = await findUserById(userId);

  if (!user.teamId)
    return next(new CustomError("You are not part of any team", 400));

  const team = await findTeamById(user.teamId);
  const event = await findEventById(eventId);

  const minSize = event.category === 'solo' ? 1
    : event.category === 'duo' ? 2
      : event.category === 'squad' ? 4
        : 1;

  // Registration deadline check
  if (new Date() > new Date(event.registrationEndsAt)) {
    return next(new CustomError("Registration for this event has ended", 400));
  }

  // Status check
  if (event.registrationStatus !== "registration-open") {
    return next(new CustomError("Event registration is not open", 400));
  }

  // Check if already registered or requested
  const existingReg = await EventRegistration.findOne({ eventId, teamId: team._id });
  if (existingReg) {
    return next(new CustomError("Your team is already registered for this event", 400));
  }

  const existingReq = await JoinRequest.findOne({
    requester: userId,
    target: eventId,
    targetModel: "Event",
    status: "pending"
  });
  if (existingReq) {
    return next(new CustomError("You already have a pending registration request", 400));
  }

  if (event.registrationMode === "open") {
    // 1. Check strict roles ONLY if it's a SQUAD event and game requires it (e.g. PUBG)
    // For now, removing the hardcoded check for specific role names as per requirement
    // and just enforcing team size and active status.

    // Filter active members
    const activeMembers = team.teamMembers.filter(m => m.isActive);

    if (activeMembers.length < minSize) {
      return next(new CustomError(`Your team must have at least ${minSize} active players to register.`, 400));
    }

    let players = [];
    let substitutes = [];

    if (event.category === 'squad') {
      const registrants = getTournamentRegistrants(team.teamMembers);
      players = registrants.players;
      substitutes = registrants.substitutes;

      if (players.length < 4) {
        return next(new CustomError("Your team must have an IGL, Rusher, Sniper, and Support to join a squad tournament.", 400));
      }
    } else {
      players = activeMembers.slice(0, minSize).map(m => m.user);
      substitutes = activeMembers.slice(minSize).map(m => m.user);
    }

    await withOptionalTransaction(async (session) => {
      // Atomic Slot Increment with condition check
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          registrationStatus: "registration-open",
          $expr: { $lt: ["$joinedSlots", "$maxSlots"] }
        },
        { $inc: { joinedSlots: 1 }, $push: { registeredTeams: team._id } },
        { new: true, session }
      );

      if (!updatedEvent) {
        throw new CustomError("Event is full or registration is not open", 400);
      }

      // Register team directly
      await EventRegistration.create([{
        eventId: event._id,
        teamId: team._id,
        status: "approved",
        players,
        substitutes,
      }], { session });

      // Update team and user history
      if (!team.playedTournaments.includes(eventId)) {
        await Team.updateOne(
          { _id: team._id },
          { $push: { playedTournaments: eventId } },
          { session }
        );
      }

      await User.updateMany(
        { _id: { $in: team.teamMembers.map((m) => m.user) }, eventHistory: { $ne: eventId } },
        { $push: { eventHistory: eventId } },
        { session }
      );
    });

    // Clear cache after successful registration
    await clearEventCache(event.orgId, eventId);

    return res.status(200).json({
      success: true,
      message: "Your Team successfully registered for the tournament",
    });
  } else {
    // Create JoinRequest for invite-only event
    await JoinRequest.create({
      requester: userId,
      target: eventId,
      targetModel: "Event",
      message: `Team ${team.teamName} wants to join ${event.title}.`,
    });

    return res.status(200).json({
      success: true,
      message: "Registration request sent to organizer for approval",
    });
  }
});

export const isTeamRegistered = TryCatchHandler(async (req, res, next) => {
  const { eventId, teamId } = req.params;

  if (!isValidObjectId(eventId) || !isValidObjectId(teamId)) {
    return next(new CustomError("Invalid Event ID or Team ID", 400));
  }

  // Check approved registration
  const registration = await EventRegistration.findOne({
    eventId,
    teamId,
  });

  if (registration) {
    return res.json({ registered: true, status: "approved" });
  }

  // Check pending request (since teamId is at User level, we check for User's pending request for this Event)
  const usersInTeam = await User.find({ teamId }).select('_id');
  if (usersInTeam.length > 0) {
    const userIds = usersInTeam.map(u => u._id);
    const request = await JoinRequest.findOne({
      requester: { $in: userIds },
      target: eventId,
      targetModel: "Event",
      status: "pending",
    });

    if (request) {
      return res.json({ registered: true, status: "pending" });
    }
  }

  // Also check if there's an approved registration in EventRegistration (again, just in case)
  // The first check covers 'approved' status.
  // We might want to unify 'pending' if we ever store pending in EventRegistration.
  // For now, this dual check is correct given current architecture.

  res.json({
    registered: false,
    status: "none",
  });
});

export const fetchAllRegisteredTeams = TryCatchHandler(
  async (req, res, next) => {
    const { eventId } = req.params;
    let { cursor, limit = 10 } = req.query;

    if (!isValidObjectId(eventId)) {
      return next(new CustomError("Invalid Event ID", 400));
    }

    limit = parseInt(limit);
    if (limit > 100) limit = 100;
    let query = { eventId };

    if (cursor) {
      query._id = { $gt: cursor }; // Using $gt for chronological order (ASC) or matching the append logic
    }

    const registrations = await EventRegistration.find(query)
      .sort({ _id: 1 }) // Sorting by ID to ensure consistent pagination
      .limit(limit + 1)
      .populate("teamId", "teamName imageUrl")
      .lean();

    let nextCursor = null;
    let hasMore = false;

    if (registrations.length > limit) {
      const extraItem = registrations.pop();
      nextCursor = extraItem._id;
      hasMore = true;
    }

    const teams = registrations.map(reg => reg.teamId);

    return res.status(200).json({
      success: true,
      totalTeams: teams.length,
      teams: teams,
      nextCursor,
      hasMore
    });
  }
);

export const closeRegistration = TryCatchHandler(async (req, res) => {
  // Event ID from params
  const { eventId } = req.params;
  const { userId, roles } = req.user;

  // Event find karo
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  // Authorization Check
  const isAuthorized = roles.some(
    (r) =>
      (r.scope === Scopes.PLATFORM && r.role === Roles.PLATFORM.SUPER_ADMIN) ||
      (r.scope === "org" &&
        r.scopeModel === "Organizer" &&
        (r.role === Roles.ORG.OWNER || r.role === Roles.ORG.CO_OWNER || r.role === Roles.ORG.MANAGER) &&
        r.scopeId.toString() === event.orgId.toString())
  );
  if (!isAuthorized) throw new CustomError("Not authorized to close registration for this event", 403);

  // Check if already closed
  if (event.registrationStatus === "registration-closed") {
    return res.status(400).json({ message: "Registration already closed" });
  }

  // Registration close karna
  event.registrationStatus = "registration-closed";
  await event.save();

  // Clear cache
  await clearEventCache(event.orgId, eventId);

  res.status(200).json({
    message: "Registration closed successfully",
    event,
  });
});

export const updateEvent = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const { roles } = req.user;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new CustomError("Event not found", 404);
    }

    // Authorization Check (Defense in depth)
    const isAuthorized = roles.some(
      (r) =>
        (r.scope === Scopes.PLATFORM && r.role === Roles.PLATFORM.SUPER_ADMIN) ||
        (r.scope === "org" &&
          r.scopeModel === "Organizer" &&
          (r.role === Roles.ORG.OWNER || r.role === Roles.ORG.CO_OWNER || r.role === Roles.ORG.MANAGER) &&
          r.scopeId.toString() === event.orgId.toString())
    );
    if (!isAuthorized) {
      throw new CustomError("Not authorized to update this event", 403);
    }

    // Handle image update if file provided
    let imageUrl = event.image;
    let imageFileId = event.imageFileId;

    if (req.file) {
      const uploadRes = await uploadOnImageKit(
        req.file.path,
        `event-poster-${event._id}-${Date.now()}`,
        "/events/posters"
      );

      if (uploadRes) {
        if (event.imageFileId) {
          deleteFromImageKit(event.imageFileId).catch(err =>
            logger.error(`Failed to delete old event poster ${event.imageFileId}:`, err)
          );
        }
        imageUrl = uploadRes.url;
        imageFileId = uploadRes.fileId;
      }
    }

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = [
      "title", "game", "description", "startDate", "registrationEndsAt",
      "maxSlots", "registrationMode", "registrationStatus", "eventProgress",
      "eventEndAt", "prizePool", "category", "eventType", "prizeDistribution",
      "hasRoadmap", "roadmap", "hasInvitedTeams", "invitedTeams", "invitedTeamsRoadmap", "roadmaps", "registeredTeams",
      "isPaid", "entryFee", "matchCount", "map"
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Map 'status' from frontend to 'registrationStatus'
    if (req.body.status) {
      updateData.registrationStatus = req.body.status;
    }

    // Sync registrationStatus: live with eventProgress: ongoing
    if (updateData.registrationStatus === 'live') {
      updateData.eventProgress = 'ongoing';
    } else if (updateData.eventProgress === 'ongoing') {
      updateData.registrationStatus = 'live';
    }

    // Handle roadmaps consolidation in update
    if (req.body.roadmap || req.body.invitedTeamsRoadmap) {
      const roadmaps = event.roadmaps ? [...event.roadmaps] : [];

      if (req.body.roadmap) {
        try {
          const data = typeof req.body.roadmap === 'string' ? JSON.parse(req.body.roadmap) : req.body.roadmap;
          const idx = roadmaps.findIndex(r => r.type === "tournament");
          if (idx !== -1) roadmaps[idx].data = data;
          else roadmaps.push({ type: "tournament", data });
        } catch (e) { logger.error("Error parsing roadmap in updateEvent:", e); }
      }

      if (req.body.invitedTeamsRoadmap) {
        try {
          const data = typeof req.body.invitedTeamsRoadmap === 'string' ? JSON.parse(req.body.invitedTeamsRoadmap) : req.body.invitedTeamsRoadmap;
          const idx = roadmaps.findIndex(r => r.type === "invitedTeams");
          if (idx !== -1) roadmaps[idx].data = data;
          else roadmaps.push({ type: "invitedTeams", data });
        } catch (e) { logger.error("Error parsing invitedTeamsRoadmap in updateEvent:", e); }
      }

      updateData.roadmaps = roadmaps;
      delete updateData.roadmap;
      delete updateData.invitedTeamsRoadmap;
    }

    if (updateData.invitedTeams) {
      try {
        const teams = typeof updateData.invitedTeams === 'string' ? JSON.parse(updateData.invitedTeams) : updateData.invitedTeams;
        updateData.invitedTeams = Array.isArray(teams) ? teams.map(t => (t.teamId || t._id || t)) : [];
      } catch (e) { delete updateData.invitedTeams; }
    }

    if (imageUrl) updateData.image = imageUrl;
    if (imageFileId) updateData.imageFileId = imageFileId;

    // Custom validations for specific fields
    if (req.body.slots) {
      const slotsNum = Number(req.body.slots);
      if (isNaN(slotsNum) || slotsNum < event.joinedSlots) {
        throw new CustomError(`Cannot set slots below currently joined: ${event.joinedSlots}`, 400);
      }
      updateData.maxSlots = slotsNum;
      delete updateData.slots; // Handled as maxSlots
    }

    if (updateData.prizePool !== undefined) {
      const prizePoolNum = Number(updateData.prizePool);
      if (isNaN(prizePoolNum) || prizePoolNum < 0) {
        throw new CustomError("Prize pool cannot be negative", 400);
      }
      updateData.prizePool = prizePoolNum;
    }

    // Note: Comprehensive date checking when both change is implicitly handled if we check against the merged state, 
    // but here we check individually. For robust check we'd merge `event` and `updateData`.
    // Let's do a merged check for safety.
    const newStart = updateData.startDate ? new Date(updateData.startDate) : event.startDate;
    const newRegEnd = updateData.registrationEndsAt ? new Date(updateData.registrationEndsAt) : event.registrationEndsAt;
    const newEnd = updateData.eventEndAt ? new Date(updateData.eventEndAt) : event.eventEndAt;

    if (newRegEnd > newStart) {
      throw new CustomError("Registration must end before or at the start of the event", 400);
    }
    if (newEnd && newEnd < newStart) {
      throw new CustomError("Event must end at or after it starts", 400);
    }

    if (updateData.category) updateData.category = updateData.category.toLowerCase();
    if (updateData.eventType) updateData.eventType = updateData.eventType.toLowerCase();

    if (updateData.prizeDistribution) {
      try {
        updateData.prizeDistribution = typeof updateData.prizeDistribution === 'string'
          ? JSON.parse(updateData.prizeDistribution)
          : updateData.prizeDistribution;
      } catch (e) {
        logger.error("Error parsing prizeDistribution in updateEvent:", e);
        delete updateData.prizeDistribution; // Don't update with invalid data
      }
    }

    if (updateData.hasRoadmap !== undefined) updateData.hasRoadmap = String(updateData.hasRoadmap) === 'true';
    if (updateData.hasInvitedTeams !== undefined) updateData.hasInvitedTeams = String(updateData.hasInvitedTeams) === 'true';
    if (updateData.isPaid !== undefined) {
      updateData.isPaid = String(updateData.isPaid) === 'true';
    }
    const finalIsPaid = updateData.isPaid !== undefined ? updateData.isPaid : event.isPaid;
    if (!finalIsPaid) {
      updateData.entryFee = 0;
    } else if (updateData.entryFee !== undefined) {
      updateData.entryFee = Number(updateData.entryFee) || 0;
    }
    if (updateData.matchCount !== undefined) updateData.matchCount = Number(updateData.matchCount) || 1;

    // Auto-assign maps for scrims in update
    const currentEventType = updateData.eventType || event.eventType;
    if (currentEventType === "scrims") {
      const gameName = updateData.game || event.game;
      const gameKey = gameName?.toLowerCase();
      const availableMaps = GAMES_MAPS[gameKey] || [];
      const matchCount = updateData.matchCount !== undefined ? updateData.matchCount : (event.matchCount || 1);

      // Reshuffle only if game changed, matchCount changed, or map is currently empty, or event type just changed to scrims
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

      // Cleanup tournament-specific fields if switching to scrims
      if (typeChangedToScrims) {
        updateData.roadmaps = [];
        updateData.invitedTeams = [];
        updateData.hasRoadmap = false;
        updateData.hasInvitedTeams = false;
      }
    } else if (req.body.map) {
      try {
        updateData.map = Array.isArray(req.body.map) ? req.body.map : JSON.parse(req.body.map);
      } catch (e) {
        logger.error("Error parsing map in updateEvent:", e);
      }
    }

    ['roadmap', 'invitedTeams', 'invitedTeamsRoadmap'].forEach(key => {
      if (updateData[key]) {
        try {
          updateData[key] = typeof updateData[key] === 'string' ? JSON.parse(updateData[key]) : updateData[key];
        } catch (e) {
          delete updateData[key];
        }
      }
    });

    // Disallow editing roadmap once event has started
    if (event.eventProgress !== "pending") {
      delete updateData.roadmap;
      delete updateData.hasRoadmap;
      delete updateData.invitedTeams;
      delete updateData.hasInvitedTeams;
      delete updateData.invitedTeamsRoadmap;
      delete updateData.roadmaps;
      delete updateData.registeredTeams;
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true,
    });

    // Clear cache after successful registration
    await clearEventCache(event.orgId, eventId);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } finally {
    // Always cleanup local file
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { logger.error("Failed to delete local file:", e); }
    }
  }
});

export const deleteEvent = TryCatchHandler(async (req, res) => {
  const { eventId } = req.params;
  const { userId, roles } = req.user;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

  // Authorization Check
  const isAuthorized = roles.some(
    (r) =>
      (r.scope === Scopes.PLATFORM && r.role === Roles.PLATFORM.SUPER_ADMIN) ||
      (r.scope === "org" &&
        r.scopeModel === "Organizer" &&
        (r.role === Roles.ORG.OWNER || r.role === Roles.ORG.CO_OWNER || r.role === Roles.ORG.MANAGER) &&
        r.scopeId.toString() === event.orgId.toString())
  );
  if (!isAuthorized) throw new CustomError("Not authorized to delete this event", 403);

  const deletedEvent = await withOptionalTransaction(async (session) => {
    const deletedEvent = await Event.findByIdAndDelete(eventId, { session });

    if (!deletedEvent) {
      throw new CustomError("Event not found (or already deleted)", 404);
    }

    // Cascade deletions
    await Promise.all([
      EventRegistration.deleteMany({ eventId: eventId }, { session }),
      Round.deleteMany({ eventId: eventId }, { session }),
      Group.deleteMany({ eventId: eventId }, { session })
    ]);

    return deletedEvent;
  });

  // Post-transaction cleanup
  if (deletedEvent.imageFileId) {
    deleteFromImageKit(deletedEvent.imageFileId).catch(err =>
      logger.error(`Failed to cleanup event image ${deletedEvent.imageFileId}:`, err)
    );
  }

  // Clear cache
  await clearEventCache(event.orgId, eventId);

  res.status(200).json({
    success: true,
    message: "Event and associated data deleted successfully"
  });
});

export const unregisterEvent = TryCatchHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { eventId } = req.params;

  const user = await findUserById(userId);
  if (!user.teamId) {
    return next(new CustomError("You are not part of any team", 400));
  }

  await withOptionalTransaction(async (session) => {
    const registration = await EventRegistration.findOneAndDelete(
      { eventId, teamId: user.teamId },
      { session }
    );

    if (!registration) {
      throw new CustomError("You are not registered for this event", 400);
    }

    // Atomic Slot Decrement and Remove from registeredTeams
    await Event.updateOne(
      { _id: eventId, joinedSlots: { $gt: 0 } },
      { $inc: { joinedSlots: -1 }, $pull: { registeredTeams: user.teamId } },
      { session }
    );
  });

  const event = await Event.findById(eventId).select("orgId");
  if (event) {
    // Clear cache
    await clearEventCache(event.orgId, eventId);
  }

  res.status(200).json({
    success: true,
    message: "Successfully unregistered from the event",
  });
});

export const startEvent = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const { userId, roles } = req.user;

  // 1. Fetch Event
  const event = await Event.findById(eventId);
  if (!event) return next(new CustomError("Event not found", 404));

  // 2. Authorization Check
  const isAuthorized = roles.some(
    (r) =>
      r.scope === "org" &&
      r.scopeModel === "Organizer" &&
      (r.role === Roles.ORG.OWNER || r.role === Roles.ORG.CO_OWNER || r.role === Roles.ORG.MANAGER) &&
      r.scopeId.toString() === event.orgId.toString()
  );
  if (!isAuthorized) throw new CustomError("Not authorized to start this event", 403);

  // 3. Status Check
  if (event.eventProgress !== "pending") {
    return next(new CustomError("Event must be in pending state to start", 400));
  }
  if (event.eventProgress === "ongoing" || event.eventProgress === "completed") {
    return next(new CustomError("Event is already active or completed", 400));
  }

  // 4. Update Event Status
  // "we will only chnage two thing registration will close and progress is ongoing"
  event.registrationStatus = "registration-closed";
  event.eventProgress = "ongoing";

  await event.save();

  // Clear cache
  await clearEventCache(event.orgId, eventId);

  res.status(200).json({
    success: true,
    message: "Event started successfully! Registration closed, progress set to ongoing.",
    data: event
  });
});

export const finishEvent = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const { userId, roles } = req.user;

  const event = await Event.findById(eventId);
  if (!event) return next(new CustomError("Event not found", 404));

  // Authorization Check
  const isAuthorized = roles.some(
    (r) =>
      r.scope === "org" &&
      r.scopeModel === "Organizer" &&
      (r.role === Roles.ORG.OWNER || r.role === Roles.ORG.CO_OWNER || r.role === Roles.ORG.MANAGER) &&
      r.scopeId.toString() === event.orgId.toString()
  );
  if (!isAuthorized) throw new CustomError("Not authorized to finish this event", 403);

  if (event.eventProgress !== "ongoing") {
    return next(new CustomError("Event must be ongoing to be finished", 400));
  }
  if (event.eventProgress === "completed") {
    return next(new CustomError("Event is already completed", 400));
  }

  event.eventProgress = "completed";
  event.registrationStatus = "registration-closed";

  await event.save();

  // Clear cache
  await clearEventCache(event.orgId, eventId);

  res.status(200).json({
    success: true,
    message: "Event finished successfully! Final leaderboard is now available.",
    data: event
  });
});

export const fetchTournamentsByTeam = TryCatchHandler(async (req, res, next) => {
  const { teamId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return next(new CustomError("Invalid Team ID", 400));
  }

  const registrations = await EventRegistration.find({ teamId })
    .populate({
      path: "eventId",
      select: "title game startDate image prizePool eventType category eventProgress registrationStatus",
      populate: {
        path: "orgId",
        select: "orgName imageUrl"
      }
    })
    .sort({ createdAt: -1 })
    .lean();

  const tournaments = registrations.map(reg => {
    if (!reg.eventId) return null;
    const event = reg.eventId;
    return {
      ...event,
      registrationStatus: reg.status,
      joinedAt: reg.createdAt
    };
  }).filter(t => t !== null);

  res.status(200).json({
    success: true,
    data: tournaments,
  });
});

// TODO: Event owner can remove any team from the event
// TODO: Notification feature using socket.io