import Round from "./models/round.model.js";
import Event from "./event.model.js";
import EventRegistration from "./models/event-registration.model.js";
import mongoose from "mongoose";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";
import { resolveSourceTeams } from "./utils/team-resolver.js";
import { clearEventCache, syncRoadmapStatus } from "./event.utils.js";
import { CustomError } from "../../shared/utils/CustomError.js";

/**
 * Service to fetch all rounds for an event with enhanced merge information
 */
export const getRoundsService = async (eventId) => {
  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    throw new CustomError("Valid Event ID is required", 400);
  }

  const event = await Event.findById(eventId).lean();
  if (!event) {
    throw new CustomError("Event not found", 404);
  }

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
    { $sort: { roundNumber: 1 } }
  ]);

  const enhancedRounds = await Promise.all(rounds.map(async (round) => {
    const roadmap = event.roadmaps?.find(r => r.type === "tournament");
    const roundIdx = roadmap?.data?.findIndex(item => item.roundId?.toString() === round._id.toString());
    const displayRoundNumber = roundIdx !== undefined && roundIdx !== -1 ? roundIdx + 1 : null;

    const mergeInfo = { sources: [] };

    const roadmapTypeMap = {
      "tournament": "tournament",
      "invited-tournament": "invitedTeams",
      "t1-special": "t1-special"
    };
    const roadmapType = roadmapTypeMap[round.type] || "tournament";

    if (displayRoundNumber) {
      // ONLY Main Roadmap receives cross-track merges
      if (roadmapType === "tournament") {
        const invitedMappings = event.invitedRoundMappings?.filter(m => m.targetMainRound?.roundNumber === displayRoundNumber) || [];
        const t1Mappings = event.t1SpecialRoundMappings?.filter(m => m.targetMainRound?.roundNumber === displayRoundNumber) || [];

        const currentEligibleSet = new Set(round.eligibleTeams?.map(id => id.toString()) || []);

        const processSources = async (mappings, sourceRoadmapType) => {
          const sourceRoadmap = event.roadmaps.find(r => r.type === sourceRoadmapType);
          if (!sourceRoadmap || !sourceRoadmap.data) return;

          for (const mapping of mappings) {
            let pendingCount = 0;
            let mergedCount = 0;
            let isSourceCompleted = false;
            let sourceRoundName = "Unknown Round";

            const sourceRoundNum = mapping.sourceRound?.roundNumber;
            if (sourceRoundNum !== undefined) {
              const item = sourceRoadmap.data[sourceRoundNum - 1];
              if (item && item.roundId) {
                const roundDocFromSource = await Round.findById(item.roundId).lean();
                if (roundDocFromSource) {
                  isSourceCompleted = roundDocFromSource.status === "completed";
                  sourceRoundName = roundDocFromSource.roundName || `Round-${roundDocFromSource.roundNumber || sourceRoundNum}`;

                  const Group = mongoose.model("Group");
                  const Leaderboard = mongoose.model("Leaderboard");
                  const groupIds = (await Group.find({ roundId: roundDocFromSource._id }).lean()).map(g => g._id);
                  const leaderboards = await Leaderboard.find({ groupId: { $in: groupIds } }).lean();

                  leaderboards.forEach(lb => {
                    lb.teamScore.forEach(entry => {
                      if (entry.isQualified) {
                        if (currentEligibleSet.has(entry.teamId.toString())) {
                          mergedCount++;
                        } else if (roundDocFromSource.status === 'completed') {
                          pendingCount++;
                        }
                      }
                    });
                  });
                }
              }
            }

            mergeInfo.sources.push({
              name: mapping.roadmapName || sourceRoadmap.name || (sourceRoadmapType === 'invitedTeams' ? 'Invited Roadmap' : 'T1 Special Roadmap'),
              sourceRoundName,
              type: sourceRoadmapType === 'invitedTeams' ? 'Invited' : 'T1 Special',
              pendingCount,
              mergedCount,
              isReady: isSourceCompleted,
              hasTeamsToMerge: pendingCount > 0 || !isSourceCompleted
            });
          }
        };

        await processSources(invitedMappings, "invitedTeams");
        await processSources(t1Mappings, "t1-special");
      }
    }

    return {
      ...round,
      mergeInfo: mergeInfo.sources.length > 0 ? mergeInfo : null
    };
  }));

  return enhancedRounds;
};

/**
 * Service to create a new round
 */
