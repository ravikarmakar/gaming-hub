import Organizer from "./organizer.model.js";
import User from "../user/user.model.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { createNotification } from "../notification/notification.controller.js";
import { invalidateCacheWithRetry } from "../../shared/utils/cache.js";

/**
 * Strategy methods for Join Requests and Invitations
 */

export const validateJoinRequest = async (userId, orgId, session = null) => {
    const userQuery = User.findById(userId);
    if (session) userQuery.session(session);
    const user = await userQuery;
    if (!user) throw new CustomError("User not found", 404);

    if (user.orgId) throw new CustomError("You are already in an organization", 400);

    const q = Organizer.findById(orgId);
    if (session) q.session(session);
    const org = await q;

    if (!org || org.isDeleted) throw new CustomError("Organization not found", 404);
    if (!org.isHiring) throw new CustomError("This organization is not currently recruiting", 400);

    return { resource: org, recipientId: org.ownerId };
};

export const acceptJoinRequest = async (requesterId, orgId, handledBy, session = null) => {
    const requesterQuery = User.findById(requesterId);
    if (session) requesterQuery.session(session);
    const requester = await requesterQuery;
    if (!requester) throw new CustomError("Requester not found", 404);

    if (requester.orgId) throw new CustomError("Requester is already in an organization", 400);

    const orgQuery = Organizer.findById(orgId);
    if (session) orgQuery.session(session);
    const org = await orgQuery;
    if (!org || org.isDeleted) throw new CustomError("Organization no longer exists", 404);

    // Update User
    await User.findByIdAndUpdate(requesterId, {
        $set: { orgId: orgId },
        $push: {
            roles: {
                scope: Scopes.ORG,
                role: Roles.ORG.STAFF,
                scopeId: orgId,
                scopeModel: "Organizer",
            }
        }
    }, { session });

    // Update Organizer Stats
    await Organizer.findByIdAndUpdate(orgId, { $inc: { "stats.memberCount": 1 } }, { session });

    await createNotification({
        recipient: requesterId,
        sender: handledBy,
        type: "ORG_JOIN_SUCCESS",
        content: { title: "Request Accepted!", message: `Your request to join ${org.name} has been accepted. Welcome!` },
        relatedData: { orgId: orgId },
    }, { session });

    return {
        responseData: null, // Organizers don't currently return transformed data here
        socketEventData: null,
        requesterId,
        cacheKeys: [`user_profile:${requesterId}`, `org_details:${orgId}`]
    };
};

export const validateInvitation = async (senderId, inviteeId, orgId) => {
    const org = await Organizer.findById(orgId);
    if (!org || org.isDeleted) throw new CustomError("Organization not found", 404);

    const isAuthorized = org.ownerId?.toString() === senderId.toString();
    if (!isAuthorized) {
        throw new CustomError("You do not have permission to invite members to this organization", 403);
    }

    const invitee = await User.findById(inviteeId);
    if (!invitee) throw new CustomError("User not found to invite", 404);

    if (invitee.orgId?.toString() === orgId.toString()) {
        throw new CustomError("User is already a member of this organization", 400);
    }

    return { resource: org, invitee };
};

export const acceptInvitation = async (inviteeId, orgId, role, session = null) => {
    const userQuery = User.findById(inviteeId);
    if (session) userQuery.session(session);
    const user = await userQuery;
    if (!user) throw new CustomError("User not found", 404);

    if (user.orgId) throw new CustomError("You are already in an organization", 400);

    const orgQuery = Organizer.findById(orgId);
    if (session) orgQuery.session(session);
    const org = await orgQuery;
    if (!org || org.isDeleted) throw new CustomError("Organization not found or deleted", 404);

    // Update User
    await User.findByIdAndUpdate(
        inviteeId,
        {
            $set: { orgId: orgId },
            $push: {
                roles: {
                    scope: Scopes.ORG,
                    role: role || Roles.ORG.STAFF,
                    scopeId: orgId,
                    scopeModel: "Organizer",
                },
            },
        },
        { session }
    );

    // Update Organizer Stats
    await Organizer.findByIdAndUpdate(orgId, { $inc: { "stats.memberCount": 1 } }, { session });

    return {
        resultMessage: `You have successfully joined ${org.name}`,
        cacheKeys: [`user_profile:${inviteeId}`, `org_details:${orgId}`]
    };
};
