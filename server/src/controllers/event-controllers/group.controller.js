import Group from "../../models/event-model/group.model.js";
import Round from "../../models/event-model/round.model.js";
import mongoose from "mongoose";

// Create a new group
export const createGroup = async (req, res) => {
  const { roundId } = req.params; // Get the round ID from the request parameters
  const { name, status, matchTime, totalMatch, SelectedTeams, leaderboard } =
    req.body;

  try {
    // Step 1: Create a new group
    const newGroup = new Group({
      roundId,
      name,
      status,
      matchTime,
      totalMatch,
      SelectedTeams,
      leaderboard,
    });

    const savedGroup = await newGroup.save();

    // Step 2: Add the group to the specified round
    const updatedRound = await Round.findByIdAndUpdate(
      roundId,
      { $push: { groups: savedGroup._id } }, // Push the group's ObjectId to the `groups` field
      { new: true }
    );

    if (!updatedRound) {
      return res.status(404).json({ message: "Round not found" });
    }

    // Step 3: Respond with the saved group and updated round
    res.status(201).json({
      message: "Group created and added to the round successfully",
      group: savedGroup,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all groups
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({});
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get One Group
export const getOneGroup = async (req, res) => {
  const { groupId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Group ID" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    res.status(200).json({ success: true, group });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
