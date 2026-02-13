import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true, // ✅ Index for faster retrieval
    },
    teamScore: [
      {
        teamId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
          index: true, // ✅ Index added for faster team queries
        },
        score: { type: Number, default: 0 },
        position: { type: Number, index: true }, // ✅ Position index
        kills: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 },
        matchesPlayed: { type: Number, default: 0 },
        isQualified: { type: Boolean, default: false }, // ✅ Manual Qualification Status
      },
    ],
  },
  { timestamps: true }
);

import pointSystem from "../../../shared/config/pointSystem.js";

// 🔹 **Unified calculation and sorting logic**
const calculateAndSortScores = (teamScore) => {
  if (!teamScore || !Array.isArray(teamScore)) return;

  // 1. Calculate totalPoints for each team
  teamScore.forEach(team => {
    // Total Points = Place Points (score) + Kills * Kill Point
    team.totalPoints = (team.score || 0) + (team.kills || 0) * (pointSystem.killPoint || 1);
  });

  // 2. Sort teams by totalPoints descending
  teamScore.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
};

leaderboardSchema.pre("save", async function (next) {
  calculateAndSortScores(this.teamScore);
  next();
});

// 🚀 Apply calculation and sorting logic on updates
leaderboardSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate();
  // Check if teamScore is being updated
  if (update && (update.teamScore || update.$set?.teamScore)) {
    const teamScore = update.teamScore || update.$set.teamScore;
    calculateAndSortScores(teamScore);
  }
  next();
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
export default Leaderboard;
