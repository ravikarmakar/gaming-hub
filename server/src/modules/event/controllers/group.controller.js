import mongoose from "mongoose";
import Group from "../models/group.model.js";
import Round from "../models/round.model.js";
import Leaderboard from "../models/leaderBoard.model.js";
import { logger } from "../../../shared/utils/logger.js";
import { TryCatchHandler } from "../../../shared/middleware/error.middleware.js";
import { withOptionalTransaction } from "../../../shared/utils/withOptionalTransaction.js";
import { resolveSourceTeams } from "../utils/team-resolver.js";


// ✅ Get All Groups (With Pagination)
export const getGroups = async (req, res) => {
  try {
    const { roundId, search, status, sortBy } = req.query; // Filter by Round, Search, Status
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };
    if (roundId) {
      if (!mongoose.Types.ObjectId.isValid(roundId)) {
        return res.status(400).json({ message: "Invalid Round ID!" });
      }
      query.roundId = roundId;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.groupName = { $regex: escapedSearch, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    // Determine Sort
    let sortOptions = { createdAt: 1 };
    if (sortBy === "matchTime-asc") {
      sortOptions = { matchTime: 1 };
    } else if (sortBy === "matchTime-desc") {
      sortOptions = { matchTime: -1 };
    } else if (sortBy === "name-asc") {
      sortOptions = { groupName: 1 };
    } else if (sortBy === "name-desc") {
      sortOptions = { groupName: -1 };
    }

    // Fetch groups with pagination
    const groups = await Group.find(query)
      .populate({
        path: "teams",
        select: "teamName imageUrl", // Optimize payload
      })
      .skip(skip)
      .limit(limit)
      .sort(sortOptions); // Flexible sorting

    const totalGroups = await Group.countDocuments(query);

    res.status(200).json({
      success: true,
      data: groups,
      pagination: {
        totalGroups,
        totalPages: Math.ceil(totalGroups / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    logger.error("Error fetching groups:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const groupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if Group ID is valid
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid Group ID!" });
    }

    // Fetch Group with Teams Populated
    const group = await Group.findById(groupId).populate("teams");

    //Check if group exists
    if (!group) {
      return res.status(404).json({ message: "Group not found!" });
    }

    return res.status(200).json({
      message: "Group details fetched successfully!",
      group,
    });
  } catch (error) {
    logger.error("Error in groupDetails:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ⚡ High-Performance Batch Group Creation
export const createGroups = async (req, res) => {
  try {
    const { roundId, matchTime, eventId } = req.body;
    const bodyTotalMatch = req.body.totalMatch;

    if (!roundId || !eventId) {
      return res.status(400).json({ message: "Round ID and Event ID are required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(roundId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid Round ID or Event ID format!" });
    }

    // 1️⃣ Check if round exists
    const round = await Round.findById(roundId).populate("eventId");
    if (!round) {
      return res.status(404).json({ message: "Round not found!" });
    }

    // 2️⃣ Resolve Sequence Position and Fetch Teams
    let allTeams = [];

    if (round.eligibleTeams && round.eligibleTeams.length > 0) {
      allTeams = round.eligibleTeams;
      logger.info(`Using ${allTeams.length} pre-merged/eligible teams for Round ${round.roundNumber}`);
    } else {
      allTeams = await resolveSourceTeams({ roundId, eventId });
      logger.info(`Resolved ${allTeams.length} teams for Round ${round.roundNumber} using Unified Resolver`);
    }

    if (!allTeams || allTeams.length === 0) {

      const source = round.roundNumber === 1 ? "registrations" : "qualified teams from the previous round";
      return res.status(400).json({ message: `No ${source} found for this event!` });
    }

    // 3️⃣ Verify if groups already exist for this round (Prevent Duplicates)
    const existingGroupsCount = await Group.countDocuments({ roundId });
    if (existingGroupsCount > 0) {
      return res.status(400).json({
        message:
          "Groups already exist for this round! Delete them first if you want to recreate.",
      });
    }

    // 4️⃣ Shuffle for fairness
    for (let i = allTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTeams[i], allTeams[j]] = [allTeams[j], allTeams[i]];
    }

    // 4️⃣ Detect League Mode (18 teams) or Standard (12 teams)
    // Based on user feedback: "league" means 18 teams per group.
    const isLeague = round.isLeague || allTeams.length === 18;
    const teamsPerGroup = isLeague ? 18 : (round.groupSize || 12);
    const totalGroups = Math.ceil(allTeams.length / teamsPerGroup);

    logger.info(`Creating ${totalGroups} groups for ${allTeams.length} teams (Type: ${isLeague ? "LEAGUE" : "STANDARD"})...`);

    // 5️⃣ Prepare Groups Data (In-Memory)
    const groupsData = [];
    const groupToTeamsMap = {};

    const generateGroupName = (index) => {
      let name = "";
      while (index >= 0) {
        name = String.fromCharCode((index % 26) + 65) + name;
        index = Math.floor(index / 26) - 1;
      }
      return `Group ${name}`;
    };

    for (let i = 0; i < totalGroups; i++) {
      const groupTeams = allTeams.slice(
        i * teamsPerGroup,
        (i + 1) * teamsPerGroup
      );

      const groupName = generateGroupName(i);
      groupToTeamsMap[groupName] = groupTeams;

      // For league groups, totalMatch is matches PER PAIRING x 3
      // e.g. if matchesPerGroup is 6, total matches = 18 (6 AxB + 6 BxC + 6 AxC)
      const computedTotalMatch = isLeague
        ? (round.matchesPerGroup ? round.matchesPerGroup * 3 : 18)
        : (bodyTotalMatch && bodyTotalMatch > 1 ? bodyTotalMatch : (round.matchesPerGroup || bodyTotalMatch || 1));

      // 🏆 For league groups: divide teams into 3 equal sub-groups (A, B, C)
      // These define AxB/BxC/AxC pairing. Each sub-group plays against the other two.
      let subGroups = [];
      if (isLeague) {
        const n = groupTeams.length;
        const chunk = Math.ceil(n / 3);
        subGroups = [
          { name: "Sub-Group A", teams: groupTeams.slice(0, chunk) },
          { name: "Sub-Group B", teams: groupTeams.slice(chunk, chunk * 2) },
          { name: "Sub-Group C", teams: groupTeams.slice(chunk * 2) },
        ];
      }

      groupsData.push({
        roundId,
        groupName,
        totalMatch: computedTotalMatch,
        matchTime: matchTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
        teams: groupTeams,
        isLeague,
        leaguePairingType: round.leaguePairingType || "standard",
        groupSize: teamsPerGroup,
        totalSelectedTeam: round.qualifyingTeams || 0,
        subGroups,
      });
    }


    // 5.5 Apply Round Scheduling (Overwrites if manual passed for entire batch, but usually automated)
    // If Round has startTime and gapMinutes, apply them unless matchTime was specifically passed
    if (round.startTime) {
      let currentMatchTime = new Date(round.startTime);
      const gap = round.gapMinutes || 0;

      // Helper to validate time format HH:mm
      const isValidTimeFormat = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

      // Extract daily window times
      const dailyStart = round.dailyStartTime || "13:00";
      const dailyEnd = round.dailyEndTime || "21:00";

      if (!isValidTimeFormat(dailyStart) || !isValidTimeFormat(dailyEnd)) {
        return res.status(400).json({ message: "Invalid daily start/end time format. Expected HH:mm" });
      }

      const [startHour, startMin] = dailyStart.split(":").map(Number);
      const [endHour, endMin] = dailyEnd.split(":").map(Number);

      // Helper to set time on a date
      const setTime = (date, hours, minutes) => {
        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      // Set initial match time to at least the daily start time of the starts date
      const dayStart = setTime(currentMatchTime, startHour, startMin);
      if (currentMatchTime < dayStart) {
        currentMatchTime = dayStart;
      }

      groupsData.forEach((group, index) => {
        // If matchTime is not manually sent in body, use schedule
        if (!req.body.matchTime) {
          if (index > 0) {
            currentMatchTime = new Date(currentMatchTime.getTime() + (gap * 60000));
          }

          // Check if exceeded daily window
          const dayEnd = setTime(currentMatchTime, endHour, endMin);
          if (currentMatchTime > dayEnd) {
            // Shift to next day
            currentMatchTime.setDate(currentMatchTime.getDate() + 1);
            currentMatchTime = setTime(currentMatchTime, startHour, startMin);
          }

          group.matchTime = new Date(currentMatchTime);
        }
        // Apply other defaults
        group.totalSelectedTeam = round.qualifyingTeams || 1;
      });
    }

    const createdGroups = await withOptionalTransaction(async (session) => {
      const createdGroups = await Group.insertMany(groupsData, { session });

      // 7️⃣ Prepare Leaderboards for each Group
      const leaderboardsData = createdGroups.map((group) => {
        const teamsInGroup = groupToTeamsMap[group.groupName] || [];

        const teamScore = teamsInGroup.map((teamId) => ({
          teamId,
          score: 0,
          kills: 0,
          wins: 0,
        }));

        return {
          groupId: group._id,
          teamScore,
        };
      });

      // 8️⃣ Batch Insert Leaderboards
      await Leaderboard.insertMany(leaderboardsData, { session });

      // 9️⃣ NOTIFY TEAMS ABOUT THEIR GROUPS
      if (req.user && req.user._id) {
        const Notification = mongoose.model("Notification");
        const Team = mongoose.model("Team");

        const allTeamIds = createdGroups.flatMap(group => group.teams);

        const teamsQuery = Team.find({ _id: { $in: allTeamIds } }).lean();
        if (session) teamsQuery.session(session);
        const teams = await teamsQuery;
        const teamMap = new Map(teams.map(t => [t._id.toString(), t]));

        const notificationsToCreate = [];

        for (const group of createdGroups) {
          for (const teamId of group.teams) {
            const team = teamMap.get(teamId.toString());
            if (!team || !team.teamMembers) continue;

            const recipientIds = team.teamMembers
              .filter(m => m.isActive)
              .map(m => m.user);

            for (const userId of recipientIds) {
              notificationsToCreate.push({
                recipient: userId,
                sender: req.user._id,
                type: "GROUP_CREATED",
                content: {
                  title: "Your Group is Ready!",
                  message: `You've been assigned to ${group.groupName} in ${round.roundName} for ${round.eventId.eventName}. Match starts at ${new Date(group.matchTime).toISOString()}.`
                },
                relatedData: {
                  eventId: round.eventId._id,
                  teamId: team._id,
                  groupId: group._id
                },
                actions: [
                  {
                    label: "View Team List",
                    actionType: "VIEW",
                    payload: { path: `/groups/${group._id}/teams` }
                  }
                ]
              });
            }
          }
        }

        if (notificationsToCreate.length > 0) {
          await Notification.insertMany(notificationsToCreate, { session });
        }
      } else {
        logger.warn("Cannot send notifications: req.user is not available");
      }

      return createdGroups;
    });

    return res.status(201).json({
      message: "Groups and Leaderboards created successfully!",
      totalGroups: createdGroups.length,
      groups: createdGroups, // Return first few for verification if needed
    });
  } catch (error) {
    logger.error("Error in createGroups:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ➕ Create a Single Group & League Group Manually
export const createSingleGroup = async (req, res) => {
  try {
    const { roundId, eventId, groupName, matchTime, groupType, groupSize } = req.body;

    if (!roundId || !eventId) {
      return res.status(400).json({ message: "Round ID and Event ID are required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(roundId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid Round ID or Event ID format!" });
    }

    const round = await Round.findOne({ _id: roundId, eventId });
    if (!round) {
      return res.status(404).json({ message: "Round not found for this event!" });
    }

    // Handle Auto Group Name if not provided
    const generateGroupName = (index) => {
      let name = "";
      let i = index;
      while (i >= 0) {
        name = String.fromCharCode((i % 26) + 65) + name;
        i = Math.floor(i / 26) - 1;
      }
      return `Group ${name}`;
    };

    // Detection logic for League Mode
    const isLeagueCreation = groupType === "league";

    const result = await withOptionalTransaction(async (session) => {
      let finalGroupName = groupName;
      if (!finalGroupName) {
        const groupCount = await Group.countDocuments({ roundId }).session(session);
        finalGroupName = generateGroupName(groupCount);

        // Verify name uniqueness in this round to prevent race condition
        let nameCollision = await Group.findOne({ roundId, groupName: finalGroupName }).session(session);
        let suffix = 1;
        while (nameCollision) {
          finalGroupName = `${generateGroupName(groupCount)} (${suffix})`;
          nameCollision = await Group.findOne({ roundId, groupName: finalGroupName }).session(session);
          suffix++;
        }
      }

      let teams = [];
      let subGroups = [];

      // Calculate total match based on round config OR body override
      const bodyTotalMatch = req.body.totalMatch;
      let totalMatch = bodyTotalMatch ?? (round.isLeague ? (round.matchesPerGroup * 3 || 18) : (round.matchesPerGroup || 1));

      if (isLeagueCreation) {
        // Resolve teams for league
        const allTeams = await resolveSourceTeams({ roundId, eventId, session });

        if (allTeams.length < 12) {
          throw new Error(`Insufficient teams for a league group. Found only ${allTeams.length}. Minimum 12 required.`);
        }

        // Take up to 18 teams if they exist
        teams = allTeams.slice(0, 18);

        // Divide into A, B, C for league pairings (Dynamic chunk size)
        const n = teams.length;
        const chunk = Math.ceil(n / 3);
        subGroups = [
          { name: "Sub-Group A", teams: teams.slice(0, chunk) },
          { name: "Sub-Group B", teams: teams.slice(chunk, chunk * 2) },
          { name: "Sub-Group C", teams: teams.slice(chunk * 2) },
        ];

        // Ensure totalMatch is correctly set for league
        if (!bodyTotalMatch || bodyTotalMatch === 1) {
          totalMatch = round.matchesPerGroup ? round.matchesPerGroup * 3 : 18;
        }
      } else {
        // For standard groups, if totalMatch is 1 but round says otherwise, prefer round
        if ((!bodyTotalMatch || bodyTotalMatch === 1) && round.matchesPerGroup > 1) {
          totalMatch = round.matchesPerGroup;
        }
      }

      const [group] = await Group.create([{
        roundId,
        groupName: finalGroupName,
        matchTime: matchTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
        totalMatch: totalMatch,
        totalSelectedTeam: round.qualifyingTeams || 0,
        teams: teams,
        isLeague: isLeagueCreation || round.isLeague,
        groupSize: isLeagueCreation ? 18 : (groupSize || round.groupSize || 0),
        subGroups: subGroups,
        leaguePairingType: round.leaguePairingType || "standard",
      }], { session });

      // Create a corresponding Leaderboard
      const teamScore = teams.map(teamId => ({
        teamId,
        score: 0,
        kills: 0,
        wins: 0,
        totalPoints: 0,
        matchesPlayed: 0,
      }));

      await Leaderboard.create([{
        groupId: group._id,
        teamScore: teamScore,
      }], { session });

      return group;
    });

    return res.status(201).json({
      success: true,
      message: isLeagueCreation ? "League Group created successfully!" : "Group created successfully!",
      group: result,
    });
  } catch (error) {
    logger.error("Error in createSingleGroup:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { groupName, totalMatch, roomId, roomPassword, totalSelectedTeam, matchTime, subGroups } = req.body;

    // Validate groupId
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid Group ID" });
    }

    let group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Apply updates
    if (groupName) group.groupName = groupName;
    if (totalMatch !== undefined) group.totalMatch = totalMatch;
    if (roomId !== undefined) group.roomId = roomId;
    if (roomPassword !== undefined) group.roomPassword = roomPassword;
    if (totalSelectedTeam !== undefined) group.totalSelectedTeam = totalSelectedTeam;
    if (matchTime) group.matchTime = matchTime;
    if (subGroups) group.subGroups = subGroups;

    // 🔄 Recalibrate Status (Fixed logic for matchesPlayed === 0)
    if (group.matchesPlayed >= group.totalMatch && group.totalMatch > 0) {
      group.status = "completed";
    } else if (group.matchesPlayed > 0) {
      group.status = "ongoing";
    } else if (group.matchesPlayed === 0) {
      // When no matches played, keep as pending unless explicitly changed
      if (group.status === "completed") {
        // If was completed but totalMatch increased and no matches played yet
        group.status = "pending";
      }
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group
    });
  } catch (error) {
    logger.error("Error updating group:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetGroup = TryCatchHandler(async (req, res) => {
  const { groupId } = req.params;

  if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Invalid Group ID" });
  }

  const result = await withOptionalTransaction(async (session) => {
    const group = await Group.findById(groupId).session(session);
    if (!group) throw new Error("Group not found");

    // 1. Reset Group Status and Matches
    group.matchesPlayed = 0;
    group.status = "pending";
    group.pairingMatches = { AxB: 0, BxC: 0, AxC: 0 };
    await group.save({ session });

    // 2. Reset Leaderboard Scores
    const leaderboard = await Leaderboard.findOne({ groupId }).session(session);
    if (leaderboard) {
      leaderboard.teamScore.forEach((entry) => {
        entry.score = 0;
        entry.kills = 0;
        entry.wins = 0;
        entry.totalPoints = 0;
        entry.matchesPlayed = 0;
        entry.isQualified = false;
      });
      await leaderboard.save({ session });
    }

    return group;
  });

  return res.status(200).json({
    success: true,
    message: "Group matches reset successfully",
    group: result,
  });
});

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid Group ID" });
    }

    const result = await withOptionalTransaction(async (session) => {
      const group = await Group.findById(groupId).session(session);
      if (!group) {
        const error = new Error("Group not found");
        error.status = 404;
        throw error;
      }

      // Delete associated Leaderboard
      await Leaderboard.deleteMany({ groupId }, { session });

      // Delete Group
      await Group.findByIdAndDelete(groupId, { session });

      return true;
    });

    res.status(200).json({
      success: true,
      message: "Group and associated leaderboard deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting group:", error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Internal Server Error" });
  }
};

export const injectTeam = async (req, res) => {
  try {
    const { groupId, teamId, eventId } = req.body;

    if (!groupId || !teamId || !eventId) {
      return res.status(400).json({ message: "Group ID, Team ID, and Event ID are required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: "Invalid Group ID or Team ID format!" });
    }

    const result = await withOptionalTransaction(async (session) => {
      // 1. Atomic Team Addition with Event/Group Verification
      const group = await Group.findOneAndUpdate(
        {
          _id: groupId,
          teams: { $ne: teamId }
        },
        { $push: { teams: teamId } },
        { session, new: true }
      ).populate('roundId');

      if (!group) {
        // Find out why it failed
        const existingGroup = await Group.findById(groupId).session(session);
        if (!existingGroup) throw new Error("Group not found");
        if (existingGroup.teams.some(id => id.equals(teamId))) {
          throw new Error("Team already exists in this group");
        }
        throw new Error("Inject team failed");
      }

      // Verify group belongs to the specified event
      const round = await Round.findById(group.roundId).session(session);
      if (!round || round.eventId.toString() !== eventId) {
        throw new Error("Group/Event mismatch");
      }

      // 2. Add team to leaderboard atomically
      const leaderboard = await Leaderboard.findOneAndUpdate(
        { groupId },
        {
          $push: {
            teamScore: {
              teamId,
              score: 0,
              kills: 0,
              wins: 0,
              totalPoints: 0,
              matchesPlayed: 0,
              isQualified: false
            }
          }
        },
        { session, new: true }
      );

      if (!leaderboard) {
        throw new Error("Leaderboard not found for this group");
      }

      // Synchronize round.eligibleTeams
      await Round.updateOne(
        { _id: group.roundId },
        { $addToSet: { eligibleTeams: teamId } },
        { session }
      );

      return group;
    });

    return res.status(200).json({
      success: true,
      message: "Team injected into group successfully!",
      group: result
    });
  } catch (error) {
    logger.error("Error in injectTeam:", error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Internal Server Error" });
  }
};

export const mergeQualifiedTeamsIntoGroup = TryCatchHandler(async (req, res) => {
  const { groupId } = req.params;
  const { eventId } = req.body;

  if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Valid Group ID required" });
  }

  const result = await withOptionalTransaction(async (session) => {
    const group = await Group.findById(groupId).populate("roundId").session(session);
    if (!group) throw new Error("Group not found");

    const roundId = group.roundId._id;
    const allResolvedTeams = await resolveSourceTeams({ roundId, eventId, session });

    // Fetch all current group assignments for this round to prevent cross-group duplication
    const allGroupsInRound = await Group.find({ roundId }).session(session);
    const existingRoundTeamIds = new Set();
    allGroupsInRound.forEach(g => {
      g.teams.forEach(tid => existingRoundTeamIds.add(tid.toString()));
    });

    const newTeams = allResolvedTeams.filter(id => !existingRoundTeamIds.has(id.toString()));

    if (newTeams.length > 0) {
      // Add teams to group
      group.teams.push(...newTeams);
      await group.save({ session });

      // Add to leaderboard
      const Leaderboard = mongoose.model("Leaderboard");
      const leaderboard = await Leaderboard.findOne({ groupId }).session(session);
      if (leaderboard) {
        newTeams.forEach(teamId => {
          leaderboard.teamScore.push({
            teamId,
            score: 0,
            kills: 0,
            wins: 0,
            totalPoints: 0,
            matchesPlayed: 0,
            isQualified: false
          });
        });
        leaderboard.markModified('teamScore');
        await leaderboard.save({ session });
      }

      // Synchronize round.eligibleTeams so the frontend knows these teams are merged
      const Round = mongoose.model("Round");
      await Round.updateOne(
        { _id: roundId },
        { $addToSet: { eligibleTeams: { $each: newTeams } } },
        { session }
      );
    }

    return { group, mergedCount: newTeams.length };
  });


  return res.status(200).json({
    success: true,
    message: `Merged ${result.mergedCount} teams successfully!`,
    group: result.group
  });
});
