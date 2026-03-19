import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";

import Event from "./event.model.js";
import { GAMES_MAPS, REQUIRED_EVENT_FIELDS } from "./event.constants.js";
import { clearEventCache, escapeRegex } from "./event.utils.js";
import EventRegistration from "./models/event-registration.model.js";
import JoinRequest from "../join-request/join-request.model.js";
import Round from "./models/round.model.js";
import Group from "./models/group.model.js";
import User from "../user/user.model.js";

import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { CustomError } from "../../shared/utils/CustomError.js";

import {
  createEventService,
  updateEventService,
  deleteEventService,
  registerEventService,
  unregisterEventService,
  handleImageUpload,
  handleImageDelete
} from "./event.service.js";
import { logger } from "../../shared/utils/logger.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js"

export const createEvent = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.user.cachedProfile;

  // Handle image uploading
  let imageUrl = null;
  let imageFileId = null;

  try {
    // 1. Validate required fields
    for (const field of REQUIRED_EVENT_FIELDS) {
      if (!req.body[field]) {
        throw new CustomError(`${field} is required`, 400);
      }
    }

    // 2. Image management
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const uploadRes = await handleImageUpload(
        req.file.path,
        `event-poster-${Date.now()}${ext}`
      );
      if (uploadRes) {
        imageUrl = uploadRes.imageUrl;
        imageFileId = uploadRes.imageFileId;
      }
    }

    // 3. Delegate to Service (Service handles all complex normalization)
    const event = await createEventService(orgId, {
      ...req.body,
      image: imageUrl,
      imageFileId: imageFileId
    });

    await clearEventCache(orgId);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (err) {
    if (imageFileId) {
      handleImageDelete(imageFileId);
    }
    throw err;
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { }
    }
  }
});

export const fetchEventByOrg = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.params;

  if (!isValidObjectId(orgId)) {
    throw new CustomError("Invalid Organization ID", 400);
  }

  const events = await Event.find({ orgId })
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();

  return res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

export const fetchEventDetailsById = TryCatchHandler(async (req, res, next) => {
  const event = req.eventDoc;
  const { eventId } = req.params;

  // Increment views lazily
  Event.findByIdAndUpdate(eventId, { $inc: { views: 1 } }).exec().catch(err => logger.error("Failed to increment views:", err));

  // Populate org details (Event middleware might have already fetched but not populated)
  const populatedEvent = await Event.populate(event, { path: "orgId", select: "name orgName imageUrl isVerified slug" });

  // Handle isLiked status if user is authenticated
  const isLiked = req.user && req.user.userId && populatedEvent.likedBy && populatedEvent.likedBy.some(id => id.toString() === req.user.userId.toString());

  res.status(200).json({
    success: true,
    message: "Event details fetched successfully",
    data: {
      ...populatedEvent.toObject ? populatedEvent.toObject() : populatedEvent,
      isLiked: !!isLiked
    },
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
    if (!isValidObjectId(cursor)) {
      return next(new CustomError("Invalid cursor ID", 400));
    }
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
  const team = req.teamDoc;
  const event = req.eventDoc;

  const result = await registerEventService(eventId, userId, team, event);

  // Clear cache after successful registration
  await clearEventCache(event.orgId, eventId);

  return res.status(200).json(result);
});

export const isTeamRegistered = TryCatchHandler(async (req, res, next) => {
  const { eventId, teamId } = req.params;

  if (!isValidObjectId(teamId)) {
    throw new CustomError("Invalid Team ID", 400);
  }

  // Check approved registration
  const registration = await EventRegistration.findOne({ eventId, teamId });
  if (registration) {
    return res.json({ registered: true, status: "approved" });
  }

  // Check pending request
  const request = await JoinRequest.findOne({
    requester: { $in: await User.find({ teamId }).distinct("_id") },
    target: eventId,
    targetModel: "Event",
    status: "pending",
  });

  res.json({
    registered: !!request,
    status: request ? "pending" : "none",
  });
});

export const fetchAllRegisteredTeams = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  let { cursor, limit = 10, search = "" } = req.query;

  limit = Math.min(parseInt(limit), 100);

  const pipeline = [
    { $match: { eventId: new mongoose.Types.ObjectId(eventId), status: "approved" } },
    {
      $lookup: {
        from: "teams",
        localField: "teamId",
        foreignField: "_id",
        as: "teamDetails"
      }
    },
    { $unwind: "$teamDetails" },
    {
      $match: {
        "teamDetails.teamName": { $regex: escapeRegex(search), $options: "i" }
      }
    },
    { $sort: { _id: 1 } }
  ];

  if (cursor) {
    pipeline.push({ $match: { _id: { $gt: new mongoose.Types.ObjectId(cursor) } } });
  }

  pipeline.push({ $limit: limit + 1 });

  const registrations = await EventRegistration.aggregate(pipeline);

  let nextCursor = null;
  let hasMore = false;

  if (registrations.length > limit) {
    const extraItem = registrations.pop();
    nextCursor = extraItem._id;
    hasMore = true;
  }

  const teams = registrations.map(reg => ({
    ...reg.teamDetails,
    registrationId: reg._id,
    joinedAt: reg.createdAt
  }));

  return res.status(200).json({
    success: true,
    totalTeams: teams.length,
    teams,
    nextCursor,
    hasMore
  });
});

