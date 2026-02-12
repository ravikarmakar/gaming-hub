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
      required: true,
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
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
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


// Auto-generate URL-safe slug from name before saving (only on creation)
organizerSchema.pre("save", function (next) {
  // Only generate slug for new documents to avoid breaking existing URLs
  if (this.isNew && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    if (!this.slug || this.slug.length === 0) {
      // Fallback for names that result in empty slugs (e.g. "!!!" -> "")
      // Use a timestamp-based slug to ensure uniqueness and validity
      this.slug = `org-${Date.now()}`;
    }
  }
  next();
});

const Organizer =
  mongoose.models.Organizer || mongoose.model("Organizer", organizerSchema);

export default Organizer;
