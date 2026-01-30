import fs from "fs";
import mongoose from "mongoose";

import Organizer from "../models/organizer.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import EventRegistration from "../models/event-model/event-registration.model.js";
import JoinRequest from "../models/join-request.model.js";

import { TryCatchHandler } from "../middleware/error.middleware.js";
import { generateTokens, storeRefreshToken, setCookies } from "../services/auth.service.js";
import { CustomError } from "../utils/CustomError.js";

import { findUserById } from "../services/user.service.js";
import { findTeamById } from "../services/team.service.js";
import { findEventById } from "../services/event.service.js";
import { uploadOnImageKit } from "../services/imagekit.service.js";

const requiredFields = [
  "title",
  "game",
  "startDate",
  "registrationEndsAt",
  "slots",
  "category",
];

export const createEvent = TryCatchHandler(async (req, res, next) => {
  const { userId, roles } = req.user;

  const handleError = (message, status) => {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next(new CustomError(message, status));
  };

  const user = await findUserById(userId);

  const org = await Organizer.findById(user.orgId);
  if (!org || org.isDeleted) {
    return handleError("Organization not found or inactive", 404);
  }

  const hasAuth = roles.some(
    (r) =>
      r.scope === "org" &&
      r.scopeModel === "Organizer" &&
      (r.role === "org:owner" || r.role === "org:manager") &&
      r.scopeId.toString() === user.orgId.toString()
  );
  if (!hasAuth)
    return handleError("Not authorized for this organization", 403);

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return handleError(`${field} is required`, 400);
    }
  }

  const startDate = new Date(req.body.startDate);
  const registrationEndsAt = new Date(req.body.registrationEndsAt);


  const slotsNum = Number(req.body.slots);
  if (isNaN(slotsNum) || slotsNum <= 0) {
    return handleError("Slots must be a number greater than 0", 400);
  }

  if (Number(req.body.prizePool) < 0) {
    return next(new CustomError("Prize pool cannot be negative", 400));
  }

  const exists = await Event.findOne({
    title: req.body.title,
    orgId: user.orgId,
  });

  if (exists) {
    return handleError("Event already exists", 409);
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

  const event = await Event.create({
    title: req.body.title,
    game: req.body.game,
    eventType: (req.body.eventType || "tournament").toLowerCase(),
    category: (req.body.category || "solo").toLowerCase(),
    startDate,
    registrationEndsAt,
    maxSlots: slotsNum,
    registrationMode: req.body.registrationMode || "open",
    status: req.body.status || "registration-open",
    orgId: user.orgId,
    description: req.body.description,
    prizePool: Number(req.body.prizePool) || 0,
    image: imageUrl,
    imageFileId: imageFileId,
    eventEndAt: req.body.eventEndAt ? new Date(req.body.eventEndAt) : null,
    prizeDistribution: req.body.prizeDistribution ? (typeof req.body.prizeDistribution === 'string' ? JSON.parse(req.body.prizeDistribution) : req.body.prizeDistribution) : [],
  });

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: event,
  });
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
    return next(new AppError("Invalid event id", 400));
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
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (game && game !== 'all') query.game = { $regex: `^${game}$`, $options: "i" };
  if (category && category !== 'all') query.category = category.toLowerCase();
  if (status && status !== 'all') query.status = status;

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
  if (event.status !== "registration-open") {
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

    // Map to track if we found at least one of each core role
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

    // Handle duplicate core roles (if team has 2 rushers, only one is required for 'core', but user wants all core roles registered)
    // Actually per user: "IGL, Rusher, Sniper, and Support roles will be automatically registered... Any other roles will be listed as substitutes."
    // And "Any other roles will be listed as substitutes."
    // And "they fift player can register... if 4 player crotore these okay"

    // Validation: Must have at least one of each core role
    if (foundCoreRoles.size < 4) {
      return next(new CustomError("Your team must have an IGL, Rusher, Sniper, and Support to register.", 400));
    }

    // Atomic Slot Increment with condition check
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: "registration-open",
        $expr: { $lt: ["$joinedSlots", "$maxSlots"] }
      },
      { $inc: { joinedSlots: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return next(new CustomError("Event is full or registration is not open", 400));
    }

    try {
      // Register team directly
      await EventRegistration.create({
        eventId: event._id,
        teamId: team._id,
        status: "approved",
        players,
        substitutes,
      });
    } catch (error) {
      // Rollback the slot increment if registration creation fails
      await Event.updateOne({ _id: eventId }, { $inc: { joinedSlots: -1 } });
      throw error;
    }

    // Update team and user history (as before)
    if (!team.playedTournaments.includes(eventId)) {
      team.playedTournaments.push(eventId);
      await team.save();
    }
    await User.updateMany(
      { _id: { $in: team.teamMembers.map((m) => m.user) }, eventHistory: { $ne: eventId } },
      { $push: { eventHistory: eventId } }
    );

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

  // Check approved registration
  const registration = await EventRegistration.findOne({
    eventId,
    teamId,
  });

  if (registration) {
    return res.json({ registered: true, status: "approved" });
  }

  // Check pending request (since teamId is at User level, we check for User's pending request for this Event)
  const user = await User.findOne({ teamId });
  if (user) {
    const request = await JoinRequest.findOne({
      requester: user._id,
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

    const registrations = await EventRegistration.find({ eventId })
      .populate("teamId", "teamName imageUrl")
      .lean();

    const teams = registrations.map(reg => reg.teamId);

    return res.status(200).json({
      totalTeams: teams.length,
      teams: teams,
    });
  }
);

export const closeRegistration = async (req, res) => {
  try {
    // Event ID from params
    const { eventId } = req.params;

    // Event find karo
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if already closed
    if (event.status === "registration_closed") {
      return res.status(400).json({ message: "Registration already closed" });
    }

    // Registration close karna
    event.status = "registration_closed";
    await event.save();

    res.status(200).json({
      message: "Registration closed successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Update Event
export const updateEvent = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const { userId, roles } = req.user;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new CustomError("Event not found", 404));
  }

  const user = await findUserById(userId);
  const hasAuth = roles.some(
    (r) =>
      r.scope === "org" &&
      r.scopeModel === "Organizer" &&
      (r.role === "org:owner" || r.role === "org:manager") &&
      r.scopeId.toString() === event.orgId.toString()
  );

  if (!hasAuth) {
    return next(new CustomError("Not authorized to update this event", 403));
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
        await deleteFromImageKit(event.imageFileId);
      }
      imageUrl = uploadRes.url;
      imageFileId = uploadRes.fileId;
    }
  }

  const updateData = { ...req.body };
  if (imageUrl) updateData.image = imageUrl;
  if (imageFileId) updateData.imageFileId = imageFileId;

  if (req.body.slots) {
    updateData.maxSlots = Number(req.body.slots);
    delete updateData.slots;
  }

  if (req.body.prizePool) {
    updateData.prizePool = Number(req.body.prizePool);
  }

  if (imageUrl) {
    updateData.image = imageUrl;
  }

  if (req.body.category) {
    updateData.category = req.body.category.toLowerCase();
  }

  if (req.body.eventType) {
    updateData.eventType = req.body.eventType.toLowerCase();
  }

  if (req.body.prizeDistribution) {
    try {
      updateData.prizeDistribution = typeof req.body.prizeDistribution === 'string' ? JSON.parse(req.body.prizeDistribution) : req.body.prizeDistribution;
    } catch (e) {
      console.error("Error parsing prizeDistribution:", e);
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
});

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);

    if (!deletedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Cleanup ImageKit asset
    if (deletedEvent.imageFileId) {
      deleteFromImageKit(deletedEvent.imageFileId);
    }

    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unregisterEvent = TryCatchHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { eventId } = req.params;

  const user = await findUserById(userId);
  if (!user.teamId) {
    return next(new CustomError("You are not part of any team", 400));
  }

  const registration = await EventRegistration.findOneAndDelete({
    eventId,
    teamId: user.teamId,
  });

  if (!registration) {
    return next(new CustomError("You are not registered for this event", 400));
  }

  // Atomic Slot Decrement
  await Event.updateOne(
    { _id: eventId, joinedSlots: { $gt: 0 } },
    { $inc: { joinedSlots: -1 } }
  );

  res.status(200).json({
    success: true,
    message: "Successfully unregistered from the event",
  });
});

// TODO: Event owner can remove any team from the event
// TODO: Notification feature using socket.io