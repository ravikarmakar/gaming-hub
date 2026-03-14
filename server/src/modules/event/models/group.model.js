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
    groupSize: {
      type: Number,
      default: 0,
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
    isLeague: {
      type: Boolean,
      default: false,
    },
    leaguePairingType: {
      type: String,
      enum: ["standard", "axb-bxc-axc"],
      default: "standard",
    },
    // 🏆 Per-pairing match counters for league format
    pairingMatches: {
      AxB: { type: Number, default: 0 },
      BxC: { type: Number, default: 0 },
      AxC: { type: Number, default: 0 },
    },
    // 🏆 Sub-groups for league format (AxB, BxC, AxC style)
    // Auto-generated when a league group is created.
    // e.g. 18 teams → Sub-Group A (6), Sub-Group B (6), Sub-Group C (6)
    subGroups: [
      {
        name: { type: String }, // "Sub-Group A", "Sub-Group B", "Sub-Group C"
        teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
      },
    ],
    isDeleted: { type: Boolean, default: false }, // ⚡ Soft delete
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// 🚀 Logic to auto-update status to 'ongoing' if matchTime has passed
const updateStatusIfExpired = (docOrUpdate, isUpdate = false) => {
  const now = new Date();

  if (isUpdate) {
    // For findOneAndUpdate/updateOne, docOrUpdate is the update object (often has $set)
    // We need to check both direct properties and $set properties
    const updateCmd = docOrUpdate.$set || docOrUpdate;
    const matchTime = updateCmd.matchTime;
    const currentStatus = updateCmd.status;

    // We only auto-transition if we are setting/have a pending status and matchTime is past
    if ((!currentStatus || currentStatus === "pending") && matchTime && new Date(matchTime) <= now) {
      if (docOrUpdate.$set) {
        docOrUpdate.$set.status = "ongoing";
      } else {
        docOrUpdate.status = "ongoing";
      }
    }
  } else {
    // For save, docOrUpdate is the document
    if (docOrUpdate.status === "pending" && docOrUpdate.matchTime <= now) {
      docOrUpdate.status = "ongoing";
    }
  }
};

groupSchema.pre("save", async function (next) {
  // 1. Handle Auto Group Name
  if (!this.groupName) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.groupName = `Group-${timestamp}-${random}`;
  }

  // 2. Handle Status Auto-transition
  updateStatusIfExpired(this);

  next();
});

// 🚀 Apply status logic on updates
groupSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate();
  if (update) {
    updateStatusIfExpired(update, true);
  }
  next();
});


// Virtual Field: isUpcoming**
groupSchema.virtual("isUpcoming").get(function () {
  return this.matchTime > new Date();
});


const Group = mongoose.model("Group", groupSchema);
export default Group;
