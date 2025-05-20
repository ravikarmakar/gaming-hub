import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: { type: String, default: null },
    name: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    tag: { type: String, required: true },
  },
  { timestamps: true }
);

const Organizer =
  mongoose.models.Organizer || mongoose.model("Organizer", organizerSchema);

export default Organizer;
