import mongoose from "mongoose";

// Leaderboard Schema for each Tournament
const leaderboardSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament", // Reference to Tournament
      required: true,
    },
    teams: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team", // Reference to User (or Team if you're storing teams)
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    points: {
      type: Number,
      default: 0, // You can adjust based on the game rules
    },
    kills: {
      type: Number,
      default: 0, // Optional: If you want to track kills or other metrics
    },
    wins: {
      type: Number,
      default: 0, // Optional: If you want to track wins
    },
  },
  { timestamps: true }
);

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

export default Leaderboard;
