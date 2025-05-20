import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import roleSchema from "./role.model.js";

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
      index: true,
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
    avatar: { type: String, default: null },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
    orgId: { type: mongoose.Types.ObjectId, ref: "Organizer", default: null },
    teamId: { type: mongoose.Types.ObjectId, ref: "Team", default: null },
    canCreateOrg: { type: Boolean, default: false },
    role: {
      type: [roleSchema],
      default: [
        {
          scope: "platform",
          role: "platform:user",
        },
      ],
    },
  },
  { timestamps: true }
);

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
