import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    imageUrl: { type: String, default: null },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      minlength: 3,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        "Please enter valid email",
      ],
    },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    isVerified: { type: Boolean, default: false, index: true },
    tag: { type: String, required: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

organizerSchema.index({ tag: 1, isVerified: 1, isDeleted: 1 });

const Organizer =
  mongoose.models.Organizer || mongoose.model("Organizer", organizerSchema);

export default Organizer;
