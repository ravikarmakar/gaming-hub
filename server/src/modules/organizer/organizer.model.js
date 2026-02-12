import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    imageUrl: { type: String, default: null, trim: true },
    imageFileId: { type: String, default: null, trim: true },
    bannerUrl: { type: String, default: null, trim: true },
    bannerFileId: { type: String, default: null, trim: true },
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    slug: { type: String, lowercase: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        "Please enter valid email",
      ],
    },
    tag: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 5
    },
    description: { type: String, trim: true, maxlength: 2000, default: "" },

    // Statistics (denormalized for performance)
    stats: {
      totalEvents: { type: Number, default: 0, min: 0 },
      memberCount: { type: Number, default: 1, min: 1 },
      totalPrizePool: { type: Number, default: 0, min: 0 },
    },

    socialLinks: {
      discord: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },

    isVerified: { type: Boolean, default: false },
    isHiring: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for performance
organizerSchema.index({ isVerified: 1 });
organizerSchema.index({ isDeleted: 1 });
organizerSchema.index({ "stats.totalEvents": -1 });

// Text index
organizerSchema.index({ name: "text", tag: "text" });

// Partial Indexes for uniqueness (allows reusing names/tags of deleted orgs)
organizerSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
organizerSchema.index({ tag: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
organizerSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });


// Auto-generate slug from name before saving
organizerSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

const Organizer =
  mongoose.models.Organizer || mongoose.model("Organizer", organizerSchema);

export default Organizer;
