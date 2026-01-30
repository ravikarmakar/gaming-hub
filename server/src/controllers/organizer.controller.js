import Organizer from "../models/organizer.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { uploadOnImageKit, deleteFromImageKit } from "../services/imagekit.service.js";
import { CustomError } from "../utils/CustomError.js";
import { Roles, Scopes } from "../constants/roles.js";
import { redis } from "../config/redis.js";
import { generateTokens, storeRefreshToken, setCookies } from "../services/auth.service.js";
import { findUserById } from "../services/user.service.js";
import JoinRequest from "../models/join-request.model.js";
import { createNotification } from "./notification.controller.js";

export const createOrg = TryCatchHandler(async (req, res, next) => {
  const { userId } = req.user;
  const cacheKey = `user_profile:${userId}`;
  const { name, email, description, tag } = req.body;

  const imageFile = req.file;
  // upload image here
  let imageUrl = null
  let imageFileId = null;

  if (imageFile) {
    const uploadRes = await uploadOnImageKit(
      imageFile.path,
      `org-logo-${Date.now()}`,
      "/organizers/logos"
    );
    if (uploadRes) {
      imageUrl = uploadRes.url;
      imageFileId = uploadRes.fileId;
    }
  }

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  if (!user.canCreateOrg || !user.isAccountVerified || user.orgId)
    return next(
      new CustomError("You are not allowed to create an organization", 403)
    );

  // Check for duplicate name, email, or tag pre-emptively
  // Only check against ACTIVE organizations (not deleted ones)
  const existingOrg = await Organizer.findOne({
    $and: [
      { isDeleted: false },
      {
        $or: [
          { name: name },
          { email: email },
          { tag: tag?.toUpperCase() }
        ]
      }
    ]
  });

  if (existingOrg) {
    if (existingOrg.name.toLowerCase() === name.toLowerCase())
      return next(new CustomError("Organization name is already in use", 400));
    if (existingOrg.email.toLowerCase() === email.toLowerCase())
      return next(new CustomError("Organization email is already in use", 400));
    if (existingOrg.tag === tag?.toUpperCase())
      return next(new CustomError("Organization tag is already in use", 400));
  }

  const newOrg = await Organizer.create({
    ownerId: user._id,
    imageUrl,
    imageFileId,
    name,
    email,
    description,
    tag: tag?.toUpperCase(),
  });

  user.roles.push({
    scope: Scopes.ORG,
    role: Roles.ORG.OWNER,
    scopeId: newOrg._id,
    scopeModel: "Organizer",
  });
  user.canCreateOrg = false;
  user.orgId = newOrg._id;

  await user.save();

  // this will update the accessToken and refresh token jwt payloads
  const { accessToken, refreshToken } = generateTokens(user._id, user.roles);

  // store refresh token in redis
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  // Invalidate redis cache
  await redis.del(cacheKey);

  res
    .status(201)
    .json({ success: true, message: "Org created successfully", data: newOrg });
});

export const getOrgDetails = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.params;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  const organization = await Organizer.findOne({ _id: orgId, isDeleted: false }).populate(
    "ownerId",
    "username email"
  );

  if (!organization) {
    return next(new CustomError("Organization not found", 404));
  }

  const members = await User.aggregate([
    {
      $match: {
        orgId: organization._id,
      },
    },
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
        role: "$orgRole.role", // only the role string
      },
    },
  ]);

  const orgWithMembers = organization.toObject();
  orgWithMembers.members = members;

  res.status(200).json({
    success: true,
    message: "Organization details fetched successfully",
    data: orgWithMembers,
  });
});

