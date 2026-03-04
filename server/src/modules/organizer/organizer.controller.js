import Organizer from "../organizer/organizer.model.js";
import User from "../user/user.model.js";
import Event from "../event/event.model.js";
import mongoose from "mongoose";
import { TryCatchHandler } from "../../shared/middleware/error.middleware.js";
import { uploadOnImageKit, deleteFromImageKit } from "../../shared/services/imagekit.service.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { redis } from "../../shared/config/redis.js";
import { generateTokens, storeRefreshToken, setCookies } from "../auth/auth.service.js";
import JoinRequest from "../join-request/join-request.model.js";
import { createNotification } from "../notification/notification.controller.js";
import { logger } from "../../shared/utils/logger.js";
import fs from "fs";
import Invitation from "../invitation/invitation.model.js";
import { withOptionalTransaction } from "../../shared/utils/withOptionalTransaction.js";

import * as organizerService from "./organizer.service.js";
import organizerEvents, { ORG_EVENT_TYPES, initOrganizerListeners } from "./organizer.events.js";

// Initialize external async event listeners (Notification dispatching, cache dropping)
// This mirrors the architecture of the Team module and ensures side effects never block the API.
initOrganizerListeners();

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const createOrg = TryCatchHandler(async (req, res, next) => {
  const { userId } = req.user;
  const cacheKey = `user_profile:${userId}`;
  const { name, region, description, tag } = req.body;

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  if (!user.canCreateOrg || !user.isAccountVerified || user.orgId)
    return next(
      new CustomError("You are not allowed to create an organization", 403)
    );

  // Check for duplicate name or tag pre-emptively (Case Insensitive)
  const existingOrg = await Organizer.findOne({
    isDeleted: false,
    $or: [
      { name: { $regex: `^${escapeRegex(name)}$`, $options: "i" } },
      { tag: tag?.toUpperCase() }
    ]
  });

  if (existingOrg) {
    if (existingOrg.name.toLowerCase() === name.toLowerCase())
      return next(new CustomError("Organization name is already in use", 400));
    if (existingOrg.tag === tag?.toUpperCase())
      return next(new CustomError("Organization tag is already in use", 400));
  }

  // Generate ImageKit uploads first (outside transaction)
  let imageUrl = null;
  let imageFileId = null;

  if (req.file) {
    try {
      const uploadRes = await uploadOnImageKit(
        req.file.path,
        `org-logo-${Date.now()}`,
        "/organizers/logos"
      );
      if (uploadRes) {
        imageUrl = uploadRes.url;
        imageFileId = uploadRes.fileId;
      }
    } finally {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) { logger.warn("Failed to delete local file:", e); }
      }
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [newOrg] = await Organizer.create([{
      ownerId: user._id,
      imageUrl,
      imageFileId,
      name,
      region,
      description,
      tag: tag?.toUpperCase(),
    }], { session });

    await User.findByIdAndUpdate(userId, {
      $push: {
        roles: {
          scope: Scopes.ORG,
          role: Roles.ORG.OWNER,
          scopeId: newOrg._id,
          scopeModel: "Organizer",
        }
      },
      canCreateOrg: false,
      orgId: newOrg._id
    }, { session });

    await session.commitTransaction();

    // After commit, we update session tokens/cookies locally as these are req-res specific
    const updatedUser = await User.findById(userId); // Fetch fresh user for tokens
    const { accessToken, refreshToken } = generateTokens(updatedUser._id, updatedUser.roles);
    await storeRefreshToken(updatedUser._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    // Emit event asynchronously instead of blocking the thread to drop Redis caches manually
    organizerEvents.emit(ORG_EVENT_TYPES.ORG_CREATED, { org: newOrg, ownerId: userId });
    organizerEvents.emit(ORG_EVENT_TYPES.MEMBER_JOINED, { org: newOrg, memberIds: [userId] });

    res
      .status(201)
      .json({ success: true, message: "Org created successfully", data: newOrg });

  } catch (error) {
    await session.abortTransaction();

    // 🧹 Cleanup orphaned image if DB save fails
    if (imageFileId) {
      deleteFromImageKit(imageFileId).catch(cleanupError =>
        logger.error(`Failed to cleanup orphaned image ${imageFileId}:`, cleanupError)
      );
    }
    throw error;
  } finally {
    session.endSession();
  }
});

