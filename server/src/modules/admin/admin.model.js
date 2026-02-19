import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        targetType: {
            type: String,
            required: true,
            enum: ["User", "Team", "Organizer", "Match", "Event", "Platform"],
            index: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            index: true,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        },
        ipAddress: {
            type: String,
            required: false,
        },
        userAgent: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

// Index for recent activity queries (descending order)
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