export const updateOrg = TryCatchHandler(async (req, res, next) => {
  // Use orgId from context (via middleware) or params
  const orgId = req.params.orgId || req.orgContext?.orgId;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  const { name, email, description, tag, isHiring, socialLinks } = req.body;
  const files = req.files;

  // Find existing organization (ensure it's not deleted)
  const org = await Organizer.findOne({ _id: orgId, isDeleted: false });
  if (!org) {
    return next(new CustomError("Organization not found", 404));
  }

  // Handle Profile Image Upload
  if (files?.image?.[0]) {
    const uploadRes = await uploadOnImageKit(
      files.image[0].path,
      `org-logo-${org._id}-${Date.now()}`,
      "/organizers/logos"
    );
    if (uploadRes) {
      if (org.imageFileId) {
        await deleteFromImageKit(org.imageFileId);
      }
      org.imageUrl = uploadRes.url;
      org.imageFileId = uploadRes.fileId;
    }
  }

  // Handle Banner Image Upload
  if (files?.banner?.[0]) {
    const uploadRes = await uploadOnImageKit(
      files.banner[0].path,
      `org-banner-${org._id}-${Date.now()}`,
      "/organizers/banners"
    );
    if (uploadRes) {
      if (org.bannerFileId) {
        await deleteFromImageKit(org.bannerFileId);
      }
      org.bannerUrl = uploadRes.url;
      org.bannerFileId = uploadRes.fileId;
    }
  }

  // Update fields if provided
  if (typeof name !== 'undefined') org.name = name;
  if (typeof email !== 'undefined') org.email = email;
  if (typeof description !== 'undefined') org.description = description;
  if (typeof tag !== 'undefined') org.tag = tag;

  if (typeof isHiring !== 'undefined') {
    org.isHiring = isHiring === 'true' || isHiring === true;
  }

  if (socialLinks) {
    try {
      const parsedSocial = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      org.socialLinks = {
        ...org.socialLinks,
        ...parsedSocial
      };
    } catch (e) {
      console.error("Error parsing socialLinks:", e);
    }
  }

  await org.save();

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

  if (!Array.isArray(staff) || staff.length === 0) {
    return next(new CustomError("Staff array is required", 400));
  }

  // Basic validation that the org exists
  const org = await Organizer.findOne({ _id: orgId, isDeleted: false });
  if (!org) {
    return next(new CustomError("Organization not found", 404));
  }

  let results = await Promise.all(
    staff.map(async (userId) => {
      const targetUser = await findUserById(userId);

      if (!targetUser) {
        return { userId, success: false, message: "User not found" };
      }
      if (!targetUser.isAccountVerified || targetUser.orgId) {
        return {
          userId,
          success: false,
          message: "User not verified or already in an organization",
        };
      }
      const alreadyInOrg = targetUser.roles.some(
        (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
      );
      if (alreadyInOrg) {
        return {
          userId,
          success: false,
          message: "User already has a role in this organization",
        };
      }

      targetUser.roles.push({
        scope: Scopes.ORG,
        role: Roles.ORG.STAFF,
        scopeId: orgId,
        scopeModel: "Organizer",
      });
      targetUser.orgId = orgId;
      await targetUser.save();
      await redis.del(`user_profile:${userId}`);

      return { userId, success: true };
    })
  );

  res
    .status(200)
    .json({ success: true, message: "Members added successfully", data: results });
});

export const updateStaffRole = TryCatchHandler(async (req, res, next) => {
  const { userId, newRole } = req.body;
  const orgId = req.params.orgId || req.orgContext?.orgId || req.body.orgId;

  if (!orgId) return next(new CustomError("Organization ID is required", 400));
  if (!userId || !newRole) return next(new CustomError("userId and newRole are required", 400));

  const validRoles = Object.values(Roles.ORG);
  if (!validRoles.includes(newRole)) {
    return next(new CustomError("Invalid role specified", 400));
  }

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  const orgRoleIndex = user.roles.findIndex(
    (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
  );

  if (orgRoleIndex === -1)
    return next(
      new CustomError("User does not belong to this organization", 403)
    );

  user.roles[orgRoleIndex].role = newRole;
  await user.save();
  await redis.del(`user_profile:${userId}`);

  // Fetch updated organization with members for the response
  const updatedOrg = await Organizer.findById(orgId);
  const members = await User.find({
    "roles.scopeId": orgId
  }).select("username email roles avatar joinedDate");

  const formattedMembers = members.map(m => {
    const mObj = m.toObject();
    const roleRecord = m.roles.find(r => r.scopeId?.toString() === orgId.toString());
    return { ...mObj, role: roleRecord ? roleRecord.role : "org:player" };
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
  if (!userId) return next(new CustomError("userId is required to remove staff", 400));

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  const hasOrgRole = user.roles.some(
    (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
  );

  if (!hasOrgRole)
    return next(new CustomError("User is not part of this organization", 403));

  // Remove the org role
  user.roles = user.roles.filter(
    (r) => !(r.scope === "org" && r.scopeId?.toString() === orgId.toString())
  );

  // Clear the user's orgId if it matches
  if (user.orgId?.toString() === orgId.toString()) {
    user.orgId = null;
  }

  await user.save();
  await redis.del(`user_profile:${userId}`);

  // Fetch updated organization with members for the response
  const updatedOrg = await Organizer.findById(orgId);
  const members = await User.find({
    "roles.scopeId": orgId
  }).select("username email roles avatar joinedDate");

  const formattedMembers = members.map(m => {
    const mObj = m.toObject();
    const roleRecord = m.roles.find(r => r.scopeId?.toString() === orgId.toString());
    return { ...mObj, role: roleRecord ? roleRecord.role : "org:player" };
  });

  res.status(200).json({
    success: true,
    message: "Staff removed from organization successfully",
    data: { ...updatedOrg.toObject(), members: formattedMembers }
  });
});

export const deleteOrg = TryCatchHandler(async (req, res, next) => {
  const orgId = req.params.orgId || req.orgContext?.orgId;
  const { userId } = req.user;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
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

  // Soft Delete
  org.isDeleted = true;
  org.deletedAt = new Date();

  // NOTE: We do NOT rely on standard unique indexes since we want to allow reuse.
  // The 'partialFilterExpression' in the model handles this for Mongo unique indexes.

  await org.save();

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
    }
  );

  // Update Owner's permissions to allow creating another org
  const owner = await User.findById(userId);
  if (owner) {
    // Clean up any lingering role in the current owner object
    owner.roles = owner.roles.filter(r => !(r.scope === Scopes.ORG && r.scopeId?.toString() === orgId.toString()));
    owner.orgId = null;
    await owner.save();

    // Refresh tokens for immediate effect
    const { accessToken, refreshToken } = generateTokens(owner._id, owner.roles);
    await storeRefreshToken(owner._id, refreshToken);
    setCookies(res, accessToken, refreshToken);
    await redis.del(`user_profile:${userId}`);
  }

  // Cleanup ImageKit assets
  if (org.imageFileId) {
    deleteFromImageKit(org.imageFileId);
  }
  if (org.bannerFileId) {
    deleteFromImageKit(org.bannerFileId);
  }

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

  const organization = await Organizer.findOne({ _id: orgId, isDeleted: false });
  if (!organization) {
    return next(new CustomError("Organization not found", 404));
  }

  // Fetch metrics
  const totalEvents = await Event.countDocuments({ orgId, isDeleted: { $ne: true } });
  const upcomingEvents = await Event.countDocuments({
    orgId,
    status: { $in: ["registration-open", "registration-closed"] },
    isDeleted: { $ne: true },
  });
  const totalParticipantsQuery = await Event.aggregate([
    { $match: { orgId, isDeleted: { $ne: true } } },
    { $group: { _id: null, total: { $sum: "$joinedSlots" } } },
  ]);
  const totalParticipants = totalParticipantsQuery[0]?.total || 0;

  const totalPrizeMoneyQuery = await Event.aggregate([
    { $match: { orgId, isDeleted: { $ne: true } } },
    { $group: { _id: null, total: { $sum: "$prizePool" } } },
  ]);
  const totalPrizeMoney = totalPrizeMoneyQuery[0]?.total || 0;

  const recentEvents = await Event.find({ orgId, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .limit(5);

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

  if (!newOwnerId) {
    return next(new CustomError("New owner ID is required", 400));
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

  // Demote current owner to Manager
  const currentUser = await User.findById(userId);
  const currentOwnerRoleIndex = currentUser.roles.findIndex(
    (r) => r.scope === "org" && r.scopeId?.toString() === orgId.toString()
  );

  if (currentOwnerRoleIndex !== -1) {
    currentUser.roles[currentOwnerRoleIndex].role = Roles.ORG.MANAGER;
    await currentUser.save();
  }

  // Promote new owner to Owner
  newOwner.roles[newOwnerOrgRoleIndex].role = Roles.ORG.OWNER;
  // If new owner already has another active orgId, this might be tricky (they might own multiple orgs conceptually, but schema has single `orgId`?)
  // Assuming `orgId` on User is "active org". We can set it to this one.
  newOwner.orgId = orgId;
  newOwner.canCreateOrg = false;
  await newOwner.save();

  // Clear cache
  await redis.del(`user_profile:${userId}`);
  await redis.del(`user_profile:${newOwnerId}`);

  // Refresh tokens for current user (immediate role update for the demoted previous owner)
  const { accessToken, refreshToken } = generateTokens(currentUser._id, currentUser.roles);
  await storeRefreshToken(currentUser._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  // Fetch updated organization with members for the response
  const updatedOrg = await Organizer.findById(orgId);
  const members = await User.find({
    "roles.scopeId": orgId
  }).select("username email roles avatar joinedDate");

  // Re-format members to include their role in THIS org (same logic as getOrgDetails)
  const formattedMembers = members.map(m => {
    const mObj = m.toObject();
    const roleRecord = m.roles.find(r => r.scopeId?.toString() === orgId.toString());
    return {
      ...mObj,
      role: roleRecord ? roleRecord.role : "org:player"
    };
  });

  res.status(200).json({
    success: true,
    message: "Ownership transferred successfully",
    data: { ...updatedOrg.toObject(), members: formattedMembers },
    user: currentUser
  });
});

// Start of Member Join Requests Logic

export const joinOrg = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.params;
  const { userId } = req.user;
  const { message } = req.body;

  const user = await User.findById(userId);
  if (user.orgId) {
    throw new CustomError("You are already in an organization", 400);
  }

  const org = await Organizer.findById(orgId);
  if (!org) {
    throw new CustomError("Organization not found", 404);
  }

  if (org.isDeleted) {
    throw new CustomError("Organization does not exist", 404);
  }

  if (!org.isHiring) {
    throw new CustomError("This organization is not currently recruiting", 400);
  }

  const existingRequest = await JoinRequest.findOne({
    requester: userId,
    target: orgId,
    status: "pending",
  });

  if (existingRequest) {
    throw new CustomError("You already have a pending request for this organization", 400);
  }

  const joinRequest = await JoinRequest.create({
    requester: userId,
    target: orgId,
    targetModel: "Organizer",
    message: message || `User ${user.username} wants to join your organization.`,
  });

  // Notify Org Owner
  await createNotification({
    recipient: org.ownerId,
    sender: userId,
    type: "ORG_JOIN_REQUEST", // Ensure this type is handled in frontend or create generic type
    content: {
      title: "New Join Request",
      message: `${user.username} has requested to join your organization.`,
    },
    relatedData: {
      orgId: org._id,
      requestId: joinRequest._id,
    },
  });

  res.status(201).json({
    success: true,
    message: "Join request sent successfully",
    joinRequest,
  });
});

export const getOrgJoinRequests = TryCatchHandler(async (req, res, next) => {
  // orgId should be validated by middleware or params
  const orgId = req.params.orgId || req.orgContext?.orgId;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  const requests = await JoinRequest.find({
    target: orgId,
    status: "pending",
  })
    .populate("requester", "username avatar _id email")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    message: "Fetched join requests successfully",
    data: requests,
  });
});

export const manageJoinRequest = TryCatchHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'accepted' or 'rejected'
  const { userId } = req.user;

  if (!["accepted", "rejected"].includes(action)) {
    throw new CustomError("Invalid action. Use 'accepted' or 'rejected'", 400);
  }

  const joinRequest = await JoinRequest.findById(requestId).populate("target");
  if (!joinRequest) {
    throw new CustomError("Join request not found", 404);
  }

  if (joinRequest.status !== "pending") {
    throw new CustomError(`Request has already been ${joinRequest.status}`, 400);
  }

  // Verify ownership/management permission of the target org
  // This is partially covered by middleware, but ensuring the request belongs to the managed org is crucial
  // Assuming req.orgContext.orgId matches joinRequest.target._id if using guardOrgAccess middleware

  if (req.params.orgId && joinRequest.target._id.toString() !== req.params.orgId.toString()) {
    throw new CustomError("Request does not belong to the specified organization", 400);
  }

  try {
    if (action === "accepted") {
      const requester = await User.findById(joinRequest.requester);
      if (!requester) throw new CustomError("Requester not found", 404);
      if (requester.orgId) throw new CustomError("Requester is already in an organization", 400);

      // 1. Update JoinRequest (Atomic)
      await JoinRequest.findByIdAndUpdate(requestId, {
        status: "accepted",
        handledBy: userId,
        handledAt: new Date()
      });

      // 2. Add to Org (Atomic)
      const org = joinRequest.target;

      // Note: Organizer model doesn't have a members array limit check like Team has 10.
      // We assume unlimited or soft limit for now.

      // 3. Update user orgId and roles (Atomic)
      await User.findByIdAndUpdate(requester._id, {
        $set: { orgId: org._id },
        $push: {
          roles: {
            scope: Scopes.ORG,
            role: Roles.ORG.PLAYER, // Default to PLAYER for join requests
            scopeId: org._id,
            scopeModel: "Organizer",
          }
        }
      });

      // 4. Reject other pending requests for this user (Atomic)
      await JoinRequest.updateMany(
        { requester: requester._id, status: "pending" },
        { status: "rejected", message: "User has joined another organization" }
      );

      // Notify User
      await createNotification({
        recipient: requester._id,
        sender: userId,
        type: "ORG_JOIN_SUCCESS",
        content: {
          title: "Request Accepted!",
          message: `Your request to join ${org.name} has been accepted. Welcome!`,
        },
        relatedData: { orgId: org._id },
      });

      // Invalidate Redis cache for new member
      await redis.del(`user_profile:${requester._id}`);

    } else {
      // Rejection logic
      await JoinRequest.findByIdAndUpdate(requestId, {
        status: "rejected",
        handledBy: userId,
        handledAt: new Date()
      });

      // Notify User
      await createNotification({
        recipient: joinRequest.requester,
        sender: userId,
        type: "ORG_JOIN_REJECT",
        content: {
          title: "Request Declined",
          message: `Your request to join ${joinRequest.target.name} was declined.`,
        },
        relatedData: { orgId: joinRequest.target._id },
      });
    }

    res.status(200).json({
      success: true,
      message: `Join request ${action} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// Start of Staff/Member Invite Logic
import Invitation from "../models/invitation.model.js";

export const inviteStaffToOrg = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.params;
  const { userId } = req.user; // Sender (must be Owner/Manager)
  const { userId: targetUserId, message, role } = req.body; // Target user to invite

  if (!targetUserId) throw new CustomError("Target user ID is required", 400);

  // Validate Org
  const org = await Organizer.findById(orgId);
  if (!org || org.isDeleted) throw new CustomError("Organization not found", 404);

  // Validate User to invite
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new CustomError("User not found", 404);
  if (targetUser.orgId) throw new CustomError("User is already in an organization", 400);

  // Check existing invite
  const existingInvite = await Invitation.findOne({
    entityId: orgId,
    entityModel: "Organizer",
    receiver: targetUserId,
    status: "pending"
  });

  if (existingInvite) throw new CustomError("Invite already pending for this user", 400);

  // Create Invitation
  const newInvite = await Invitation.create({
    entityId: orgId,
    entityModel: "Organizer",
    receiver: targetUserId,
    receiverModel: "User",
    sender: userId,
    status: "pending",
    message: message || "You have been invited to join the organization.",
    role: role || Roles.ORG.STAFF // Default to Staff if using this endpoint, or pass dynamic
  });

  // Notify User
  await createNotification({
    recipient: targetUserId,
    sender: userId,
    type: "ORG_INVITE",
    content: {
      title: "Organization Invitation",
      message: `You have been invited to join ${org.name} as ${role || "Staff"}.`,
    },
    relatedData: {
      orgId: org._id,
      inviteId: newInvite._id,
      role: newInvite.role
    },
    actions: [
      { label: "Accept", actionType: "ACCEPT", payload: { orgId: org._id, inviteId: newInvite._id, role: newInvite.role } },
      { label: "Reject", actionType: "REJECT", payload: { orgId: org._id, inviteId: newInvite._id } },
    ]
  });

  res.status(201).json({
    success: true,
    message: "Invitation sent successfully",
    data: newInvite
  });
});

export const getOrgPendingInvites = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.params;

  const invites = await Invitation.find({
    entityId: orgId,
    entityModel: "Organizer",
    status: "pending"
  })
    .populate("receiver", "username email avatar")
    .populate("sender", "username")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    message: "Fetched pending invites",
    data: invites
  });
});

export const cancelOrgInvite = TryCatchHandler(async (req, res, next) => {
  const { orgId, inviteId } = req.params;

  const invite = await Invitation.findOne({ _id: inviteId, entityId: orgId });
  if (!invite) throw new CustomError("Invitation not found", 404);
  if (invite.status !== "pending") throw new CustomError("Cannot cancel non-pending invite", 400);

  await Invitation.findByIdAndDelete(inviteId);

  res.status(200).json({
    success: true,
    message: "Invitation cancelled successfully"
  });
});


