import Group from "../../models/event-model/group.model.js";
import Round from "../../models/event-model/round.model.js";
import Event from "../../models/event.model.js";
import Leaderboard from "../../models/event-model/leaderBoard.model.js";

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
    const { roundId, totalMatch = 1, matchTime } = req.body;

    if (!roundId) {
      return res.status(400).json({ message: "Round ID is required!" });
    }

    // 1️⃣ Check if round exists
    const round = await Round.findById(roundId).populate("eventId");
    if (!round) {
      return res.status(404).json({ message: "Round not found!" });
    }

    // 2️⃣ Fetch Event & Teams
    const event = await Event.findById(round.eventId._id).populate("teams");
    if (!event || event.teams.length === 0) {
      return res.status(404).json({ message: "No teams found for this event!" });
    }

    // 3️⃣ Verify if groups already exist for this round (Prevent Duplicates)
    const existingGroupsCount = await Group.countDocuments({ roundId });
    if (existingGroupsCount > 0) {
      return res.status(400).json({
        message:
          "Groups already exist for this round! Delete them first if you want to recreate.",
      });
    }

    // 4️⃣ Extract team IDs & Shuffle for fairness
    const allTeams = event.teams.map((team) => team._id);
    // Fisher-Yates Shuffle for better randomness
    for (let i = allTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTeams[i], allTeams[j]] = [allTeams[j], allTeams[i]];
    }

    const teamsPerGroup = 12; // Standard Battle Royale Group Size
    const totalGroups = Math.ceil(allTeams.length / teamsPerGroup);

    console.log(`Creating ${totalGroups} groups for ${allTeams.length} teams...`);

    // 5️⃣ Prepare Groups Data (In-Memory)
    const groupsData = [];
    const groupToTeamsMap = {}; // Helper to link teams to groups later

    for (let i = 0; i < totalGroups; i++) {
      const groupTeams = allTeams.slice(
        i * teamsPerGroup,
        (i + 1) * teamsPerGroup
      );

      const groupName = `Group ${String.fromCharCode(65 + i)}`; // Group A, Group B...
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
