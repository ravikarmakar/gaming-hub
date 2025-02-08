import mongoose from "mongoose";

const prizeSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    total: {
      type: String,
      required: true,
    },
    distribution: [
      {
        position: {
          type: String,
          required: true,
        },
        prize: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Prize = mongoose.model("Prize", prizeSchema);

export default Prize;
