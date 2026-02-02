import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { roleSchema } from "./role.model.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be less than 30 characters"],
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.oauthProvider;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    oauthProvider: { type: String }, // "google", "discord", etc.
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?name=gamer&background=random",
    },
    avatarFileId: { type: String, default: null, trim: true },
    coverImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1920&auto=format&fit=crop",
    },
    coverImageFileId: { type: String, default: null, trim: true },
    isAccountVerified: { type: Boolean, default: false },
    isPlayerVerified: { type: Boolean, default: false },
    gameIgn: { type: String, default: "" },
    gameUid: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"], default: "prefer_not_to_say" },
    dob: { type: Date },
    phoneNumber: { type: String, default: "" },
    settings: {
      allowChallenges: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true },
      notifications: {
        platform: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      }
    },
    verifyOtp: { type: String, default: "", select: false },
    verifyOtpExpireAt: { type: Number, default: 0, select: false },
    resetOtp: { type: String, default: "", select: false },
    resetOtpExpireAt: { type: Number, default: 0, select: false },
    orgId: { type: mongoose.Types.ObjectId, ref: "Organizer", default: null },
    teamId: { type: mongoose.Types.ObjectId, ref: "Team", default: null },
    canCreateOrg: { type: Boolean, default: false },
    eventHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    esportsRole: {
      type: String,
      enum: ["rusher", "sniper", "support", "igl", "coach", "player"],
      default: "player",
    },
    roles: {
      type: [roleSchema],
      default: [
        {
          scope: "platform",
          role: "platform:user",
        },
      ],
    },
    isDeleted: { type: Boolean, default: false },
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio must be less than 500 characters"],
    },
    location: { type: String, default: "" },
    region: {
      type: String,
      default: "global",
      enum: ["na", "eu", "sea", "sa", "mea", "global"],
    },
    country: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    isLookingForTeam: { type: Boolean, default: true },
    socialLinks: {
      discord: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    playerStats: {
      level: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
      xpToNext: { type: Number, default: 1000 },
      winRate: { type: Number, default: 0 },
      kdRatio: { type: Number, default: 0 },
      matchesPlayed: { type: Number, default: 0 },
      favoriteGame: { type: String, default: "" },
      highestRank: { type: String, default: "" },
      gameSpecificStats: [
        {
          game: { type: String },
          rank: { type: String },
          rating: { type: Number },
          hoursPlayed: { type: Number },
          winRate: { type: Number },
          matches: { type: Number },
          kda: { type: Number },
          tier: { type: String },
        }
      ]
    },
    achievements: [
      {
        title: { type: String },
        description: { type: String },
        rarity: { type: String, enum: ["common", "rare", "epic", "legendary"] },
        unlockedAt: { type: Date },
        progress: { type: Number },
        maxProgress: { type: Number },
      }
    ],
    equipment: [
      {
        label: { type: String },
        value: { type: String },
        sub: { type: String },
        category: { type: String },
      }
    ]
  },
  { timestamps: true }
);

// Indexes for performance on queries
userSchema.index({ orgId: 1 });
userSchema.index({ teamId: 1 });
userSchema.index({ eventHistory: 1 });
userSchema.index({ isDeleted: 1 });
// Text index for optimized username search (case-insensitive)
userSchema.index({ username: "text" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error("Password is not set for this user.");
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
