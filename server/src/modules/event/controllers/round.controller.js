import Round from "../models/round.model.js";
import Event from "../event.model.js";
import EventRegistration from "../models/event-registration.model.js";
import mongoose from "mongoose";
import { logger } from "../../../shared/utils/logger.js";
import { TryCatchHandler } from "../../../shared/middleware/error.middleware.js";
import { withOptionalTransaction } from "../../../shared/utils/withOptionalTransaction.js";

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
  const { eventId, roundName, startTime, dailyStartTime, dailyEndTime, gapMinutes, matchesPerGroup, qualifyingTeams, type, roadmapIndex } = req.body;

  // Event ID check
  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Valid Event ID is required!" });
  }

  const newRound = await withOptionalTransaction(async (session) => {
    // Check if Event exists
    const eventQuery = Event.findById(eventId);
    if (session) eventQuery.session(session);
    const event = await eventQuery;
    if (!event) {
      const error = new Error("Event not found!");
      error.status = 404;
      throw error;
    }

    const totalTeamsQuery = EventRegistration.countDocuments({ eventId, status: "approved" });
    if (session) totalTeamsQuery.session(session);
    const totalTeams = await totalTeamsQuery;
    if (totalTeams === 0) {
      const error = new Error("Cannot create a round. No teams have approved registrations in this event!");
      error.status = 400;
      throw error;
    }

    const ongoingQuery = Round.findOne({ eventId, status: "ongoing" });
    if (session) ongoingQuery.session(session);
    const existingOngoingRound = await ongoingQuery;
    if (existingOngoingRound) {
      const error = new Error("An ongoing round already exists!");
      error.status = 400;
      throw error;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { roundCount: 1 } },
      { new: true, runValidators: true, session }
    );

    const roundNumber = updatedEvent.roundCount;

    const [newRound] = await Round.create([{
      eventId,
      roundName: roundName || `Round-${roundNumber}`,
      status: "pending",
      roundNumber,
      startTime,
      dailyStartTime,
      dailyEndTime,
      gapMinutes,
      matchesPerGroup,
      qualifyingTeams,
      type: type || "tournament"
    }], { session });

    // Update Roadmap if roadmapIndex is provided
    if (roadmapIndex !== undefined) {
      const roadmapType = type === "invited-tournament" ? "invitedTeams" : "tournament";
      const roadmap = event.roadmaps.find(r => r.type === roadmapType);
      if (roadmap && roadmap.data && roadmapIndex >= 0 && roadmapIndex < roadmap.data.length) {
        roadmap.data[roadmapIndex].status = "ongoing";
        roadmap.data[roadmapIndex].roundId = newRound._id;
        event.markModified('roadmaps');
        await event.save({ session });
      }
    }

    return newRound;
  });

  // If the response was already sent (early returns above), don't continue
  if (res.headersSent) return;

  // Push notifications (best effort, outside transaction)
  try {
    const registrations = await EventRegistration.find({ eventId, status: "approved" }).populate("teamId");
    const notificationsToCreate = [];
    const Notification = mongoose.model("Notification");

    for (const reg of registrations) {
      if (!reg.teamId) continue;
      const team = reg.teamId;
      if (!team.teamMembers || !Array.isArray(team.teamMembers)) {
        logger.warn(`Team ${team._id} has invalid teamMembers structure during round creation notification.`);
        continue;
      }

      const recipientIds = team.teamMembers.filter(m => m.isActive).map(m => m.user);
      for (const userId of recipientIds) {
        notificationsToCreate.push({
          recipient: userId,
          sender: req.user._id,
          type: "ROUND_CREATED",
          content: {
            title: "New Round Created!",
            message: `${newRound.roundName} has been created. ${startTime ? `Scheduled to start on ${new Date(startTime).toISOString()}.` : 'Schedule is pending.'}`
          },
          relatedData: { eventId, teamId: team._id }
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
  const { eventId, roundName, startTime, dailyStartTime, dailyEndTime, gapMinutes, matchesPerGroup, qualifyingTeams, status } = req.body;

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
    { new: true, runValidators: true }
  );

  if (!round) return res.status(404).json({ message: "Round not found" });

  // Update roadmap status if eventId is provided
  if (eventId && status && mongoose.Types.ObjectId.isValid(eventId)) {
    const event = await Event.findById(eventId);
    if (event && event.roadmaps) {
      let modified = false;
      event.roadmaps.forEach(roadmap => {
        if (Array.isArray(roadmap.data)) {
          roadmap.data.forEach(item => {
            if (item.roundId && item.roundId.toString() === roundId) {
              item.status = status;
              modified = true;
            }
          });
        }
      });
      if (modified) {
        event.markModified('roadmaps');
        await event.save();
      }
    }
  }

  res.status(200).json({
    success: true,
    message: "Round updated successfully",
    round // Return specific round or handle in store
  });
});

export const resetRound = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;
  const { eventId } = req.body;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    return res.status(400).json({ message: "Valid Round ID required" });
  }

  await withOptionalTransaction(async (session) => {
    // 1. Reset Round Status
    const roundQuery = Round.findByIdAndUpdate(
      roundId, 
      { status: "pending" }, 
      { new: true, session }
    );
    const round = await roundQuery;
    if (!round) {
      const error = new Error("Round not found");
      error.status = 404;
      throw error;
    }

    // 2. Find all groups for this round
    const groupsQuery = mongoose.model("Group").find({ roundId });
    if (session) groupsQuery.session(session);
    const groups = await groupsQuery;
    const groupIds = groups.map(g => g._id);

    // 3. Delete Leaderboards for these groups
    if (groupIds.length > 0) {
      const delLbQuery = mongoose.model("Leaderboard").deleteMany({ groupId: { $in: groupIds } });
      if (session) delLbQuery.session(session);
      await delLbQuery;
    }

    // 4. Delete Groups
    const delGroupsQuery = mongoose.model("Group").deleteMany({ roundId });
    if (session) delGroupsQuery.session(session);
    await delGroupsQuery;

    // 5. Update Roadmap in Event
    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      const eventQuery = Event.findById(eventId);
      if (session) eventQuery.session(session);
      const event = await eventQuery;
      if (event && event.roadmaps) {
        let modified = false;
        event.roadmaps.forEach(roadmap => {
          if (Array.isArray(roadmap.data)) {
            roadmap.data.forEach(item => {
              if (item.roundId && item.roundId.toString() === roundId) {
                item.status = "pending";
                modified = true;
              }
            });
          }
        });
        if (modified) {
          event.markModified('roadmaps');
          await event.save({ session });
        }
      }
    }
  });

  if (res.headersSent) return;

  res.status(200).json({
    success: true,
    message: "Round reset successfully. Groups and leaderboards cleared.",
  });
});

