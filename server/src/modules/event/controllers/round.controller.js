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

  // Fetch the event to check for mappings
  const event = await Event.findById(eventId).lean();
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
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

  // Enhance rounds with mergeInfo
  const enhancedRounds = await Promise.all(rounds.map(async (round) => {
    const roadmap = event.roadmaps?.find(r => r.type === "tournament");
    const roundIdx = roadmap?.data?.findIndex(item => item.roundId?.toString() === round._id.toString());
    const displayRoundNumber = roundIdx !== undefined && roundIdx !== -1 ? roundIdx + 1 : null;

    const mergeInfo = {
      sources: []
    };

    if (displayRoundNumber) {
      const invitedMappings = event.invitedRoundMappings?.filter(m => m.targetMainRound === displayRoundNumber) || [];
      const t1Mappings = event.t1SpecialRoundMappings?.filter(m => m.targetMainRound === displayRoundNumber) || [];

      const currentEligibleSet = new Set(round.eligibleTeams?.map(id => id.toString()) || []);

      const processSources = async (mappings, roadmapType) => {
        const sourceRoadmap = event.roadmaps.find(r => r.type === roadmapType);
        if (!sourceRoadmap || !sourceRoadmap.data) return;

        for (const mapping of mappings) {
          let pendingCount = 0;
          let mergedCount = 0;
          let allSourcesCompleted = true;
          const sourceRoundNames = [];

          // Track readiness across ALL rounds in the mapping range
          for (let i = Math.max(0, mapping.startRound - 1); i <= mapping.endRound - 1; i++) {
            const item = sourceRoadmap.data[i];
            if (!item || !item.roundId) continue;

            const roundDoc = await Round.findById(item.roundId).lean();
            if (!roundDoc) { allSourcesCompleted = false; continue; }
            if (roundDoc.status !== "completed") allSourcesCompleted = false;
            sourceRoundNames.push(roundDoc.roundName || `Round-${roundDoc.roundNumber || '?'}`);
          }

          // Only count qualified teams from the FINAL round in the mapping.
          // Teams flow through rounds: Round1 → Round2 → FinalRound.
          // Counting all rounds would triple-count the same teams.
          const finalItemIndex = mapping.endRound - 1;
          const finalItem = sourceRoadmap.data[finalItemIndex];
          if (finalItem && finalItem.roundId) {
            const finalRound = await Round.findById(finalItem.roundId).lean();
            if (finalRound) {
              const Group = mongoose.model("Group");
              const Leaderboard = mongoose.model("Leaderboard");
              const groupIds = (await Group.find({ roundId: finalRound._id }).lean()).map(g => g._id);
              const leaderboards = await Leaderboard.find({ groupId: { $in: groupIds } }).lean();

              leaderboards.forEach(lb => {
                lb.teamScore.forEach(entry => {
                  if (entry.isQualified) {
                    if (currentEligibleSet.has(entry.teamId.toString())) {
                      mergedCount++;
                    } else if (finalRound.status === 'completed') {
                      pendingCount++;
                    }
                  }
                });
              });
            }
          }

          let sourceRoundName = "Unknown Round";
          if (sourceRoundNames.length === 1) {
            sourceRoundName = sourceRoundNames[0];
          } else if (sourceRoundNames.length > 1) {
            sourceRoundName = `${sourceRoundNames[0]} - ${sourceRoundNames[sourceRoundNames.length - 1]}`;
          }

          mergeInfo.sources.push({
            name: mapping.roadmapName || sourceRoadmap.name || (roadmapType === 'invitedTeams' ? 'Invited Roadmap' : 'T1 Special Roadmap'),
            sourceRoundName,
            type: roadmapType === 'invitedTeams' ? 'Invited' : 'T1 Special',
            pendingCount,
            mergedCount,
            isReady: allSourcesCompleted,
            hasTeamsToMerge: pendingCount > 0
          });
        }
      };

      await processSources(invitedMappings, "invitedTeams");
      await processSources(t1Mappings, "t1-special");
    }

    return {
      ...round,
      mergeInfo: mergeInfo.sources.length > 0 ? mergeInfo : null
    };
  }));

  res.status(200).json({
    success: true,
    data: enhancedRounds,
  });
});

