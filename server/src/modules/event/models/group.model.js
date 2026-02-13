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

// 🚀 Logic to auto-update status to 'ongoing' if matchTime has passed
const updateStatusIfExpired = (docOrUpdate, isUpdate = false) => {
  const now = new Date();

  if (isUpdate) {
    // For findOneAndUpdate/updateOne, docOrUpdate is the update object
    const matchTime = docOrUpdate.matchTime;
    const currentStatus = docOrUpdate.status;

    // We only auto-transition from 'pending' (or if status is not provided and assumed pending)
    if ((!currentStatus || currentStatus === "pending") && matchTime && new Date(matchTime) <= now) {
      docOrUpdate.status = "ongoing";
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
