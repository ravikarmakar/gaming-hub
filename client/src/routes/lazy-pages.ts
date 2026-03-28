import { lazy } from "react";

// Lazy Loaded Pages
export const pages = {
    // Common
    Support: lazy(() => import("@/components/SupportPage")),
    Home: lazy(() => import("@/features/home/ui/pages/HomePage")),
    NotFound: lazy(() => import("@/components/NotFound")),

    // Auth
    Login: lazy(() => import("@/features/auth/ui/login-page")),
    Signup: lazy(() => import("@/features/auth/ui/signup-page")),
    ForgotPassword: lazy(() => import("@/features/auth/ui/components/forgot-password")),
    VerifyEmail: lazy(() => import("@/features/auth/ui/components/verify-email")),
    DiscordCallback: lazy(() => import("@/features/auth/ui/components/discord-callback")),

    // Organizer
    OrganizerProfile: lazy(() => import("@/features/organizer/ui/pages/OrganizerProfile")),
    OrganizerDashboard: lazy(() => import("@/features/organizer/ui/pages/OrganizerDashboard")),
    OrganizerMember: lazy(() => import("@/features/organizer/ui/pages/OrganizerMemberPage")),
    OrganizerLayout: lazy(() => import("@/features/organizer/ui/layouts/OrganizerLayout")),
    OrganizerTournaments: lazy(() => import("@/features/tournaments/ui/pages/TournamentsPage")),
    OrganizerSettings: lazy(() => import("@/features/organizer/ui/pages/OrganizerSettingsPage")),
    OrganizerJoinRequests: lazy(() => import("@/features/organizer/ui/pages/OrganizerJoinRequestsPage")),
    OrganizerNotifications: lazy(() => import("@/features/organizer/ui/pages/OrganizerNotificationsPage")),
    OrganizerTournamentDashboard: lazy(() => import("@/features/tournaments/ui/pages/TournamentDashboard")),
    OrganizerChat: lazy(() => import("@/features/organizer/ui/pages/OrganizerChatPage")),
    FindOrganizers: lazy(() => import("@/features/organizer/ui/pages/FindOrganizers")),
    GroupTeamList: lazy(() => import("@/features/tournaments/ui/pages/GroupTeamList")),

    // Player
    PlayerId: lazy(() => import("@/features/player/ui/pages/PlayerIdPage")),
    FindPlayers: lazy(() => import("@/features/player/ui/pages/FindPlayers")),
    PlayerSettings: lazy(() => import("@/features/player/ui/pages/PlayerSettings")),

    // Team
    TeamId: lazy(() => import("@/features/teams/ui/pages/TeamProfilePage")),
    TeamDashboard: lazy(() => import("@/features/teams/ui/pages/TeamDashboardPage")),
    TeamLayout: lazy(() => import("@/features/teams/ui/layouts/TeamLayout")),
    TeamMembers: lazy(() => import("@/features/teams/ui/pages/TeamMembersPage")),
    TeamStaff: lazy(() => import("@/features/teams/ui/pages/TeamStaffPage")),
    TeamNotifications: lazy(() => import("@/features/teams/ui/pages/TeamNotificationsPage")),
    TeamSettings: lazy(() => import("@/features/teams/ui/pages/TeamSettings")),
    TeamTournaments: lazy(() => import("@/features/teams/ui/pages/TeamTournamentsPage")),
    TeamChat: lazy(() => import("@/features/teams/ui/pages/TeamChatPage")),
    FindTeams: lazy(() => import("@/features/teams/ui/pages/FindTeamsPage")),

    // Tournaments
    CreateTournament: lazy(() => import("@/features/tournaments/ui/pages/CreateTournament")),
    TournamentById: lazy(() => import("@/features/tournaments/ui/pages/TournamentById")),
    AllTournaments: lazy(() => import("@/features/tournaments/ui/pages/AllTournaments")),

    // Notifications
    Notifications: lazy(() => import("@/features/notifications/ui/pages/NotificationsPage")),

    // Admin
    AdminDashboard: lazy(() => import("@/features/admin/ui/pages/AdminDashboard")),
    UserManagementPage: lazy(() => import("@/features/admin/ui/pages/UserManagementPage")),
    TeamManagementPage: lazy(() => import("@/features/admin/ui/pages/TeamManagementPage")),
    OrganizerManagementPage: lazy(() => import("@/features/admin/ui/pages/OrganizerManagementPage")),
    AdminLayout: lazy(() => import("@/features/admin/ui/layout/AdminLayout")),
};