export const createRound = TryCatchHandler(async (req, res) => {
  const { eventId, roundName, startTime, dailyStartTime, dailyEndTime, gapMinutes, matchesPerGroup, qualifyingTeams: rawQualifyingTeams, type, roadmapIndex, groupSize, isLeague, leaguePairingType } = req.body;
  const qualifyingTeams = Math.max(0, parseInt(rawQualifyingTeams) || 0);

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

    let totalTeams = 0;
    if (type === "invited-tournament") {
      totalTeams = event.invitedTeams?.length || 0;
    } else if (type === "t1-special") {
      totalTeams = event.t1SpecialTeams?.length || 0;
    } else {
      const totalTeamsQuery = EventRegistration.countDocuments({ eventId, status: "approved" });
      if (session) totalTeamsQuery.session(session);
      totalTeams = await totalTeamsQuery;
    }

    if (totalTeams === 0) {
      const error = new Error(`Cannot create a round. No teams available for this ${type || 'tournament'} round!`);
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
      groupSize: groupSize || 12,
      isLeague: isLeague || false,
      leaguePairingType: leaguePairingType || "standard",
      type: type || "tournament"
    }], { session });

    // Update Roadmap if roadmapIndex is provided
    if (roadmapIndex !== undefined) {
      const roadmapType = type === "invited-tournament" ? "invitedTeams" : type === "t1-special" ? "t1-special" : "tournament";
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
  const { 
    eventId, 
    roundName, 
    startTime, 
    dailyStartTime, 
    dailyEndTime, 
    gapMinutes, 
    matchesPerGroup, 
    qualifyingTeams, 
    groupSize,
    isLeague,
    leaguePairingType,
    status 
  } = req.body;

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
  if (qualifyingTeams !== undefined) {
    const qTeams = parseInt(qualifyingTeams);
    updateData.qualifyingTeams = isNaN(qTeams) ? 0 : Math.max(0, qTeams);
  }
  if (groupSize !== undefined) updateData.groupSize = groupSize;
  if (isLeague !== undefined) updateData.isLeague = isLeague;
  if (leaguePairingType !== undefined) updateData.leaguePairingType = leaguePairingType;
  if (status) updateData.status = status;

  const round = await Round.findByIdAndUpdate(
    roundId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!round) return res.status(404).json({ message: "Round not found" });

  // Sync leaderboards and groups if qualifyingTeams changed
  if (qualifyingTeams !== undefined) {
    try {
      const Group = mongoose.model("Group");
      const Leaderboard = mongoose.model("Leaderboard");
      const qLimit = Number(qualifyingTeams);
      
      const groups = await Group.find({ roundId });
      for (const group of groups) {
        // Update group-level count
        group.totalSelectedTeam = qLimit;
        await group.save();

        const leaderboard = await Leaderboard.findOne({ groupId: group._id });
        if (leaderboard && leaderboard.teamScore && leaderboard.teamScore.length > 0) {
          // Re-calculate isQualified for all teams based on new limit
          leaderboard.teamScore.forEach((entry) => {
            entry.totalPoints = (entry.score || 0) + (entry.kills || 0);
          });

          // Sort by points to identify new qualifiers
          leaderboard.teamScore.sort((a, b) => b.totalPoints - a.totalPoints);
          
          leaderboard.teamScore.forEach((entry, index) => {
            entry.isQualified = qLimit > 0 && index < qLimit;
          });
          
          leaderboard.markModified('teamScore');
          await leaderboard.save();
        }
      }
      logger.info(`Synchronized isQualified flags and totalSelectedTeam for ${groups.length} groups in round ${roundId} due to qualifier count change to ${qLimit}`);
    } catch (syncError) {
      logger.error("Error synchronizing leaderboards after qualifyingTeams update:", syncError);
    }
  }

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

export const mergeQualifiedTeams = TryCatchHandler(async (req, res) => {
  const { roundId } = req.params;
  const { eventId } = req.body;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    return res.status(400).json({ message: "Valid Round ID required" });
  }

  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Valid Event ID required" });
  }

  const result = await withOptionalTransaction(async (session) => {
    const round = await Round.findById(roundId).session(session);
    if (!round) {
      const error = new Error("Round not found");
      error.status = 404;
      throw error;
    }

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      const error = new Error("Event not found");
      error.status = 404;
      throw error;
    }

    // 1. Find this round's index in the main roadmap
    const mainRoadmap = event.roadmaps?.find(r => r.type === "tournament");
    if (!mainRoadmap) {
      const error = new Error("Main roadmap not found for this event");
      error.status = 404;
      throw error;
    }

    const roundIndex = mainRoadmap.data?.findIndex(item => 
      item.roundId && item.roundId.toString() === roundId
    );

    if (roundIndex === undefined || roundIndex === -1) {
      const error = new Error("Round not found in main roadmap");
      error.status = 400;
      throw error;
    }
    const displayRoundNumber = roundIndex + 1;

    // 2. Identify mappings for this targetMainRound
    const invitedMappings = event.invitedRoundMappings?.filter(m => m.targetMainRound === displayRoundNumber) || [];
    const t1Mappings = event.t1SpecialRoundMappings?.filter(m => m.targetMainRound === displayRoundNumber) || [];

    const qualifiedTeamIds = new Set(round.eligibleTeams?.map(id => id.toString()) || []);

    // 🔧 FIX: Seed the set with qualified teams from the PREVIOUS MAIN round.
    // Without this, only invited/T1 teams are added and the main finalists are lost.
    if (roundIndex > 0) {
      const prevMainItem = mainRoadmap.data[roundIndex - 1];
      if (prevMainItem?.roundId) {
        const prevMainRound = await Round.findById(prevMainItem.roundId).session(session);
        if (prevMainRound && prevMainRound.status === "completed") {
          const Group = mongoose.model("Group");
          const Leaderboard = mongoose.model("Leaderboard");
          const prevGroups = await Group.find({ roundId: prevMainRound._id }).session(session);
          const prevGroupIds = prevGroups.map(g => g._id);
          const prevLeaderboards = await Leaderboard.find({ groupId: { $in: prevGroupIds } }).session(session);
          prevLeaderboards.forEach(lb => {
            lb.teamScore.forEach(entry => {
              if (entry.isQualified) qualifiedTeamIds.add(entry.teamId.toString());
            });
          });
          logger.info(`[mergeQualifiedTeams] Seeded ${qualifiedTeamIds.size} main-roadmap qualified teams from ${prevMainRound.roundName}`);
        }
      }
    }

    const processMappings = async (mappings, roadmapType) => {
      const roadmap = event.roadmaps.find(r => r.type === roadmapType);
      if (!roadmap || !roadmap.data) return;

      for (const mapping of mappings) {
        // Only pull qualified teams from the FINAL round in the mapping.
        // Teams flow through rounds sequentially; the final round has the ultimate surviving qualifiers.
        const finalIndex = mapping.endRound - 1;
        const roadmapItem = roadmap.data[finalIndex];
        if (!roadmapItem || !roadmapItem.roundId) continue;

        // Only pull from COMPLETED rounds
        const finalRound = await Round.findById(roadmapItem.roundId).session(session);
        if (!finalRound || finalRound.status !== "completed") continue;

        const Group = mongoose.model("Group");
        const Leaderboard = mongoose.model("Leaderboard");
        const groups = await Group.find({ roundId: finalRound._id }).session(session);
        const groupIds = groups.map(g => g._id);
        const leaderboards = await Leaderboard.find({ groupId: { $in: groupIds } }).session(session);

        leaderboards.forEach(lb => {
          lb.teamScore.forEach(entry => {
            if (entry.isQualified) {
              qualifiedTeamIds.add(entry.teamId.toString());
            }
          });
        });
      }
    };

    await processMappings(invitedMappings, "invitedTeams");
    await processMappings(t1Mappings, "t1-special");

    // 3. Update the round with merged teams
    round.eligibleTeams = Array.from(qualifiedTeamIds);
    await round.save({ session });

    return round;
  });

  return res.status(200).json({
    success: true,
    message: "Teams merged successfully from mapped roadmap rounds!",
    eligibleTeams: result.eligibleTeams
  });
});
