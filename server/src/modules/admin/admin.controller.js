import * as adminService from "./admin.service.js";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";

export const getDashboardStats = TryCatchHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
});

export const getRecentActivity = TryCatchHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const activity = await adminService.getRecentActivity(limit);
    res.status(200).json({ success: true, data: activity });
});

export const getEntities = TryCatchHandler(async (req, res) => {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const filter = req.query.filter || "all";

    const result = await adminService.getEntities(type, page, limit, search, filter, req.user.userId);
    res.status(200).json({ success: true, ...result });
});

export const updateStatus = TryCatchHandler(async (req, res) => {
    const { type, id } = req.params;
    const updates = req.body; // e.g., { isBlocked: true, isVerified: false }

    const entity = await adminService.updateEntityStatus(
        req.user.userId,
        type,
        id,
        updates,
        { ip: req.ip, userAgent: req.headers["user-agent"] }
    );

    res.status(200).json({
        success: true,
        message: `${type} status updated successfully`,
        data: entity
    });
});
