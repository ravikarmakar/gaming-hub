import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
      required: true,
      index: true, // ⚡ Faster queries
    },
    groupName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    matchTime: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // ⚡ Default: Next day
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    totalMatch: {
      type: Number,
      default: 1,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    roomId: {
      type: Number,
    },
    roomPassword: {
      type: Number,
    },
    totalSelectedTeam: {
      type: Number,
      default: 0,
    },
    isDeleted: { type: Boolean, default: false }, // ⚡ Soft delete
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

groupSchema.pre("save", function (next) {
  if (
    this.status === "pending" &&
    this.matchTime <= new Date()
  ) {
    this.status = "ongoing";
  }
  next();
});


// Virtual Field: isUpcoming**
groupSchema.virtual("isUpcoming").get(function () {
  return this.matchTime > new Date();
});

// **Pre-save hook for Auto Group Name**
groupSchema.pre("save", async function (next) {
  if (!this.groupName) {
    const groupCount = await mongoose
      .model("Group")
      .countDocuments({ roundId: this.roundId });
    this.groupName = `Group-${groupCount + 1}`;
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);
export default Group;
