import mongoose from "mongoose";

import Organizer from "../models/organizer.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";

import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";

import { findUserById } from "../services/user.service.js";
import { findTeamById } from "../services/team.service.js";
import { findEventById } from "../services/event.service.js";

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

  const user = await findUserById(userId);

  const org = await Organizer.findById(user.orgId);
  if (!org || org.isDeleted) {
    return next(new CustomError("Organization not found or inactive", 404));
  }

  const isOrgOwner = roles.some(
    (r) =>
      r.scope === "org" &&
      r.scopeModel === "Organization" &&
      r.role === "org:owner" &&
      r.scopeId.toString() === user.orgId.toString()
  );
  if (!isOrgOwner)
    return next(new CustomError("Not authorized for this organization", 403));

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new CustomError(`${field} is required`, 400));
    }
  }

  const startDate = new Date(req.body.startDate);
  const registrationEnds = new Date(req.body.registrationEnds);

  if (registrationEnds >= startDate) {
    return next(
      new CustomError("Registration must end before event start", 400)
    );
  }

  if (Number(req.body.slots) <= 0) {
    return next(new CustomError("Slots must be greater than 0", 400));
  }

  if (Number(req.body.prizePool) < 0) {
    return next(new CustomError("Prize pool cannot be negative", 400));
  }

  const exists = await Event.findOne({
    title: req.body.title,
    orgId: user.orgId,
  });

  if (exists) {
    return next(new CustomError("Event already exists", 409));
  }

  // handle image uplaoding logic here
  const imageUrl = "https://cloudinary/dummy-image-url";

  const event = await Event.create({
    ...req.body,
    orgId: user.orgId,
    createdBy: user._id,
    image: imageUrl,
    trending: false,
    eventEndsAt: req.body.registrationEndsAt,
  });

  res.status(201).json(event);
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

  const event = await Event.findById(eventId);

  if (!event) {
    return next(new CustomError("Event not found", 404));
  }

  // Optional: increase views count
  // event.views += 1;
  // await event.save();

  res.status(200).json({
    success: true,
    message: "Event details fetched successfully",
    data: event,
  });
});

export const fetchAllEvents = TryCatchHandler(async (req, res, next) => {
  const events = await Event.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: events,
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

  // Slot check
  if (event.teamId.length >= event.slots) {
    return next(new CustomError("Event registration is full", 400));
  }

  // Duplicate check
  const isAlreadyRegistered = event.teamId.some(
    (id) => id.toString() === team._id.toString()
  );
  if (isAlreadyRegistered) {
    return next(
      new CustomError("Your team is already registered for this event", 400)
    );
  }

  // Register team
  event.teamId.push(team._id);
  await event.save();

  // Update team history
  if (!team.playedTournaments.includes(eventId)) {
    team.playedTournaments.push(eventId);
    await team.save();
  }

  // Update users history
  await User.updateMany(
    {
      _id: { $in: team.teamMembers.map((m) => m.user) },
      eventHistory: { $ne: eventId },
    },
    { $push: { eventHistory: eventId } }
  );

  return res.status(200).json({
    success: true,
    message: "Yor Team successfully registered for the tournament",
  });
});

export const isTeamRegistered = TryCatchHandler(async (req, res, next) => {
  const { eventId, teamId } = req.params;

  const event = await Event.findOne({
    _id: eventId,
    teamId: teamId,
  });

  res.json({
    registered: !!event,
  });
});

export const fetchAllRegisteredTeams = TryCatchHandler(
  async (req, res, next) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate("teamId", "teamName imageUrl")
      .select("teamsId");

    if (!event) {
      return next(new CustomError("Event not found", 404));
    }

    return res.status(200).json({
      totalTeams: event.teamId.length,
      teams: event.teamId,
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
export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { new: true }
    );

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);

    if (!deletedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEvents = TryCatchHandler(async (req, res, next) => {
  try {
    let { cursor, limit = 10, search } = req.query;

    limit = parseInt(limit);

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const events = await Event.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);

    let nextCursor = null;
    if (events.length > limit) {
      const lastEvent = events.pop();
      nextCursor = lastEvent._id;
    }
    const hasMore = nextCursor !== null;

    // 🔹 Response
    res.status(200).json({ success: true, events, nextCursor, hasMore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// TO-DO -> Event owner can remove any team from the event
// TO-DO -> notification feature using socket.io