export const createRoundService = async (userId, rawData) => {
  const {
    eventId, roundName, startTime, dailyStartTime, dailyEndTime,
    gapMinutes, matchesPerGroup, qualifyingTeams: rawQualifyingTeams,
    type, roadmapIndex, groupSize: rawGroupSize, isLeague,
    leaguePairingType, leagueType
  } = rawData;

  let groupSize = rawGroupSize;
  if (leagueType === "18-teams") {
    groupSize = 18;
  } else if (!groupSize) {
    groupSize = 12;
  }
  const qualifyingTeams = Math.max(0, parseInt(rawQualifyingTeams) || 0);

  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    throw new CustomError("Valid Event ID is required!", 400);
  }

  const result = await withOptionalTransaction(async (session) => {
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      throw new CustomError("Event not found!", 404);
    }

    let totalTeams = 0;
    if (type === "invited-tournament") {
      totalTeams = event.invitedTeams?.length || 0;
    } else if (type === "t1-special") {
      totalTeams = event.t1SpecialTeams?.length || 0;
    } else {
      totalTeams = await EventRegistration.countDocuments({ eventId, status: "approved" }).session(session);
    }

    if (totalTeams === 0) {
      throw new CustomError(`Cannot create a round. No teams available for this ${type || 'tournament'} round!`, 400);
    }

    const existingOngoingRound = await Round.findOne({ eventId, status: "ongoing" }).session(session);
    if (existingOngoingRound) {
      throw new CustomError("An ongoing round already exists!", 400);
    }

    // ⛔ GUARDRAIL: Block round creation if merged source rounds are pending
    if (roadmapIndex !== undefined && (type === "tournament" || !type)) {
      const displayRoundNumber = roadmapIndex + 1;
      const incomingMappings = [
        ...(event.invitedRoundMappings || []).filter(m => m.targetMainRound?.roundNumber === displayRoundNumber).map(m => ({ ...m, track: 'invitedTeams' })),
        ...(event.t1SpecialRoundMappings || []).filter(m => m.targetMainRound?.roundNumber === displayRoundNumber).map(m => ({ ...m, track: 't1-special' }))
      ];

      for (const mapping of incomingMappings) {
        const sourceRoundNum = mapping.sourceRound?.roundNumber;
        const sourceRoadmap = event.roadmaps?.find(r => r.type === mapping.track);
        const sourceItem = sourceRoadmap?.data?.[sourceRoundNum - 1];

        if (sourceItem?.roundId) {
          const sourceRoundDoc = await Round.findById(sourceItem.roundId).session(session);
          if (sourceRoundDoc && sourceRoundDoc.status !== "completed") {
            throw new CustomError(`Cannot create this round. Please complete ${mapping.track === 'invitedTeams' ? 'Invited' : 'T1 Special'} ${sourceRoundDoc.roundName} first.`, 400);
          }
        }
      }
    }

    event.roundCount = (event.roundCount || 0) + 1;
    await event.save({ session });
    const roundNumber = event.roundCount;

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
      groupSize,
      isLeague: isLeague || false,
      leaguePairingType: leaguePairingType || "standard",
      leagueType,
      type: type || "tournament"
    }], { session });

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

  // Clear cache after successful creation
  const finalEvent = await Event.findById(eventId);
  if (finalEvent) {
    await clearEventCache(finalEvent.orgId, eventId);
  }

  return result;
};

/**
 * Service to fetch single round details
 */
export const getRoundDetailsService = async (roundId) => {
  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    throw new CustomError("Valid Round ID is required!", 400);
  }

  const round = await Round.findById(roundId).populate(
    "eventId",
    "eventName slots teams"
  );

  if (!round) {
    throw new CustomError("Round not found!", 404);
  }

  return round;
};

/**
 * Service to update round configuration and sync groups
 */
export const updateRoundService = async (roundId, rawData) => {
  const {
    eventId, roundName, startTime, dailyStartTime, dailyEndTime,
    gapMinutes, matchesPerGroup, qualifyingTeams,
    groupSize: rawGroupSize, isLeague, leaguePairingType,
    leagueType, status
  } = rawData;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    throw new CustomError("Valid Round ID required", 400);
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
  if (rawGroupSize !== undefined) {
    updateData.groupSize = leagueType === "18-teams" ? 18 : rawGroupSize;
  }
  if (isLeague !== undefined) updateData.isLeague = isLeague;
  if (leaguePairingType !== undefined) updateData.leaguePairingType = leaguePairingType;
  if (leagueType !== undefined) {
    updateData.leagueType = leagueType;
    if (leagueType === "18-teams") updateData.groupSize = 18;
  }
  if (status) updateData.status = status;

  const result = await withOptionalTransaction(async (session) => {
    const round = await Round.findByIdAndUpdate(
      roundId,
      updateData,
      { new: true, runValidators: true, session }
    );

    if (!round) {
      throw new CustomError("Round not found", 404);
    }

    // Sync leaderboards and groups
    if (qualifyingTeams !== undefined || matchesPerGroup !== undefined) {
      const Group = mongoose.model("Group");
      const Leaderboard = mongoose.model("Leaderboard");
      const qLimit = qualifyingTeams !== undefined ? Number(qualifyingTeams) : round.qualifyingTeams;
      const mLimit = matchesPerGroup !== undefined ? Number(matchesPerGroup) : round.matchesPerGroup;

      const groups = await Group.find({ roundId }).session(session);
      for (const group of groups) {
        let modified = false;
        if (qualifyingTeams !== undefined) {
          group.totalSelectedTeam = qLimit;
          modified = true;
        }
        if (matchesPerGroup !== undefined) {
          group.totalMatch = group.isLeague ? mLimit * 3 : mLimit;
          modified = true;
        }

        if (modified) {
          if (group.matchesPlayed >= group.totalMatch && group.totalMatch > 0) {
            group.status = "completed";
          } else if (group.matchesPlayed > 0) {
            group.status = "ongoing";
          } else if (group.matchesPlayed === 0) {
            group.status = "pending";
          }
          await group.save({ session });
        }

        if (qualifyingTeams !== undefined) {
          const leaderboard = await Leaderboard.findOne({ groupId: group._id }).session(session);
          if (leaderboard && leaderboard.teamScore?.length > 0) {
            leaderboard.teamScore.forEach((entry) => {
              entry.totalPoints = (entry.score || 0) + (entry.kills || 0);
            });
            leaderboard.teamScore.sort((a, b) => b.totalPoints - a.totalPoints);
            leaderboard.teamScore.forEach((entry, index) => {
              entry.isQualified = qLimit > 0 && index < qLimit;
            });
            leaderboard.markModified('teamScore');
            await leaderboard.save({ session });
          }
        }
      }
    }

    const targetEventId = eventId || round.eventId;
    if (targetEventId && status && mongoose.Types.ObjectId.isValid(targetEventId)) {
      await syncRoadmapStatus(targetEventId, roundId, status, session);
    }

    return round;
  });

  const finalEvent = await Event.findById(eventId || result.eventId);
  if (finalEvent) {
    await clearEventCache(finalEvent.orgId, finalEvent._id);
  }

  return result;
};

