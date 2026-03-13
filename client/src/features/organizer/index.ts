// Public API (Barrel Export) for Organizer Feature

// UI Pages/Components
export { OrganizerDashboard } from "./ui/pages/OrganizerDashboard";
export { OrganizerSettingsPage } from "./ui/pages/OrganizerSettingsPage";
export { OrganizerMemberPage } from "./ui/pages/OrganizerMemberPage";
export { OrganizerChatPage } from "./ui/pages/OrganizerChatPage";
export { OrganizerJoinRequestsPage } from "./ui/pages/OrganizerJoinRequestsPage";
export { OrganizerNotificationsPage } from "./ui/pages/OrganizerNotificationsPage";
export { FindOrganizers } from "./ui/pages/FindOrganizers";
export { OrganizerProfile } from "./ui/pages/OrganizerProfile";

// Hooks
export {
    useGetOrgByIdQuery,
    useOrganizersQuery,
    useInfiniteOrganizersQuery,
    useOrgDashboardStatsQuery,
    useSearchAvailableUsersQuery,
    useOrgJoinRequestsQuery,
    useOrgPendingInvitesQuery,
    useOrgNotificationsQuery
} from "./hooks/useOrganizerQueries";
export {
    useCreateOrgMutation,
    useUpdateOrgMutation,
    useDeleteOrgMutation,
    useLeaveOrgMutation,
    useAddStaffMutation,
    useUpdateStaffRoleMutation,
    useTransferOwnershipMutation,
    useRemoveStaffMutation,
    useJoinOrgMutation,
    useManageJoinRequestMutation,
    useInviteStaffMutation,
    useCancelInviteMutation,
    useMarkNotificationReadMutation
} from "./hooks/useOrganizerMutations";
export { useOrganizerSync } from "./hooks/useOrganizerSync";
export { useManageOrgMembers } from "./hooks/useManageOrgMembers";

// Lib/Types
export * from "./types";
export { ORGANIZER_ROUTES } from "./lib/routes";
export { ORGANIZER_ENDPOINTS } from "./lib/endpoints";
export { ORG_ACTIONS, ORG_ACTIONS_ACCESS } from "./lib/access";
