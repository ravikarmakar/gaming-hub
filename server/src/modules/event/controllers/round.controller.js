import Round from "../models/round.model.js";
import mongoose from "mongoose";
import { logger } from "../../../shared/utils/logger.js";
import { TryCatchHandler } from "../../../shared/middleware/error.middleware.js";
import * as roundService from "../round.service.js";


export const getRounds = TryCatchHandler(async (req, res) => {
  const { eventId } = req.query;
  const enhancedRounds = await roundService.getRoundsService(eventId);

  res.status(200).json({
    success: true,
    data: enhancedRounds,
  });
});

export const createRound = TryCatchHandler(async (req, res) => {
  const { eventId } = req.body;
  const newRound = await roundService.createRoundService(req.user._id, req.body);

  // Push notifications (best effort, outside transaction)
  try {
    const EventRegistration = mongoose.model("EventRegistration");
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
            message: `${newRound.roundName} has been created. ${req.body.startTime ? `Scheduled to start on ${new Date(req.body.startTime).toISOString()}.` : 'Schedule is pending.'}`
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
  const round = await roundService.getRoundDetailsService(roundId);

  return res.status(200).json({
    message: "Round details fetched successfully!",
    round,
  });
});

export const updateRound = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;
  const updatedRound = await roundService.updateRoundService(roundId, req.body);

  return res.status(200).json({
    message: "Round updated successfully",
    round: updatedRound,
  });
});

export const resetRound = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;
  const { eventId } = req.body;

  await roundService.resetRoundService(roundId, eventId);

  return res.status(200).json({
    success: true,
    message: "Round matches and scores reset successfully",
  });
});

export const deleteRound = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;
  await roundService.deleteRoundService(roundId);

  return res.status(200).json({
    success: true,
    message: "Round and associated groups/leaderboards deleted successfully",
  });
});

export const mergeQualifiedTeams = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;
  const { eventId } = req.body;

  const round = await roundService.mergeQualifiedTeamsService(roundId, eventId);

  return res.status(200).json({
    success: true,
    message: "Qualified teams merged successfully!",
    round,
  });
});
