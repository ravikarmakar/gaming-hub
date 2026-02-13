import Round from "../models/round.model.js";
import Event from "../event.model.js";
import EventRegistration from "../models/event-registration.model.js";
import mongoose from "mongoose";
import { logger } from "../../../shared/utils/logger.js";
import { TryCatchHandler } from "../../../shared/middleware/error.middleware.js";

export const getRounds = TryCatchHandler(async (req, res) => {
  const { eventId } = req.query;
  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Valid Event ID is required" });
  }

  // Use aggregation to fetch rounds along with their groups
  const rounds = await Round.aggregate([
    {
      $match: { eventId: new mongoose.Types.ObjectId(eventId) }
    },
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "roundId",
        as: "groups"
      }
    },
    { $sort: { roundNumber: 1 } } // Sort by round number
  ]);

  res.status(200).json({
    success: true,
    data: rounds,
  });
});

export const createRound = TryCatchHandler(async (req, res) => {
  const { eventId, roundName, startTime, dailyStartTime, dailyEndTime, gapMinutes, matchesPerGroup, qualifyingTeams } = req.body;

  // Event ID check
  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Valid Event ID is required!" });
  }

  // Check if Event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found!" });
  }

  // Check if Teams are registered (using EventRegistration) - Only count approved registrations
  const totalTeams = await EventRegistration.countDocuments({ eventId, status: "approved" });
  if (totalTeams === 0) {
    return res.status(400).json({
      message:
        "Cannot create a round. No teams have approved registrations in this event!",
    });
  }

  // Check for ongoing round
  const existingOngoingRound = await Round.findOne({
    eventId,
    status: "ongoing",
  });
  if (existingOngoingRound) {
    return res
      .status(400)
      .json({ message: "An ongoing round already exists!" });
  }

  // 🚀 Atomic round counter increment
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $inc: { roundCount: 1 } },
    { new: true, runValidators: true }
  );

  const roundNumber = updatedEvent.roundCount;

  // Create the round
  const newRound = await Round.create({
    eventId,
    roundName: roundName || `Round-${roundNumber}`,
    status: "pending",
    roundNumber,
    startTime,
    dailyStartTime,
    dailyEndTime,
    gapMinutes,
    matchesPerGroup,
    qualifyingTeams
  });

  // Note: We do not push to event.rounds because Event schema does not have a rounds array
  // The relationship is handled by Round.eventId

  // ✅ PUSH NOTIFICATIONS TO ALL REGISTERED TEAMS
  try {
    // Find all approved registrations for this event to get the teamIds
    const registrations = await EventRegistration.find({ eventId, status: "approved" }).populate("teamId");

    const notificationsToCreate = [];
    const Notification = mongoose.model("Notification");

    for (const reg of registrations) {
      if (!reg.teamId) continue;

      const team = reg.teamId;
      const recipientIds = team.teamMembers
        .filter(m => m.isActive)
        .map(m => m.user);

      for (const userId of recipientIds) {
        notificationsToCreate.push({
          recipient: userId,
          sender: req.user._id,
          type: "ROUND_CREATED",
          content: {
            title: "New Round Created!",
            message: `${event.eventName}: ${newRound.roundName} has been created. ${startTime ? `Scheduled to start on ${new Date(startTime).toISOString()}.` : 'Schedule is pending.'}`
          },
          relatedData: {
            eventId,
            teamId: team._id
          }
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (notifError) {
    logger.error("Error sending round creation notifications:", notifError);
  }

  return res.status(201).json({
    message: "New round created successfully!",
    rounds: newRound,
  });
});

export const getRoundDetails = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;

  // ✅ 1. Check if Round ID is provided
  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    return res.status(400).json({ message: "Valid Round ID is required!" });
  }

  // ✅ 2. Fetch Round Details with Event & Groups
  const round = await Round.findById(roundId).populate(
    "eventId",
    "eventName slots teams"
  ); // Event ke sirf necessary fields

  // ✅ 3. Check if Round Exists
  if (!round) {
    return res.status(404).json({ message: "Round not found!" });
  }

  return res.status(200).json({
    message: "Round details fetched successfully!",
    round,
  });
});

export const updateRound = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;
  const { roundName, startTime, dailyStartTime, dailyEndTime, gapMinutes, matchesPerGroup, qualifyingTeams, status } = req.body;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    return res.status(400).json({ message: "Valid Round ID required" });
  }

  if (status && !["pending", "ongoing", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const updateData = {};
  if (roundName) updateData.roundName = roundName;
  if (startTime) updateData.startTime = startTime;
  if (dailyStartTime) updateData.dailyStartTime = dailyStartTime;
  if (dailyEndTime) updateData.dailyEndTime = dailyEndTime;
  if (gapMinutes !== undefined) updateData.gapMinutes = gapMinutes;
  if (matchesPerGroup !== undefined) updateData.matchesPerGroup = matchesPerGroup;
  if (qualifyingTeams !== undefined) updateData.qualifyingTeams = qualifyingTeams;
  if (status) updateData.status = status;

  const round = await Round.findByIdAndUpdate(
    roundId,
    updateData,
    { new: true }
  );

  if (!round) return res.status(404).json({ message: "Round not found" });

  res.status(200).json({
    success: true,
    message: "Round updated successfully",
    round // Return specific round or handle in store
  });
});

export const deleteRound = TryCatchHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { roundId } = req.params;

    if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Valid Round ID required" });
    }

    const round = await Round.findById(roundId).session(session);
    if (!round) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Round not found" });
    }

    // 1. Find all groups for this round
    const groups = await mongoose.model("Group").find({ roundId }).session(session);
    const groupIds = groups.map(g => g._id);

    // 2. Delete Leaderboards for these groups
    if (groupIds.length > 0) {
      await mongoose.model("Leaderboard").deleteMany({ groupId: { $in: groupIds } }).session(session);
    }

    // 3. Delete Groups
    await mongoose.model("Group").deleteMany({ roundId }).session(session);

    // 4. Delete Round
    await Round.findByIdAndDelete(roundId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Round and all associated data deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