/**
 * Service to reset a round
 */
export const resetRoundService = async (roundId, eventId) => {
  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    throw new CustomError("Valid Round ID required", 400);
  }

  await withOptionalTransaction(async (session) => {
    const round = await Round.findByIdAndUpdate(
      roundId,
      { status: "pending" },
      { new: true, session }
    );
    if (!round) {
      throw new CustomError("Round not found", 404);
    }

    const Group = mongoose.model("Group");
    const Leaderboard = mongoose.model("Leaderboard");
    const groups = await Group.find({ roundId }).session(session);
    const groupIds = groups.map(g => g._id);

    if (groupIds.length > 0) {
      await Leaderboard.deleteMany({ groupId: { $in: groupIds } }).session(session);
    }
    await Group.deleteMany({ roundId }).session(session);

    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      await syncRoadmapStatus(eventId, roundId, "pending", session);
    }
  });

  const finalEvent = await Event.findById(eventId);
  if (finalEvent) {
    await clearEventCache(finalEvent.orgId, eventId);
  }

  return true;
};

/**
 * Service to delete a round
 */
export const deleteRoundService = async (roundId) => {
  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    throw new CustomError("Valid Round ID required", 400);
  }

  let eventIdToClear = null;
  let orgIdToClear = null;

  await withOptionalTransaction(async (session) => {
    const round = await Round.findById(roundId).session(session);
    if (!round) {
      throw new CustomError("Round not found", 404);
    }

    eventIdToClear = round.eventId;
    const event = await Event.findById(eventIdToClear).session(session);
    if (event) {
      orgIdToClear = event.orgId;

      // Cleanup roadmaps on round deletion
      if (event.roadmaps) {
        let modified = false;
        event.roadmaps.forEach(roadmap => {
          if (Array.isArray(roadmap.data)) {
            roadmap.data.forEach(item => {
              if (item.roundId?.toString() === roundId.toString()) {
                item.roundId = null;
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

    const Group = mongoose.model("Group");
    const Leaderboard = mongoose.model("Leaderboard");
    const groups = await Group.find({ roundId }).session(session);
    const groupIds = groups.map(g => g._id);

    if (groupIds.length > 0) {
      await Leaderboard.deleteMany({ groupId: { $in: groupIds } }).session(session);
    }
    await Group.deleteMany({ roundId }).session(session);
    await Round.findByIdAndDelete(roundId).session(session);
  });

  if (eventIdToClear && orgIdToClear) {
    await clearEventCache(orgIdToClear, eventIdToClear);
  }

  return true;
};

/**
 * Service to merge qualified teams into a round
 */
export const mergeQualifiedTeamsService = async (roundId, eventId) => {
  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    throw new CustomError("Valid Round ID required", 400);
  }

  const result = await withOptionalTransaction(async (session) => {
    const round = await Round.findById(roundId).session(session);
    if (!round) throw new CustomError("Round not found", 404);

    const allResolvedTeams = await resolveSourceTeams({ roundId, eventId, session });
    const qualifiedTeamIds = new Set(allResolvedTeams.map(id => id.toString()));

    round.eligibleTeams = Array.from(qualifiedTeamIds);
    round.markModified('eligibleTeams');
    await round.save({ session });

    return round;
  });

  const event = await Event.findById(eventId);
  if (event) {
    await clearEventCache(event.orgId, eventId);
  }

  return result;
};
