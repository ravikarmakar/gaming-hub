import { TeamMemberRoles } from "../../modules/team/team.constants.js";

/**
 * Filter and limit team members for tournament registration.
 * Policy: 
 * - Core roles (IGL, Rusher, Sniper, Support) are autopopulated as primary players.
 * - Up to 2 additional active members are autopopulated as substitutes.
 * 
 * @param {Array} members - List of team members
 * @returns {Object} { players: Array<ObjectId>, substitutes: Array<ObjectId> }
 */
export const getTournamentRegistrants = (members) => {
    const coreRoles = [
        TeamMemberRoles.IGL,
        TeamMemberRoles.RUSHER,
        TeamMemberRoles.SNIPER,
        TeamMemberRoles.SUPPORT
    ];

    const players = [];
    const substitutes = [];

    // 1. Identify active members with core roles
    members.forEach(member => {
        if (member.isActive && coreRoles.includes(member.roleInTeam)) {
            players.push(member.user);
        }
    });

    // 2. Identify remaining active members for substitutes (max 2)
    const remainingActive = members.filter(member =>
        member.isActive &&
        !players.includes(member.user)
    );

    remainingActive.slice(0, 2).forEach(member => {
        substitutes.push(member.user);
    });

    return { players, substitutes };
};
