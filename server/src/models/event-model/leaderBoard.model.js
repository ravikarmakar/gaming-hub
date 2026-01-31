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

import pointSystem from "../../config/pointSystem.js";

// 🔹 **Auto-Update `totalPoints` & `matchesPlayed` Before Save**
leaderboardSchema.pre("save", async function (next) {
  this.teamScore.forEach((team) => {
    // Total Points = Place Points (score) + Kills * Kill Point
    team.totalPoints = (team.score || 0) + (team.kills || 0) * (pointSystem.killPoint || 1);
    // team.matchesPlayed = await mongoose.model("Match").countDocuments({ teamId: team.teamId }); // Match model does not exist yet
  });

  next();
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
export default Leaderboard;
