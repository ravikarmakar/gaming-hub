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

// const organizerSchema = new mongoose.Schema(
//   {
//     tag: {
//       type: String,
//       required: true,
//       enum: ["gaming", "education", "sports", "tech", "other"], // customize per your domain
//       index: true,
//     },
//     // For scalability: track some usage metrics (optional, can be incremented on usage)
//     tournamentsCreatedCount: { type: Number, default: 0, index: true },
//     activeMembersCount: { type: Number, default: 0, index: true },

//     // Metadata for audit trail (optional, helpful for enterprise scale)
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// // Index compound for frequent queries (example: find verified and not deleted organizers by tag)
// organizerSchema.index({ tag: 1, isVerified: 1, isDeleted: 1 });

// /**
//  * Middleware to prevent saving deleted documents accidentally
//  */
// organizerSchema.pre("save", function (next) {
//   if (this.isDeleted && this.isModified()) {
//     // You can add custom logic here, eg. audit logs or validation
//   }
//   next();
// });

// /**
//  * Static method for soft delete instead of hard delete
//  */
// organizerSchema.statics.softDeleteById = async function (id) {
//   return this.findByIdAndUpdate(id, { isDeleted: true });
// };

// /**
//  * Query helper to ignore soft deleted docs by default
//  */
// organizerSchema.query.notDeleted = function () {
//   return this.where({ isDeleted: false });
// };
