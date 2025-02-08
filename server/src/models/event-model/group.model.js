import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
    },
    name: {
      type: String,
      required: true,
      default: "Group-A",
    },
    status: {
      type: Boolean,
      default: false,
    },

    matchTime: {
      type: Date,
    },
    totalMatch: {
      type: String,
    },
    SelectedTeams: {
      type: String,
    },
    // teams: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Team", // Reference to the Team model
    //   },
    // ],
    leaderboard: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LeaderboardTeams",
      },
    ],
  },
  {}
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
