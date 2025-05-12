import mongoose from "mongoose";
import Event from "../models/event-model/event.model.js";
import Organizer from "../models/organizer.model.js";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";
import TeamNotification from "../models/notification-model/team.notification.model.js";

export const getAllEvents = async (req, res) => {
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
};

export const createEvent = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser || !loggedInUser.activeOrganizer) {
      return res
        .status(403)
        .json({ message: "You are not an active organizer!" });
    }

    const organization = await Organizer.findById(loggedInUser.activeOrganizer);
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization Not found" });
    }

    const {
      title,
      game,
      startDate,
      registrationEnds,
      mode,
      slots,
      category,
      prizePool,
      image,
      description,
    } = req.body;

    // Validation for missing fields
    if (
      !title ||
      !game ||
      !startDate ||
      !registrationEnds ||
      !mode ||
      !slots ||
      !category ||
      !prizePool ||
      !image ||
      !description
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const newEvent = new Event({
      title,
      game,
      startDate,
      registrationEnds,
      mode,
      slots,
      category,
      prizePool,
      image,
      description,
      organizerId: organization._id, // Ensure req.user._id exists
    });

    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (error) {
    console.log("Error in createTournament controller :", error);
    res.status(500).json({ message: error.message });
  }
};

export const getEventDetails = async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid event ID" });
  }

  try {
    const eventDetails = await Event.findById(eventId).populate(
      "organizerId",
      "name"
    );
    // .populate("prize")
    // .populate("rounds");

    if (!eventDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, events: eventDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerEvent = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { eventId } = req.params;

    // Validate Event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Event ID" });
    }

    // Check if user has an active team
    if (!loggedInUser.activeTeam) {
      return res.status(400).json({
        success: false,
        message: "You don't have a team to register for events",
      });
    }

    // Fetch the team
    const team = await Team.findById(loggedInUser.activeTeam);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Check if team has at least 4 players
    // if (team.members.length < 4) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Your team must have at least 4 players to register",
    //   });
    // }

    // Fetch the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check if the event is full
    if (event.teams.length >= event.slots) {
      return res
        .status(400)
        .json({ success: false, message: "Event registration is full" });
    }

    // Check if team is already registered
    const isAlreadyRegistered = event.teams.some(
      (t) => t?.teamId?.toString() === team._id.toString()
    );
    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "Your team is already registered for this event",
      });
    }

    // Check if event registration has ended
    if (new Date() > new Date(event.registrationEnds)) {
      return res.status(400).json({
        success: false,
        message: "Registration for this event has ended",
      });
    }

    // Check if event is active for registration
    if (event.status !== "registration-open") {
      return res
        .status(400)
        .json({ success: false, message: "Event registration is not open" });
    }

    // Register the team
    event.teams.push({ teamId: team._id, registeredAt: new Date() });
    await event.save();

    // Ensure event is not duplicated in playedTournaments
    if (!team.playedTournaments.includes(eventId)) {
      team.playedTournaments.push(eventId);
      await team.save();
    }

    // Update eventHistory for each member only if eventId is not already present
    await User.updateMany(
      {
        _id: { $in: team.members.map((m) => m.userId) },
        eventHistory: { $ne: eventId },
      },
      { $push: { eventHistory: eventId } }
    );

    // Generate notifications for all team members
    const notifications = team.members.map((member) => ({
      user: member.userId,
      type: "announcement",
      message: `Your team has successfully registered for the event: ${event.title}`,
      relatedId: event._id,
    }));

    await TeamNotification.insertMany(notifications);

    return res.status(200).json({
      success: true,
      message: "Team successfully registered for the event",
      notifications,
    });
  } catch (error) {
    console.error("Error in registerEvent controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const leaveEvent = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { eventId } = req.params;

    // Check if eventId is valid
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Event ID" });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check if user has a team
    if (!loggedInUser.activeTeam) {
      return res.status(400).json({
        success: false,
        message: "You don't have a team",
      });
    }

    // Find the team
    const team = await Team.findById(loggedInUser.activeTeam);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Check if user is the team owner
    if (team.owner.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team owner can leave the event",
      });
    }

    // Check if team is registered in the event
    if (!event.teams.some((t) => t.teamId.toString() === team._id.toString())) {
      return res.status(400).json({
        success: false,
        message: "Team is not registered in this event",
      });
    }

    // Remove team from event
    await Event.findByIdAndUpdate(
      eventId,
      { $pull: { teams: { teamId: team._id } } },
      { new: true }
    );

    // Notify all team members
    const notifications = team.members.map((member) => ({
      user: member.userId,
      type: "announcement",
      message: `Your team '${team.teamName}' has left the event '${event.title}'.`,
      relatedId: event._id,
    }));

    await TeamNotification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: "Team successfully left the event",
      notifications,
    });
  } catch (error) {
    console.log("Error in leaveEvent controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

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

// to-do -  Event host can remove any team from the event