export const getOrgDetails = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.params;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return next(new CustomError("Invalid Organization ID format", 400));
  }

  const organization = await Organizer.findOne({ _id: orgId, isDeleted: false }).populate(
    "ownerId",
    "username email"
  );

  if (!organization) {
    return next(new CustomError("Organization not found", 404));
  }

  // Check if current user has a pending join request
  let hasPendingRequest = false;
  if (req.user?.userId) {
    const JoinRequest = (await import("../join-request/join-request.model.js")).default;
    const pendingRequest = await JoinRequest.findOne({
      requester: req.user.userId,
      target: orgId,
      status: "pending"
    });
    hasPendingRequest = !!pendingRequest;
  }

  // Search & Pagination for members
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const matchStage = {
    orgId: new mongoose.Types.ObjectId(orgId),
  };

  if (search) {
    matchStage.username = { $regex: escapeRegex(search), $options: "i" };
  }

  const membersResult = await User.aggregate([
    {
      $match: matchStage,
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          {
            $addFields: {
              orgRole: {
                $first: {
                  $filter: {
                    input: "$roles",
                    as: "r",
                    cond: { $eq: ["$$r.scope", "org"] },
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
              avatar: 1,
              role: "$orgRole.role",
            },
          },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
  ]);

  const members = membersResult[0].data;
  const totalMembers = membersResult[0].metadata[0]?.total || 0;

  const orgWithMembers = organization.toObject();
  orgWithMembers.members = members;
  orgWithMembers.hasPendingRequest = hasPendingRequest;

  res.status(200).json({
    success: true,
    message: "Organization details fetched successfully",
    data: orgWithMembers,
    pagination: {
      total: totalMembers,
      page,
      limit,
      pages: Math.ceil(totalMembers / limit),
    },
  });
});

export const updateOrg = TryCatchHandler(async (req, res, next) => {
  // Use orgId from context (via middleware) or params
  const orgId = req.params.orgId || req.orgContext?.orgId;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return next(new CustomError("Invalid Organization ID format", 400));
  }

  const { name, region, description, tag, isHiring, socialLinks } = req.body;
  const files = req.files;

  // Find existing organization (ensure it's not deleted)
  const org = await Organizer.findOne({ _id: orgId, isDeleted: false });
  if (!org) {
    return next(new CustomError("Organization not found", 404));
  }

  // Check unique constraints if fields are changing
  if (name || tag) {
    const query = { _id: { $ne: orgId }, isDeleted: false, $or: [] };
    if (name) query.$or.push({ name: { $regex: `^${escapeRegex(name)}$`, $options: "i" } });
    if (tag) query.$or.push({ tag: tag.toUpperCase() });

    if (query.$or.length > 0) {
      const duplicate = await Organizer.findOne(query);
      if (duplicate) {
        if (name && duplicate.name.toLowerCase() === name.toLowerCase()) return next(new CustomError("Organization name is already in use", 400));
        if (tag && duplicate.tag === tag.toUpperCase()) return next(new CustomError("Organization tag is already in use", 400));
      }
    }
  }

  // Handle Image Uploads in Parallel
  const uploadPromises = [];
  const newlyUploadedFileIds = []; // Track new uploads to clean up if DB save fails
  let newImageUrl, newImageFileId, newBannerUrl, newBannerFileId;

  if (files?.image?.[0]) {
    uploadPromises.push(
      (async () => {
        const uploadRes = await uploadOnImageKit(
          files.image[0].path,
          `org-logo-${org._id}-${Date.now()}`,
          "/organizers/logos"
        );
        if (uploadRes) {
          newlyUploadedFileIds.push(uploadRes.fileId);
          newImageUrl = uploadRes.url;
          newImageFileId = uploadRes.fileId;
        }
      })()
    );
  }

  if (files?.banner?.[0]) {
    uploadPromises.push(
      (async () => {
        const uploadRes = await uploadOnImageKit(
          files.banner[0].path,
          `org-banner-${org._id}-${Date.now()}`,
          "/organizers/banners"
        );
        if (uploadRes) {
          newlyUploadedFileIds.push(uploadRes.fileId);
          newBannerUrl = uploadRes.url;
          newBannerFileId = uploadRes.fileId;
        }
      })()
    );
  }

  try {
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    await withOptionalTransaction(async (session) => {
      // Apply updates
      if (newImageUrl) {
        org.imageUrl = newImageUrl;
        org.imageFileId = newImageFileId;
      }
      if (newBannerUrl) {
        org.bannerUrl = newBannerUrl;
        org.bannerFileId = newBannerFileId;
      }

      if (typeof name !== 'undefined') org.name = name;
      if (typeof region !== 'undefined') org.region = region;
      if (typeof description !== 'undefined') org.description = description;
      if (typeof tag !== 'undefined') org.tag = tag;
      if (typeof isHiring !== 'undefined') org.isHiring = isHiring === 'true' || isHiring === true;

      if (socialLinks) {
        try {
          const parsedSocial = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
          org.socialLinks = { ...org.socialLinks, ...parsedSocial };
        } catch (err) {
          logger.warn(`Invalid JSON format for socialLinks: ${socialLinks}`);
        }
      }

      await org.save({ session });
    });

    // Success! Now delete old images
    // Emit async update event
    organizerEvents.emit(ORG_EVENT_TYPES.ORG_UPDATED, { orgId: org._id });

  } catch (error) {
    // Rollback: Delete newly uploaded images if save/logic fails
    if (newlyUploadedFileIds.length > 0) {
      logger.info("Rolling back orphaned org images due to update failure...");
      // Use Promise.allSettled to ensure all cleanup attempts run
      Promise.allSettled(newlyUploadedFileIds.map(fid => deleteFromImageKit(fid)));
    }
    throw error;
  } finally {
    // Cleanup local files in all cases
    const allFiles = [...(files?.image || []), ...(files?.banner || [])];
    allFiles.forEach(f => {
      if (f.path && fs.existsSync(f.path)) {
        try { fs.unlinkSync(f.path); } catch (e) { }
      }
    });
  }

  res.status(200).json({
    success: true,
    message: "Organization updated successfully",
    data: org,
  });
});

export const addStaff = TryCatchHandler(async (req, res, next) => {
  const { staff } = req.body;
  // Use orgId from context or params. Middleware `guardOrgAccess` should have validated membership.
  const orgId = req.params.orgId || req.orgContext?.orgId || req.body.orgId;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return next(new CustomError("Invalid Organization ID format", 400));
  }

  if (!staff || !Array.isArray(staff) || staff.length === 0) {
    return next(new CustomError("Staff list is required and must be a non-empty array", 400));
  }

  // Basic validation that the org exists
  const org = await Organizer.findOne({ _id: orgId, isDeleted: false });
  if (!org) {
    return next(new CustomError("Organization not found", 404));
  }

  // 1. Fetch all prospective users in one go
  const users = await User.find({ _id: { $in: staff } });
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const results = [];
  const bulkOps = [];

  // 2. Process each requested staff member in memory
  staff.forEach(userId => {
    const targetUser = userMap.get(userId.toString());

    if (!targetUser) {
      results.push({ userId, success: false, message: "User not found" });
      return;
    }

    if (!targetUser.isAccountVerified || targetUser.orgId) {
      results.push({
        userId,
        success: false,
        message: "User not verified or already in an organization",
      });
      return;
    }

    const alreadyInOrg = targetUser.roles.some(
      (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
    );
    if (alreadyInOrg) {
      results.push({
        userId,
        success: false,
        message: "User already has a role in this organization",
      });
      return;
    }

    // Prepare operation
    bulkOps.push({
      updateOne: {
        filter: { _id: userId },
        update: {
          $set: { orgId: orgId },
          $push: {
            roles: {
              scope: Scopes.ORG,
              role: Roles.ORG.STAFF,
              scopeId: orgId,
              scopeModel: "Organizer",
            },
          }
        }
      }
    });

    results.push({ userId, success: true });
  });

  // 3. Execute Bulk Write
  if (bulkOps.length > 0) {
    await User.bulkWrite(bulkOps);

    const updatedUserIds = results.filter(r => r.success).map(r => r.userId);
    if (updatedUserIds.length > 0) {
      // Emit async event for Staff Joining instead of blocking UI thread for Redis pipeline
      organizerEvents.emit(ORG_EVENT_TYPES.MEMBER_JOINED, {
        org: { _id: orgId, ownerId: org.ownerId, name: org.name },
        memberIds: updatedUserIds,
        handledById: req.user.userId
      });
    }
  }

  res
    .status(200)
    .json({ success: true, message: "Members added successfully", data: results });
});

export const updateStaffRole = TryCatchHandler(async (req, res, next) => {
  const { userId, newRole } = req.body;
  const orgId = req.params.orgId || req.orgContext?.orgId || req.body.orgId;

  if (!orgId) return next(new CustomError("Organization ID is required", 400));
  if (!mongoose.Types.ObjectId.isValid(orgId)) return next(new CustomError("Invalid Organization ID format", 400));

  // Validate newRole to prevent privilege escalation
  const allowedRoles = [Roles.ORG.CO_OWNER, Roles.ORG.MANAGER, Roles.ORG.STAFF];
  if (!allowedRoles.includes(newRole)) {
    return next(new CustomError("Invalid role or insufficient permissions to assign this role", 400));
  }

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  // Protection: Ensure we are not modifying the Organization Owner's role via this endpoint
  // Need to fetch Org to check ownerId
  const org = await Organizer.findById(orgId);
  if (!org) return next(new CustomError("Organization not found", 404));

  if (user._id.toString() === org.ownerId.toString()) {
    return next(new CustomError("Cannot modify the role of the Organization Owner", 403));
  }

  const orgRoleIndex = user.roles.findIndex(
    (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
  );

  if (orgRoleIndex === -1)
    return next(
      new CustomError("User does not belong to this organization", 403)
    );

  user.roles[orgRoleIndex].role = newRole;
  await user.save();

  // Async Event Emitted
  organizerEvents.emit(ORG_EVENT_TYPES.ROLE_UPDATED, { org, memberId: userId, newRole });

  // Fetch updated organization with members for the response
  const updatedOrg = await Organizer.findById(orgId);
  const members = await User.find({
    "roles.scopeId": orgId
  }).select("username email roles avatar joinedDate");

  const formattedMembers = members.map(m => {
    const mObj = m.toObject();
    const roleRecord = m.roles.find(r => r.scopeId?.toString() === orgId.toString());
    return { ...mObj, role: roleRecord ? roleRecord.role : "org:staff" };
  });

  res.status(200).json({
    success: true,
    message: "Staff role updated successfully",
    data: { ...updatedOrg.toObject(), members: formattedMembers }
  });
});

export const removeStaff = TryCatchHandler(async (req, res, next) => {
  const userId = req.params.id; // Staff ID to remove
  const orgId = req.params.orgId || req.orgContext?.orgId || req.body.orgId;

  if (!orgId) return next(new CustomError("Organization ID is required", 400));
  if (!mongoose.Types.ObjectId.isValid(orgId)) return next(new CustomError("Invalid Organization ID format", 400));

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  const hasOrgRole = user.roles.some(
    (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
  );

  if (!hasOrgRole)
    return next(new CustomError("User is not part of this organization", 403));

  // Protection against removing the organization owner
  const org = await Organizer.findById(orgId);
  if (org && user._id.toString() === org.ownerId.toString()) {
    return next(new CustomError("Cannot remove organization owner", 403));
  }

  // Remove the org role
  user.roles = user.roles.filter(
    (r) => !(r.scope === "org" && r.scopeId?.toString() === orgId.toString())
  );

  // Clear the user's orgId if it matches
  if (user.orgId?.toString() === orgId.toString()) {
    user.orgId = null;
  }

  await user.save();

  // Async Event Emitted (Handles Cache dropping and notification)
  organizerEvents.emit(ORG_EVENT_TYPES.MEMBER_REMOVED, { org, memberId: userId });

  // Fetch updated organization with members for the response
  const updatedOrg = await Organizer.findById(orgId);
  const members = await User.find({
    "roles.scopeId": orgId
  }).select("username email roles avatar joinedDate");

  const formattedMembers = members.map(m => {
    const mObj = m.toObject();
    const roleRecord = m.roles.find(r => r.scopeId?.toString() === orgId.toString());
    return { ...mObj, role: roleRecord ? roleRecord.role : "org:staff" };
  });

  res.status(200).json({
    success: true,
    message: "Staff removed from organization successfully",
    data: { ...updatedOrg.toObject(), members: formattedMembers }
  });
});

export const leaveOrg = TryCatchHandler(async (req, res, next) => {
  const orgId = req.params.orgId || req.orgContext?.orgId;
  const { userId } = req.user;

  if (!orgId) return next(new CustomError("Organization ID is required", 400));

  const org = await Organizer.findById(orgId);
  if (!org) return next(new CustomError("Organization not found", 404));

  // Protection against owner leaving
  if (org.ownerId.toString() === userId.toString()) {
    return next(new CustomError("Owners cannot leave. Please transfer ownership or delete the organization.", 403));
  }

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  const hasOrgRole = user.roles.some(
    (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
  );

  if (!hasOrgRole)
    return next(new CustomError("You are not part of this organization", 403));

  // Remove the org role
  user.roles = user.roles.filter(
    (r) => !(r.scope === "org" && r.scopeId?.toString() === orgId.toString())
  );

  // Clear the user's orgId if it matches
  if (user.orgId?.toString() === orgId.toString()) {
    user.orgId = null;
  }

  await user.save();

  // Async event
  organizerEvents.emit(ORG_EVENT_TYPES.MEMBER_LEFT, { org, memberId: userId });

  res.status(200).json({
    success: true,
    message: "You have left the organization successfully"
  });
});

export const deleteOrg = TryCatchHandler(async (req, res, next) => {
  const orgId = req.params.orgId || req.orgContext?.orgId;
  const { userId } = req.user;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return next(new CustomError("Invalid Organization ID format", 400));
  }

  const org = await Organizer.findOne({ _id: orgId, isDeleted: false });
  if (!org) {
    return next(new CustomError("Organization not found", 404));
  }

  // Double check owner (middleware should have covered this, but redundancy is safe)
  const isAuthorized =
    req.orgContext?.isSuperAdmin ||
    req.orgContext?.role === Roles.ORG.OWNER ||
    req.orgContext?.role === Roles.ORG.CO_OWNER ||
    org.ownerId.toString() === userId.toString();

  if (!isAuthorized) {
    return next(
      new CustomError("Only the organization owner or co-owner can delete it", 403)
    );
  }

  await withOptionalTransaction(async (session) => {
    // Soft Delete
    org.isDeleted = true;
    org.deletedAt = new Date();
    await org.save({ session });

    // Remove org-related roles and unset orgId from all users
    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    await User.updateMany(
      {
        $or: [
          { orgId: orgObjectId },
          { "roles.scopeId": orgObjectId }
        ]
      },
      {
        $pull: { roles: { scopeId: orgObjectId } },
        $set: { orgId: null }
      },
      { session }
    );

    // Update Owner's permissions to NOT allow creating another org
    // because permission can only be given by superadmin
    const ownerId = org.ownerId;
    if (ownerId) {
      await User.findByIdAndUpdate(ownerId, { canCreateOrg: false }, { session });
    }
  });

  // Cleanup ImageKit assets AFTER commit
  if (org.imageFileId) {
    deleteFromImageKit(org.imageFileId).catch(err => logger.error(`Failed to delete org logo ${org.imageFileId}`, err));
  }
  if (org.bannerFileId) {
    deleteFromImageKit(org.bannerFileId).catch(err => logger.error(`Failed to delete org banner ${org.bannerFileId}`, err));
  }

  // Emit event asynchronously to drop the necessary caches across the application
  organizerEvents.emit(ORG_EVENT_TYPES.ORG_DELETED, { orgId: org._id, ownerId: org.ownerId });

  res.status(200).json({
    success: true,
    message: "Organization deleted successfully",
  });
});

export const getDashboardStats = TryCatchHandler(async (req, res, next) => {
  // Priority: 1. URL Param (if mounted with :orgId), 2. Query Param, 3. Context (if guard middleware used), 4. User's active Org
  const orgId =
    req.params.orgId ||
    req.query.orgId ||
    req.orgContext?.orgId ||
    req.user.cachedProfile?.orgId ||
    req.user.orgId; // Fallback if orgId was manually attached elsewhere

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return next(new CustomError("Invalid Organization ID format", 400));
  }

  const organization = await Organizer.findOne({ _id: orgId, isDeleted: false });
  if (!organization) {
    return next(new CustomError("Organization not found", 404));
  }

  // Fetch metrics in parallel
  const [
    totalEvents,
    upcomingEvents,
    totalParticipantsData,
    totalPrizeMoneyData,
    recentEvents
  ] = await Promise.all([
    Event.countDocuments({ orgId, isDeleted: { $ne: true } }),
    Event.countDocuments({
      orgId,
      status: { $in: ["registration-open", "registration-closed"] },
      isDeleted: { $ne: true },
    }),
    Event.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId), isDeleted: { $ne: true } } }, // Fix: Convert to ObjectId
      { $group: { _id: null, total: { $sum: "$joinedSlots" } } },
    ]),
    Event.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId), isDeleted: { $ne: true } } }, // Fix: Convert to ObjectId
      { $group: { _id: null, total: { $sum: "$prizePool" } } },
    ]),
    Event.find({ orgId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
  ]);

  const totalParticipants = totalParticipantsData[0]?.total || 0;
  const totalPrizeMoney = totalPrizeMoneyData[0]?.total || 0;

  const recentActivities = [
    { type: "System", description: `Welcome to ${organization.name} dashboard`, time: "Just now" },
  ];

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalEvents,
        upcomingEvents,
        totalParticipants,
        totalPrizeMoney,
      },
      recentEvents,
      recentActivities,
      org: organization,
    }
  });
});

