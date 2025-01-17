import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team", // Reference to the Team model
      },
    ],
    leaderboard: [leaderboardEntrySchema], // Group-specific leaderboard
  },
  { _id: false }
);
