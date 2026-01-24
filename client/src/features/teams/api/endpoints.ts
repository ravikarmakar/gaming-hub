// Base path for all team endpoints
const TEAMS_BASE = '/teams';

export const teamEndpoints = {
    // Public endpoints - no authentication required
    getAll: () => `${TEAMS_BASE}`,
    getById: (teamId: string) => `${TEAMS_BASE}/details/${teamId}`,

    // Authenticated endpoints - require user authentication
    create: () => `${TEAMS_BASE}/create-team`,
    update: () => `${TEAMS_BASE}/update-team`,
    delete: () => `${TEAMS_BASE}/delete-team`,

    // Member management - nested resource pattern
    members: {
        add: () => `${TEAMS_BASE}/add-members`,
        remove: (memberId: string) => `${TEAMS_BASE}/remove-member/${memberId}`,
        leave: () => `${TEAMS_BASE}/leave-member`,
        updateRole: () => `${TEAMS_BASE}/manage-member-role`,
    },

    // Ownership management
    ownership: {
        transfer: () => `${TEAMS_BASE}/transfer-owner`,
    },

    // Invitations
    invitations: {
        base: () => '/invitations',
        invite: () => '/invitations/invite-member',
        respond: () => '/invitations/response-invite',
    }
} as const;