export const deleteRound = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    return res.status(400).json({ message: "Valid Round ID required" });
  }

  await withOptionalTransaction(async (session) => {
    const roundQuery = Round.findById(roundId);
    if (session) roundQuery.session(session);
    const round = await roundQuery;
    if (!round) {
      const error = new Error("Round not found");
      error.status = 404;
      throw error;
    }

    // 1. Find all groups for this round
    const groupsQuery = mongoose.model("Group").find({ roundId });
    if (session) groupsQuery.session(session);
    const groups = await groupsQuery;
    const groupIds = groups.map(g => g._id);

    // 2. Delete Leaderboards for these groups
    if (groupIds.length > 0) {
      const delLbQuery = mongoose.model("Leaderboard").deleteMany({ groupId: { $in: groupIds } });
      if (session) delLbQuery.session(session);
      await delLbQuery;
    }

    // 3. Delete Groups
    const delGroupsQuery = mongoose.model("Group").deleteMany({ roundId });
    if (session) delGroupsQuery.session(session);
    await delGroupsQuery;

    // 4. Delete Round
    const delRoundQuery = Round.findByIdAndDelete(roundId);
    if (session) delRoundQuery.session(session);
    await delRoundQuery;
  });

  if (res.headersSent) return;

  res.status(200).json({
    success: true,
    message: "Round and all associated data deleted successfully",
  });
});
