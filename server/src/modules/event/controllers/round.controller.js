import Round from "../models/round.model.js";
import Event from "../event.model.js";
import EventRegistration from "../models/event-registration.model.js";
import mongoose from "mongoose";
import { logger } from "../../../shared/utils/logger.js";

export const getRounds = async (req, res) => {
  try {
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
  } catch (error) {
    logger.error("Error fetching rounds:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const createRound = async (req, res) => {
  try {
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

    // Total rounds count (Auto-generate round name if not provided)
    // We'll use a retry mechanism to handle race conditions on creation
    let newRound;
    let retries = 3;
    while (retries > 0) {
      try {
        const roundCount = await Round.countDocuments({ eventId });

        newRound = await Round.create({
          eventId,
          roundName: roundName || `Round-${roundCount + 1}`,
          status: "pending",
          roundNumber: roundCount + 1,
          startTime,
          dailyStartTime,
          dailyEndTime,
          gapMinutes,
          matchesPerGroup,
          qualifyingTeams
        });

        // If successful, break the loop
        break;
      } catch (createError) {
        if (createError.code === 11000 && retries > 1) {
          // Duplicate key error (likely roundNumber or roundName collision)
          // Wait a random short time before retrying to reduce collision probability
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          retries--;
          continue;
        } else if (createError.code === 11000) {
          return res.status(400).json({
            message: "A round with this name or number already exists for this event. Please try again."
          });
        }
        throw createError;
      }
    }

    // Note: We do not push to event.rounds because Event schema does not have a rounds array
    // The relationship is handled by Round.eventId

    // ✅ PUSH NOTIFICATIONS TO ALL REGISTERED TEAMS
    try {
      // Find all approved registrations for this event to get the teamIds
      const registrations = await EventRegistration.find({ eventId, status: "approved" }).populate("teamId");

      for (const reg of registrations) {
        if (!reg.teamId) continue;

        // Notify all active members of each team
        const team = reg.teamId;
        const recipientIds = team.teamMembers
          .filter(m => m.isActive)
          .map(m => m.user);

        for (const userId of recipientIds) {
          await mongoose.model("Notification").create({
            recipient: userId,
            sender: req.user._id, // The organizer who created the round
            type: "ROUND_CREATED",
            content: {
              title: "New Round Created!",
              message: `${event.eventName}: ${newRound.roundName} has been created. ${startTime ? `Scheduled to start on ${new Date(startTime).toLocaleString()}.` : 'Schedule is pending.'}`
            },
            relatedData: {
              eventId,
              teamId: team._id
            }
          });
        }
      }
    } catch (notifError) {
      logger.error("Error sending round creation notifications:", notifError);
    }

    return res.status(201).json({
      message: "New round created successfully!",
      rounds: newRound,
    });
  } catch (error) {
    logger.error("Error in createRound:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRoundDetails = async (req, res) => {
  try {
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
    // .populate({
    //   path: "groups",
    //   populate: {
    //     path: "teams",
    //     select: "teamName players",
    //   },
    // });

    // ✅ 3. Check if Round Exists
    if (!round) {
      return res.status(404).json({ message: "Round not found!" });
    }

    return res.status(200).json({
      message: "Round details fetched successfully!",
      round,
    });
  } catch (error) {
    logger.error("Error in getRoundDetails:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateRound = async (req, res) => {
  try {
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
  } catch (error) {
    logger.error("Error updating round:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteRound = async (req, res) => {
  try {
    const { roundId } = req.params;

    if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({ message: "Valid Round ID required" });
    }

    const round = await Round.findById(roundId);
    if (!round) return res.status(404).json({ message: "Round not found" });

    // 1. Find all groups for this round
    const groups = await mongoose.model("Group").find({ roundId });
    const groupIds = groups.map(g => g._id);

    // 2. Delete Leaderboards for these groups
    if (groupIds.length > 0) {
      await mongoose.model("Leaderboard").deleteMany({ groupId: { $in: groupIds } });
    }

    // 3. Delete Groups
    await mongoose.model("Group").deleteMany({ roundId });

    // 4. Delete Round
    await Round.findByIdAndDelete(roundId);

    res.status(200).json({
      success: true,
      message: "Round and all associated data deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting round:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
