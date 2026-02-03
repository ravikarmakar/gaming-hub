import Group from "../../models/event-model/group.model.js";
import Round from "../../models/event-model/round.model.js";
import Event from "../../models/event.model.js";
import Leaderboard from "../../models/event-model/leaderBoard.model.js";

import EventRegistration from "../../models/event-model/event-registration.model.js";

// ✅ Get All Groups (With Pagination)
export const getGroups = async (req, res) => {
  try {
    const { roundId } = req.query; // Filter by Round
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (roundId) query.roundId = roundId;

    // Fetch groups with pagination
    const groups = await Group.find(query)
      .populate({
        path: "teams",
        select: "teamName teamLogo", // Optimize payload
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 }); // Ensure consistent order

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
    console.error("Error fetching groups:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const groupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if Group ID is valid
    if (!groupId || groupId.length !== 24) {
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
    console.error("Error in groupDetails:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ⚡ High-Performance Batch Group Creation
export const createGroups = async (req, res) => {
  try {
    const { roundId, totalMatch = 1, matchTime, eventId } = req.body;

    if (!roundId || !eventId) {
      return res.status(400).json({ message: "Round ID and Event ID are required!" });
    }

    // 1️⃣ Check if round exists
    const round = await Round.findById(roundId).populate("eventId");
    if (!round) {
      return res.status(404).json({ message: "Round not found!" });
    }

    // 2️⃣ Fetch Teams (Either from Registrations or Previous Round)
    let allTeams = [];

    if (round.roundNumber === 1) {
      // Fetch Approved Teams from Registrations for Round 1
      const registrations = await EventRegistration.find({
        eventId: eventId,
        status: "approved"
      });
      allTeams = registrations.map((reg) => reg.teamId);
    } else {
      // Fetch Qualified Teams from the Previous Round
      const prevRoundNumber = round.roundNumber - 1;
      const prevRound = await Round.findOne({
        eventId: round.eventId._id,
        roundNumber: prevRoundNumber
      });

      if (!prevRound) {
        return res.status(404).json({ message: `Previous round (Round ${prevRoundNumber}) not found!` });
      }

      // Find all groups in the previous round
      const prevGroups = await Group.find({ roundId: prevRound._id });
      const prevGroupIds = prevGroups.map(g => g._id);

      // Find all qualified teams from leaderboards of these groups
      const leaderboards = await Leaderboard.find({
        groupId: { $in: prevGroupIds }
      });

      leaderboards.forEach(lb => {
        lb.teamScore.forEach(entry => {
          if (entry.isQualified) {
            allTeams.push(entry.teamId);
          }
        });
      });
    }

    if (!allTeams || allTeams.length === 0) {
      const source = round.roundNumber === 1 ? "registrations" : `qualified teams from Round ${round.roundNumber - 1}`;
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

    const teamsPerGroup = 12; // Standard Battle Royale Group Size
    const totalGroups = Math.ceil(allTeams.length / teamsPerGroup);

    console.log(`Creating ${totalGroups} groups for ${allTeams.length} teams...`);

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
      const tempId = i; // Temporary ID to map teams

      groupsData.push({
        roundId,
        groupName,
        totalMatch,
        matchTime: matchTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
        teams: groupTeams, // Adding teams directly to Group model
      });

      groupToTeamsMap[groupName] = groupTeams;
    }

    // 5.5 Apply Round Scheduling (Overwrites if manual passed for entire batch, but usually automated)
    // If Round has startTime and gapMinutes, apply them unless matchTime was specifically passed
    if (round.startTime) {
      let currentMatchTime = new Date(round.startTime);
      const gap = round.gapMinutes || 0;

      // Extract daily window times
      const [startHour, startMin] = (round.dailyStartTime || "13:00").split(":").map(Number);
      const [endHour, endMin] = (round.dailyEndTime || "21:00").split(":").map(Number);

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
        group.totalMatch = round.matchesPerGroup || group.totalMatch;
        group.totalSelectedTeam = round.qualifyingTeams || 1;
      });
    }

    // 6️⃣ Batch Insert Groups (Fastest Method)
    const createdGroups = await Group.insertMany(groupsData);

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
    await Leaderboard.insertMany(leaderboardsData);

    // 9️⃣ NOTIFY TEAMS ABOUT THEIR GROUPS
    try {
      const mongoose = (await import("mongoose")).default;
      const Notification = mongoose.model("Notification");

      for (const group of createdGroups) {
        // Since group.teams contains teamIds, we need to populate or fetch team details if we want more info
        // But for now, we just notify all members of these teams
        for (const teamId of group.teams) {
          const Team = mongoose.model("Team");
          const team = await Team.findById(teamId);

          if (!team) continue;

          const recipientIds = team.teamMembers
            .filter(m => m.isActive)
            .map(m => m.user);

          for (const userId of recipientIds) {
            await Notification.create({
              recipient: userId,
              sender: req.user._id,
              type: "GROUP_CREATED",
              content: {
                title: "Your Group is Ready!",
                message: `You've been assigned to ${group.groupName} in ${round.roundName} for ${round.eventId.eventName}. Match starts at ${new Date(group.matchTime).toLocaleString()}.`
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
    } catch (notifError) {
      console.error("Error sending group creation notifications:", notifError);
    }

    return res.status(201).json({
      message: "Groups and Leaderboards created successfully!",
      totalGroups: createdGroups.length,
      groups: createdGroups, // Return first few for verification if needed
    });
  } catch (error) {
    console.error("Error in createGroups:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { groupName, totalMatch, roomId, roomPassword, totalSelectedTeam, matchTime } = req.body;

    let group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Apply updates
    if (groupName) group.groupName = groupName;
    if (totalMatch !== undefined) group.totalMatch = totalMatch;
    if (roomId !== undefined) group.roomId = roomId;
    if (roomPassword !== undefined) group.roomPassword = roomPassword;
    if (totalSelectedTeam !== undefined) group.totalSelectedTeam = totalSelectedTeam;
    if (matchTime) group.matchTime = matchTime;

    // 🔄 Recalibrate Status
    if (group.matchesPlayed >= group.totalMatch) {
      group.status = "completed";
    } else if (group.matchesPlayed > 0) {
      group.status = "ongoing";
    } else if (group.status === "completed") {
      // If it was completed but totalMatch increased
      group.status = "ongoing";
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group
    });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
