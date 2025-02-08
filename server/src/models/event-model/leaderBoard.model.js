import mongoose from "mongoose";

// Leaderboard Schema for each Tournament
const leaderboardSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team", // Reference to User (or Team if you're storing teams)
      required: true,
    },
    rank: {
      type: String,
    },
    totalPoints: {
      type: String,
    },
    matchesPlayed: {
      type: String,
    },
    kills: {
      type: String,
    },

    wins: {
      type: String,
    },
  },
  { timestamps: true }
);

const LeaderboardTeams = mongoose.model("Leaderboard", leaderboardSchema);

export default LeaderboardTeams;
