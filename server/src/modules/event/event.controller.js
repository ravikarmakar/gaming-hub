import fs from "fs";
import mongoose from "mongoose";

import Organizer from "../organizer/organizer.model.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import User from "../user/user.model.js";
import Event from "./event.model.js";
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

const requiredFields = [
  "title",
  "game",
  "startDate",
  "registrationEndsAt",
  "slots",
  "category",
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
        (r.role === "org:owner" || r.role === "org:manager") &&
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
      });

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: event,
      });
    } catch (err) {
      // Rollback ImageKit if DB failed
      if (imageFileId) {
        deleteFromImageKit(imageFileId).catch(deleteErr =>
          logger.error(`Failed to rollback ImageKit upload ${imageFileId}:`, deleteErr)
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

  if (team.teamMembers.length < 4) {
    return next(
      new CustomError("Your team must have at least 4 players to register", 400)
    );
  }

  const event = await findEventById(eventId);

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
    // 1. Identify Core Roles and Substitutes
    const coreRoles = ["igl", "rusher", "sniper", "support"];
    const players = [];
    const substitutes = [];

    const foundCoreRoles = new Set();
    team.teamMembers.forEach(member => {
      if (member.isActive) {
        if (coreRoles.includes(member.roleInTeam)) {
          players.push(member.user);
          foundCoreRoles.add(member.roleInTeam);
        } else {
          substitutes.push(member.user);
        }
      }
    });

    if (foundCoreRoles.size < 4) {
      return next(new CustomError("Your team must have an IGL, Rusher, Sniper, and Support to register.", 400));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Atomic Slot Increment with condition check
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          registrationStatus: "registration-open",
          $expr: { $lt: ["$joinedSlots", "$maxSlots"] }
        },
        { $inc: { joinedSlots: 1 } },
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

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message: "Your Team successfully registered for the tournament",
      });

    } catch (error) {
      await session.abortTransaction();
      return next(error);
    } finally {
      session.endSession();
    }
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

  res.json({
    registered: false,
    status: "none",
  });
});

export const fetchAllRegisteredTeams = TryCatchHandler(
  async (req, res, next) => {
    const { eventId } = req.params;
    let { cursor, limit = 10 } = req.query;

    limit = parseInt(limit);
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
        (r.role === "org:owner" || r.role === "org:manager") &&
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
          (r.role === "org:owner" || r.role === "org:manager") &&
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
      "eventEndAt", "prizePool", "category", "eventType", "prizeDistribution"
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

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

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true,
    });

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
        (r.role === "org:owner" || r.role === "org:manager") &&
        r.scopeId.toString() === event.orgId.toString())
  );
  if (!isAuthorized) throw new CustomError("Not authorized to delete this event", 403);

  const deletedEvent = await Event.findByIdAndDelete(eventId);

  // Cleanup associated assets/data
  if (deletedEvent && deletedEvent.imageFileId) {
    deleteFromImageKit(deletedEvent.imageFileId).catch(err =>
      logger.error(`Failed to cleanup event image ${deletedEvent.imageFileId}:`, err)
    );
  }

  // Cascade deletions
  await Promise.all([
    EventRegistration.deleteMany({ eventId: deletedEvent._id }),
    Round.deleteMany({ eventId: deletedEvent._id }),
    Group.deleteMany({ eventId: deletedEvent._id })
  ]);

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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const registration = await EventRegistration.findOneAndDelete(
      { eventId, teamId: user.teamId },
      { session }
    );

    if (!registration) {
      throw new CustomError("You are not registered for this event", 400);
    }

    // Atomic Slot Decrement
    await Event.updateOne(
      { _id: eventId, joinedSlots: { $gt: 0 } },
      { $inc: { joinedSlots: -1 } },
      { session }
    );

    // Optional: Remove from histroy? Usually history remains, but user requested "atomic with registration"
    // If they meant cleanup history too:
    // await User.updateMany({ _id: { $in: teamMembers } }, { $pull: { eventHistory: eventId } }, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Successfully unregistered from the event",
    });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
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
      (r.role === "org:owner" || r.role === "org:manager") &&
      r.scopeId.toString() === event.orgId.toString()
  );
  if (!isAuthorized) throw new CustomError("Not authorized to start this event", 403);

  // 3. Status Check
  if (event.eventProgress === "ongoing" || event.eventProgress === "completed") {
    return next(new CustomError("Event is already active or completed", 400));
  }

  // 4. Update Event Status
  // "we will only chnage two thing registration will close and progress is ongoing"
  event.registrationStatus = "registration-closed";
  event.eventProgress = "ongoing";

  await event.save();

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
      (r.role === "org:owner" || r.role === "org:manager") &&
      r.scopeId.toString() === event.orgId.toString()
  );
  if (!isAuthorized) throw new CustomError("Not authorized to finish this event", 403);

  if (event.eventProgress === "completed") {
    return next(new CustomError("Event is already completed", 400));
  }

  event.eventProgress = "completed";
  event.registrationStatus = "registration-closed";

  await event.save();

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