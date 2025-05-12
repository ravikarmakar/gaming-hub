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
      },
    ],
  },
  { timestamps: true }
);

// 🔹 **Auto-Update `totalPoints` & `matchesPlayed` Before Save**
leaderboardSchema.pre("save", async function (next) {
  const updates = this.teamScore.map(async (team) => {
    team.totalPoints = team.score + team.kills * 2 + team.wins * 5;
    team.matchesPlayed = await mongoose
      .model("Match")
      .countDocuments({ teamId: team.teamId });
  });

  await Promise.all(updates);
  next();
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
export default Leaderboard;
