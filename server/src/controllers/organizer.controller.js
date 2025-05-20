import Organizer from "../models/organizer.model.js";
import User from "../models/user.model.js";
import { TryCatchHandler } from "../middleware/error.middleware.js";
import { CustomError } from "../utils/CustomError.js";
import { Roles, Scopes } from "../config/roles.js";
import { redis } from "../config/redisClient.js";

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
    orgId: newOrg._id,
    role: Roles.ORG.OWNER,
  });
  user.canCreateOrg = false;
  user.orgId = newOrg._id;

  await user.save();

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

  res.status(200).json({
    success: true,
    message: "Organization details fetched successfully",
    org: organization,
  });
});

export const updateOrg = TryCatchHandler(async (req, res, next) => {
  const orgRole = req.user.role.find((r) => r.scope === "org");
  const orgId = orgRole?.orgId;
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
    data: org,
  });
});

export const addStaff = TryCatchHandler(async (req, res, next) => {
  const { username, role } = req.body;
  const { orgId } = req.params;
  const { userId } = req.user;

  // Check if role is valid org-level role
  const allowedRoles = [Roles.ORG.MANAGER, Roles.ORG.STAFF, Roles.ORG.PLAYER];
  if (!allowedRoles.includes(role)) {
    return next(new CustomError("Invalid org role provided", 400));
  }

  // Get requesting user (the one trying to add)
  const requestingUser = await User.findById(userId);
  if (!requestingUser) {
    return next(new CustomError("Requesting user not found", 404));
  }

  // Check if requester has permission to add staff
  const hasPermission = requestingUser.role.some(
    (r) =>
      r.scope === "org" &&
      r.orgId?.toString() === orgId &&
      r.role === Roles.ORG.OWNER
  );
  if (!hasPermission) {
    return next(new CustomError("Unauthorized to add staff", 403));
  }

  // Find the target user by username
  const targetUser = await User.findOne({ username });
  if (!targetUser) {
    return next(new CustomError("Target user not found", 404));
  }

  // Check if user is already part of the same org
  const alreadyInOrg = targetUser.role.some(
    (r) => r.scope === "org" && r.orgId?.toString() === orgId
  );
  if (alreadyInOrg) {
    return next(
      new CustomError("User already has a role in this organization", 400)
    );
  }

  // Add new org role to the user
  targetUser.role.push({
    scope: "org",
    role,
    orgId,
  });

  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `User added as ${role} to organization`,
    user: {
      username: targetUser.username,
      roles: targetUser.role,
    },
  });
});

export const updateStaffRole = TryCatchHandler(async (req, res, next) => {});

export const removeStaff = TryCatchHandler(async (req, res, next) => {});

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
  await Organizer.findByIdAndDelete(orgId);

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

// export const organizationProfile = async (req, res) => {
//   try {
//     const loggedInUser = req.user;

//     const organization = await Organizer.findById(loggedInUser.activeOrganizer)
//       .populate("members.userId")
//       .populate("ownerId", "name email");

//     if (!organization) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Organization not found" });
//     }

//     res.status(200).json({ success: true, organization });
//   } catch (error) {
//     console.log("Error in organizationProfile:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// export const allEventsOfOrganizer = async (req, res) => {
//   try {
//     const { organizerId } = req.params;

//     // ✅ 1. Check if organizerId is provided
//     if (!organizerId) {
//       return res.status(400).json({ message: "Organizer ID is required!" });
//     }

//     // ✅ 2. Fetch all events of the given organizer
//     const events = await Event.find({ organizerId }).sort({ createdAt: -1 });

//     // ✅ 3. Check if events exist
//     if (events.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No events found for this organizer!" });
//     }

//     // ✅ 4. Return the events
//     return res.status(200).json({
//       message: "Events fetched successfully!",
//       totalEvents: events.length,
//       events,
//     });
//   } catch (error) {
//     console.error("Error in allEventsOfOrganizer:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