export const fetchInvitedTeams = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  let { cursor, limit = 10, search = "" } = req.query;

  limit = Math.min(parseInt(limit), 100);

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(eventId) } },
    { $unwind: "$invitedTeams" },
    {
      $lookup: {
        from: "teams",
        localField: "invitedTeams",
        foreignField: "_id",
        as: "teamDetails"
      }
    },
    { $unwind: "$teamDetails" },
    {
      $match: {
        "teamDetails.teamName": { $regex: escapeRegex(search), $options: "i" }
      }
    },
    { $sort: { "teamDetails._id": 1 } }
  ];

  if (cursor) {
    pipeline.push({ $match: { "teamDetails._id": { $gt: new mongoose.Types.ObjectId(cursor) } } });
  }

  pipeline.push({ $limit: limit + 1 });

  const result = await Event.aggregate(pipeline);

  let nextCursor = null;
  let hasMore = false;

  if (result.length > limit) {
    const extraItem = result.pop();
    nextCursor = extraItem.teamDetails._id;
    hasMore = true;
  }

  const teams = result.map(entry => entry.teamDetails);

  res.status(200).json({
    success: true,
    teams,
    nextCursor,
    hasMore
  });
});

export const closeRegistration = TryCatchHandler(async (req, res) => {
  const event = req.eventDoc;

  if (event.registrationStatus === "registration-closed") {
    throw new CustomError("Registration already closed", 400);
  }

  event.registrationStatus = "registration-closed";
  await event.save();

  await clearEventCache(event.orgId, event._id);

  res.status(200).json({
    success: true,
    message: "Registration closed successfully",
    data: event,
  });
});

export const updateEvent = TryCatchHandler(async (req, res, next) => {
  const event = req.eventDoc;
  const { eventId } = req.params;

  try {
    // Handle image update if file provided
    let imageUrl = event.image;
    let imageFileId = event.imageFileId;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const uploadRes = await handleImageUpload(
        req.file.path,
        `event-poster-${event._id}-${Date.now()}${ext}`,
        event.imageFileId
      );

      if (uploadRes) {
        imageUrl = uploadRes.imageUrl;
        imageFileId = uploadRes.imageFileId;
      }
    }

    // 3. Delegate to Service (Service handles all complex normalization and validation)
    const updatedEvent = await updateEventService(eventId, event, {
      ...req.body,
      image: imageUrl,
      imageFileId: imageFileId
    });

    await clearEventCache(event.orgId, eventId);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { logger.error("Failed to delete local file:", e); }
    }
  }
});

export const deleteEvent = TryCatchHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = req.eventDoc;

  const deletedEvent = await deleteEventService(eventId);

  // Post-transaction cleanup for image
  if (deletedEvent.imageFileId) {
    handleImageDelete(deletedEvent.imageFileId);
  }

  // Clear cache
  await clearEventCache(event.orgId, eventId);

  res.status(200).json({
    success: true,
    message: "Event and associated data deleted successfully"
  });
});

export const unregisterEvent = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const team = req.teamDoc;

  await unregisterEventService(eventId, team._id);

  // Clear cache
  await clearEventCache(req.eventDoc?.orgId, eventId);

  res.status(200).json({
    success: true,
    message: "Successfully unregistered from the event",
  });
});

