import mongoose from "mongoose";
import { logger } from "../../../shared/utils/logger.js";

/**
 * 🛠️ UNIFIED TEAM RESOLVER
 * Consolidates team discovery from previous rounds and cross-track mappings.
 * Works for Round Creation, Group Creation, and manual Merging.
 */
export const resolveSourceTeams = async ({ roundId, eventId, session = null }) => {
  const Round = mongoose.model("Round");
  const Event = mongoose.model("Event");
  const Group = mongoose.model("Group");
  const Leaderboard = mongoose.model("Leaderboard");
  const EventRegistration = mongoose.model("EventRegistration");

  const round = await Round.findById(roundId).session(session);
  if (!round) throw new Error("Round not found");

  const event = await Event.findById(eventId).session(session);
  if (!event) throw new Error("Event not found");

  const teamIds = new Set();

  // 1. Identify roadmap position
  const roadmapTypeMap = {
    "tournament": "tournament",
    "invited-tournament": "invitedTeams",
    "t1-special": "t1-special"
  };
  const roadmapType = roadmapTypeMap[round.type] || "tournament";
  const roadmap = event.roadmaps?.find(r => r.type === roadmapType);
  
  let currentRoundIndex = -1;
  if (roadmap && Array.isArray(roadmap.data)) {
    currentRoundIndex = roadmap.data.findIndex(entry => 
      entry.roundId && entry.roundId.toString() === roundId.toString()
    );
  }

  // 2. Resolve Progressive/Sequence Teams (Previous round in same track)
  if (currentRoundIndex > 0) {
    const prevRoundId = roadmap.data[currentRoundIndex - 1].roundId;
    if (prevRoundId) {
      const prevRound = await Round.findById(prevRoundId).session(session);
      if (prevRound && prevRound.status === "completed") {
        const prevGroups = await Group.find({ roundId: prevRound._id }).session(session);
        const groupIds = prevGroups.map(g => g._id);
        const leaderboards = await Leaderboard.find({ groupId: { $in: groupIds } }).session(session);
        leaderboards.forEach(lb => {
          lb.teamScore.forEach(entry => {
            if (entry.isQualified) teamIds.add(entry.teamId.toString());
          });
        });
        logger.info(`[resolveSourceTeams] Pulled ${teamIds.size} teams from previous round ${prevRound.roundName}`);
      }
    }
  } else if (currentRoundIndex === 0 || currentRoundIndex === -1) {
    // Start of track logic (or unlinked round)
    if (round.type === "t1-special") {
      (event.t1SpecialTeams || []).forEach(id => teamIds.add(id.toString()));
    } else if (round.type === "invited-tournament") {
      (event.invitedTeams || []).forEach(id => teamIds.add(id.toString()));
    } else {
      const registrations = await EventRegistration.find({ eventId, status: "approved" }).session(session);
      registrations.forEach(reg => teamIds.add(reg.teamId.toString()));
    }
  }

  // 3. Handle Cross-Track Mappings (Invited -> Main, T1 -> Main)
  if (roadmapType === "tournament") {
    const displayRoundNumber = currentRoundIndex + 1;
    const incomingMappings = [
      ...(event.invitedRoundMappings || [])
        .filter(m => m.targetMainRound?.roundNumber === displayRoundNumber)
        .map(m => {
          const raw = m.toObject ? m.toObject() : m;
          return { ...raw, track: 'invitedTeams' };
        }),
      ...(event.t1SpecialRoundMappings || [])
        .filter(m => m.targetMainRound?.roundNumber === displayRoundNumber)
        .map(m => {
          const raw = m.toObject ? m.toObject() : m;
          return { ...raw, track: 't1-special' };
        })
    ];

    logger.info(`[resolveSourceTeams] Found ${incomingMappings.length} cross-track mappings for Round ${displayRoundNumber}`);

    for (const mapping of incomingMappings) {
      const sourceRoundNum = mapping.sourceRound?.roundNumber;
      if (sourceRoundNum === undefined) {
        logger.warn(`[resolveSourceTeams] Mapping missing sourceRoundNum:`, mapping);
        continue;
      }

      const sourceRoadmap = event.roadmaps?.find(r => r.type === mapping.track);
      const sourceItem = sourceRoadmap?.data?.[sourceRoundNum - 1];
      if (sourceItem?.roundId) {
        const sourceRoundDoc = await Round.findById(sourceItem.roundId).session(session);
        if (!sourceRoundDoc) {
          logger.warn(`[resolveSourceTeams] Source round document not found for ID: ${sourceItem.roundId}`);
          continue;
        }

        if (sourceRoundDoc.status !== "completed") {
          throw new Error(`Cannot proceed. Waiting for ${mapping.track === 'invitedTeams' ? 'Invited' : 'T1 Special'} ${sourceRoundDoc.roundName} to be completed.`);
        }

        const prevGroups = await Group.find({ roundId: sourceRoundDoc._id }).session(session);
        const groupIds = prevGroups.map(g => g._id);
        const leaderboards = await Leaderboard.find({ groupId: { $in: groupIds } }).session(session);
        
        let crossTrackCount = 0;
        leaderboards.forEach(lb => {
          lb.teamScore.forEach(entry => {
            if (entry.isQualified) {
              teamIds.add(entry.teamId.toString());
              crossTrackCount++;
            }
          });
        });
        logger.info(`[resolveSourceTeams] Pulled ${crossTrackCount} qualified teams from cross-track source: ${sourceRoundDoc.roundName}`);
      }
    }
  }

  return Array.from(teamIds).map(id => new mongoose.Types.ObjectId(id));
};
