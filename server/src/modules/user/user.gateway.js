import User from "./user.model.js";
import { Roles, Scopes } from "../../shared/constants/roles.js";

/**
 * UserGateway provides a clean interface for other modules to interact with User data.
 * This ensures that the Team module doesn't need to know about User model implementation details.
 */

export const getUserById = async (userId, session = null) => {
    const query = User.findById(userId);
    if (session) query.session(session);
    return await query.lean();
};

export const getUserWithRoles = async (userId, session = null) => {
    const query = User.findById(userId);
    if (session) query.session(session);
    return await query;
};

export const findUsersByIds = async (userIds, select = "", session = null) => {
    const query = User.find({ _id: { $in: userIds } }).select(select);
    if (session) query.session(session);
    return await query;
};

export const assignTeamToUser = async (userId, teamId, role = Roles.TEAM.PLAYER, session = null) => {
    return await User.findOneAndUpdate(
        { _id: userId, teamId: null },
        {
            $set: { teamId: teamId },
            $push: {
                roles: {
                    scope: Scopes.TEAM,
                    role: role,
                    scopeId: teamId,
                    scopeModel: "Team",
                },
            },
        },
        { session, new: true }
    );
};

export const removeTeamFromUser = async (userId, teamId, session = null) => {
    return await User.findOneAndUpdate(
        { _id: userId, teamId: teamId },
        {
            $set: { teamId: null },
            $pull: {
                roles: {
                    scope: Scopes.TEAM,
                    scopeId: teamId,
                },
            },
        },
        { session, new: true }
    );
};

export const bulkAssignTeamToUsers = async (userIds, teamId, role = Roles.TEAM.PLAYER, session = null) => {
    const bulkOps = userIds.map((userId) => ({
        updateOne: {
            filter: { _id: userId, teamId: null },
            update: {
                $set: { teamId: teamId },
                $push: {
                    roles: {
                        scope: Scopes.TEAM,
                        role: role,
                        scopeId: teamId,
                        scopeModel: "Team",
                    },
                },
            },
        },
    }));
    return await User.bulkWrite(bulkOps, { session });
};

export const bulkRemoveTeamFromUsers = async (userIds, teamId, session = null) => {
    return await User.updateMany(
        { _id: { $in: userIds }, teamId: teamId },
        {
            $set: { teamId: null },
            $pull: {
                roles: {
                    scope: Scopes.TEAM,
                    scopeId: teamId,
                },
            },
        },
        { session }
    );
};

export const updateMemberSystemRole = async (userId, teamId, newRole, session = null) => {
    const updateQuery = User.updateOne(
        { _id: userId, "roles.scopeId": teamId },
        { $set: { "roles.$.role": newRole } }
    );
    if (session) updateQuery.session(session);
    return await updateQuery;
};

export const clearTeamIdOnly = async (userId, session = null) => {
    return await User.findByIdAndUpdate(userId, { $set: { teamId: null } }, { session });
};

export const countUsersInTeam = async (userIds, teamId, session = null) => {
    const query = User.find({ _id: { $in: userIds }, teamId: teamId });
    if (session) query.session(session);
    return await query.countDocuments();
};
