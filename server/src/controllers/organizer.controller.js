import Organizer from "../models/organizer.model.js";
import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { Roles, Scopes } from "../config/roles.js";
import { redis } from "../config/redisClient.js";
import {
  generateTokens,
  setCookies,
  storeRefreshToken,
} from "../utils/generateTokens.js";
import { findUserById } from "../services/user.service.js";

export const createOrg = TryCatchHandler(async (req, res, next) => {
  const { userId } = req.user;
  const cacheKey = `user_profile:${userId}`;
  const { name, email, description, tag } = req.body;

  const imageFile = req.file;
  // uplaod image here
  const imageUrl = "https://new-my-image";

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  if (!user.canCreateOrg || !user.isAccountVerified || user.orgId)
    return next(
      new CustomError("You are not allowed to create an organization", 403)
    );

  const org = await Organizer.findOne({ name });
  if (org)
    return next(new CustomError("Organization name must be unique", 400));

  const newOrg = await Organizer.create({
    ownerId: user._id,
    imageUrl,
    name,
    email,
    description,
    tag,
  });

  user.role.push({
    scope: Scopes.ORG,
    role: Roles.ORG.OWNER,
    scopeId: newOrg._id,
    scopeModel: "Organization",
  });
  user.canCreateOrg = false;
  user.orgId = newOrg._id;

  await user.save();

  // this will update the accessToken and refresh token jwt payloads
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // store refresh token in redis
  await storeRefreshToken(user._id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  // Invalidate redis cache
  await redis.del(cacheKey);

  res
    .status(201)
    .json({ success: true, messgae: "Org created successfully", org: newOrg });
});

export const getOrgDetails = TryCatchHandler(async (req, res, next) => {
  const { orgId } = req.params;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  const organization = await Organizer.findById(orgId).populate(
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
              input: "$role",
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
    org: orgWithMembers,
  });
});

export const updateOrg = TryCatchHandler(async (req, res, next) => {
  const orgRole = req.user.role.find((r) => r.scope === "org");
  const orgId = orgRole?.orgId;
  console.log(orgId);
  const { name, email, description, tag } = req.body;
  const imageFile = req.file;

  // Optional: Check if user is authorized (e.g., org owner or manager)
  // You can include auth logic here if needed

  // Validate orgId
  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  // Find existing organization
  const org = await Organizer.findById(orgId);
  if (!org) {
    return next(new CustomError("Organization not found", 404));
  }

  // Optional: Image upload logic
  let imageUrl = org.imageUrl;
  if (imageFile) {
    // Upload to cloud service (e.g., Cloudinary) — stubbed here
    imageUrl = "https://new-updated-image-url.com";
  }

  // Update fields if provided
  if (name) org.name = name;
  if (email) org.email = email;
  if (description) org.description = description;
  if (tag) org.tag = tag;
  org.imageUrl = imageUrl;

  await org.save();

  res.status(200).json({
    success: true,
    message: "Organization updated successfully",
    org,
  });
});

export const addStaff = TryCatchHandler(async (req, res, next) => {
  const { staff } = req.body;

  if (!Array.isArray(staff) || staff.length === 0) {
    return next(new CustomError("Staff array is required", 400));
  }

  const orgRole = req.user.role.find((r) => r.scope === "org");
  const orgId = orgRole?.orgId;

  if (!orgId) {
    return next(new CustomError("Organization ID not found in user role", 400));
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
      const alreadyInOrg = targetUser.role.some(
        (r) => r.scope === "org" && r.orgId?.toString() === orgId.toString()
      );
      if (alreadyInOrg) {
        return {
          userId,
          success: false,
          message: "User already has a role in this organization",
        };
      }

      targetUser.role.push({
        scope: Scopes.ORG,
        role: Roles.ORG.STAFF,
        orgId,
      });
      targetUser.orgId = orgId;
      await targetUser.save();

      return { userId, success: true };
    })
  );

  res
    .status(200)
    .json({ success: true, messgae: "Members added successfully", results });
});

export const updateStaffRole = TryCatchHandler(async (req, res, next) => {
  const { userId, newRole } = req.body;
  const orgRole = req.user.role.find((r) => r.scope === "org");
  const orgId = orgRole?.orgId;

  if (!userId || !newRole)
    return next(new CustomError("userId and newRole are required", 400));

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  const orgRoleIndex = user.role.findIndex(
    (r) => r.scope === "org" && r.orgId?.toString() === orgId.toString()
  );

  if (orgRoleIndex === -1)
    return next(
      new CustomError("User does not belong to your organization", 403)
    );

  user.role[orgRoleIndex].role = newRole;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Staff role updated successfully",
  });
});

export const removeStaff = TryCatchHandler(async (req, res, next) => {
  const userId = req.params.id;
  const orgRole = req.user.role.find((r) => r.scope === "org");
  const orgId = orgRole?.orgId;

  if (!userId)
    return next(new CustomError("userId is required to remove staff", 400));

  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found", 404));

  const hasOrgRole = user.role.some(
    (r) => r.scope === "org" && r.orgId?.toString() === orgId.toString()
  );

  if (!hasOrgRole)
    return next(new CustomError("User is not part of your organization", 403));

  // Remove the org role
  user.role = user.role.filter(
    (r) => !(r.scope === "org" && r.orgId?.toString() === orgId.toString())
  );

  // Clear the user's orgId if it matches
  if (user.orgId?.toString() === orgId.toString()) {
    user.orgId = null;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Staff removed from organization successfully",
  });
});

export const deleteOrg = TryCatchHandler(async (req, res, next) => {
  const orgRole = req.user.role.find((r) => r.scope === "org");
  const orgId = orgRole?.orgId;
  const { userId } = req.user;

  if (!orgId) {
    return next(new CustomError("Organization ID is required", 400));
  }

  const org = await Organizer.findById(orgId);
  if (!org) {
    return next(new CustomError("Organization not found", 404));
  }

  // Check if the requester is the owner
  if (org.ownerId.toString() !== userId) {
    return next(
      new CustomError("Only the organization owner can delete it", 403)
    );
  }

  // Delete the org
  org.isDeketed = true;
  await org.save();

  // Optional: Remove org-related roles from all users
  await User.updateMany(
    { "role.orgId": orgId },
    {
      $pull: {
        role: { orgId: orgId },
      },
      $set: {
        orgId: null,
      },
    }
  );

  res.status(200).json({
    success: true,
    message: "Organization deleted successfully",
  });
});

// to-do --> express input validation & image uploading