// Transfer Ownership
export const transferOwnership = TryCatchHandler(async (req, res, next) => {
  const { newOwnerId } = req.body;
  const { userId } = req.user;
  const orgId = req.params.orgId || req.orgContext?.orgId;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return next(new CustomError("Invalid Organization ID format", 400));
  }

  const org = await Organizer.findOne({ _id: orgId, isDeleted: false });
  if (!org) {
    return next(new CustomError("Organization not found", 404));
  }

  // Verify current user is the owner or co-owner (Double check)
  const isAuthorized =
    req.orgContext?.isSuperAdmin ||
    req.orgContext?.role === Roles.ORG.OWNER ||
    req.orgContext?.role === Roles.ORG.CO_OWNER ||
    org.ownerId.toString() === userId.toString();

  if (!isAuthorized) {
    return next(new CustomError("Only the organization owner or co-owner can transfer ownership", 403));
  }

  // Find the new owner
  const newOwner = await User.findById(newOwnerId);
  if (!newOwner) {
    return next(new CustomError("New owner not found", 404));
  }

  // Check if new owner is part of the org
  const newOwnerOrgRoleIndex = newOwner.roles.findIndex(
    (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
  );

  if (newOwnerOrgRoleIndex === -1) {
    return next(new CustomError("User must be a member of the organization to become owner", 400));
  }

  // Update Org Owner
  org.ownerId = newOwnerId;
  await org.save();

  // Demote current owner to Co-owner
  const currentUser = await User.findById(userId);

  if (currentUser) {
    const currentOwnerRoleIndex = currentUser.roles.findIndex(
      (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
    );

    if (currentOwnerRoleIndex !== -1) {
      currentUser.roles[currentOwnerRoleIndex].role = Roles.ORG.CO_OWNER;
      // Set to false, permission can only be given by superadmin 
      currentUser.canCreateOrg = false;
      await currentUser.save();
    }
  }

  // Promote new owner
  newOwner.roles[newOwnerOrgRoleIndex].role = Roles.ORG.OWNER;
  // If they had another org, this might conflict if logic enforces single org ownership.
  // Assuming strict 1-org-creation policy, we set canCreateOrg false.
  newOwner.canCreateOrg = false;
  // Set orgId main pointer
  newOwner.orgId = org._id;
  await newOwner.save();

  // Async Event
  organizerEvents.emit(ORG_EVENT_TYPES.OWNER_TRANSFERRED, { org, newOwnerId, oldOwnerId: userId });

  res.status(200).json({
    success: true,
    message: "Ownership transferred successfully",
  });
});

// @desc    Get all organizers (public/platform)
// @route   GET /api/v1/organizers
export const getOrganizers = TryCatchHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search = "" } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const query = { isDeleted: false };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const [organizers, total] = await Promise.all([
    Organizer.find(query)
      .select("name imageUrl tag isHiring description memberCount")
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Organizer.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    message: "Organizers fetched successfully",
    data: organizers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});