export const startEvent = TryCatchHandler(async (req, res, next) => {
  const event = req.eventDoc;
  const { eventId } = req.params;

  if (event.eventProgress !== "pending") {
    throw new CustomError("Event must be in pending state to start", 400);
  }

  event.registrationStatus = "registration-closed";
  event.eventProgress = "ongoing";
  await event.save();

  await clearEventCache(event.orgId, eventId);

  // Normalize response (Consistent with fetchEventDetailsById)
  const populatedEvent = await Event.populate(event, { path: "orgId", select: "name orgName imageUrl isVerified slug" });
  const isLiked = req.user && req.user.userId && populatedEvent.likedBy?.some(id => id.toString() === req.user.userId.toString());

  res.status(200).json({
    success: true,
    message: "Event started successfully! Registration closed, progress set to ongoing.",
    data: {
      ...populatedEvent.toObject ? populatedEvent.toObject() : populatedEvent,
      isLiked: !!isLiked
    }
  });
});

export const finishEvent = TryCatchHandler(async (req, res, next) => {
  const event = req.eventDoc;

  if (event.eventProgress === "completed") {
    throw new CustomError("Event is already completed", 400);
  }

  event.eventProgress = "completed";
  event.registrationStatus = "registration-closed";

  await event.save();

  await clearEventCache(event.orgId, event._id);

  // Normalize response
  const populatedEvent = await Event.populate(event, { path: "orgId", select: "name orgName imageUrl isVerified slug" });
  const isLiked = req.user && req.user.userId && populatedEvent.likedBy?.some(id => id.toString() === req.user.userId.toString());

  res.status(200).json({
    success: true,
    message: "Event finished successfully! Final leaderboard is now available.",
    data: {
      ...populatedEvent.toObject ? populatedEvent.toObject() : populatedEvent,
      isLiked: !!isLiked
    }
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

export const fetchT1SpecialTeams = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  let { cursor, limit = 10, search = "" } = req.query;

  limit = Math.min(parseInt(limit), 100);

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(eventId) } },
    { $unwind: "$t1SpecialTeams" },
    {
      $lookup: {
        from: "teams",
        localField: "t1SpecialTeams",
        foreignField: "_id",
        as: "teamDetails"
      }
    },
    { $unwind: "$teamDetails" },
    {
      $match: {
        "teamDetails.teamName": { $regex: escapeRegex(search), $options: "i" }
      }
    },
    { $sort: { "teamDetails._id": 1 } }
  ];

  if (cursor) {
    pipeline.push({ $match: { "teamDetails._id": { $gt: new mongoose.Types.ObjectId(cursor) } } });
  }

  pipeline.push({ $limit: limit + 1 });

  const result = await Event.aggregate(pipeline);

  let nextCursor = null;
  let hasMore = false;

  if (result.length > limit) {
    const extraItem = result.pop();
    nextCursor = extraItem.teamDetails._id;
    hasMore = true;
  }

  const teams = result.map(entry => entry.teamDetails);

  res.status(200).json({
    success: true,
    teams,
    nextCursor,
    hasMore
  });
});

export const toggleLikeEvent = TryCatchHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user?.userId;
  const event = req.eventDoc;

  const alreadyLiked = event.likedBy && event.likedBy.some(id => id.toString() === userId.toString());

  let updatedEvent;
  if (alreadyLiked) {
    updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, likedBy: userId },
      [
        {
          $set: {
            likes: { $max: [0, { $subtract: ["$likes", 1] }] },
            likedBy: {
              $filter: {
                input: "$likedBy",
                as: "id",
                cond: { $ne: ["$$id", new mongoose.Types.ObjectId(userId)] }
              }
            }
          }
        }
      ],
      { new: true }
    );
  } else {
    updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, likedBy: { $ne: userId } },
      {
        $addToSet: { likedBy: userId },
        $inc: { likes: 1 }
      },
      { new: true }
    );
  }

  if (!updatedEvent) {
    // If null, state already toggled by someone else
    const currentEvent = await Event.findById(eventId);
    const finalLiked = currentEvent.likedBy && currentEvent.likedBy.some(id => id.toString() === userId.toString());

    return res.status(200).json({
      success: true,
      message: finalLiked ? "Tournament liked" : "Tournament unliked",
      data: {
        likesCount: currentEvent.likes,
        isLiked: finalLiked
      }
    });
  }

  // Cache invalidation
  await clearEventCache(event.orgId, eventId);

  const finalLiked = updatedEvent.likedBy && updatedEvent.likedBy.some(id => id.toString() === userId.toString());

  return res.status(200).json({
    success: true,
    message: finalLiked ? "Tournament liked" : "Tournament unliked",
    data: {
      likesCount: updatedEvent.likes,
      isLiked: finalLiked
    }
  });
});

// TODO: Event owner can remove any team from the event
// TODO: Notification feature using socket.io