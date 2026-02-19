import { lazy } from "react";

// Lazy Loaded Pages
export const pages = {
    // Common
    Support: lazy(() => import("@/components/SupportPage")),
    Home: lazy(() => import("@/features/home/ui/pages/HomePage")),
    NotFound: lazy(() => import("@/components/NotFound")),

    // Auth
    Login: lazy(() => import("@/features/auth/ui/LoginPage")),
    Signup: lazy(() => import("@/features/auth/ui/SignupPage")),
    ForgotPassword: lazy(() => import("@/features/auth/ui/components/forgot-password")),
    VerifyEmail: lazy(() => import("@/features/auth/ui/components/verify-email")),
    DiscordCallback: lazy(() => import("@/features/auth/ui/components/discord-callback")),

    // Organizer
    OrganizerProfile: lazy(() => import("@/features/organizer/ui/pages/OrganizerProfile")),
    OrganizerDashboard: lazy(() => import("@/features/organizer/ui/pages/OrganizerDashboard")),
    OrganizerMember: lazy(() => import("@/features/organizer/ui/pages/OrganizerMemberPage")),
    OrganizerLayout: lazy(() => import("@/features/organizer/ui/layouts/OrganizerLayout")),
    OrganizerTournaments: lazy(() => import("@/features/organizer/ui/pages/OrganizerTournaments")),
    OrganizerSettings: lazy(() => import("@/features/organizer/ui/pages/OrganizerSettingsPage")),
    OrganizerJoinRequests: lazy(() => import("@/features/organizer/ui/pages/OrganizerJoinRequestsPage")),
    OrganizerNotifications: lazy(() => import("@/features/organizer/ui/pages/OrganizerNotificationsPage")),
    OrganizerTournamentDashboard: lazy(() => import("@/features/organizer/ui/pages/OrganizerTournamentDashboard")),
    FindOrganizers: lazy(() => import("@/features/organizer/ui/pages/FindOrganizers")),
    GroupTeamList: lazy(() => import("@/features/organizer/ui/pages/GroupTeamList")),

    // Player
    PlayerId: lazy(() => import("@/features/player/ui/pages/PlayerIdPage")),
    FindPlayers: lazy(() => import("@/features/player/ui/pages/FindPlayers")),
    PlayerSettings: lazy(() => import("@/features/player/ui/pages/PlayerSettings")),

    // Team
    TeamId: lazy(() => import("@/features/teams/ui/pages/TeamIdPage")),
    TeamDashboard: lazy(() => import("@/features/teams/ui/pages/TeamDashboard")),
    TeamLayout: lazy(() => import("@/features/teams/ui/layouts/TeamLayout")),
    TeamMembers: lazy(() => import("@/features/teams/ui/pages/TeamMembersPage")),
    TeamStaff: lazy(() => import("@/features/teams/ui/pages/TeamStaffPage")),
    TeamNotifications: lazy(() => import("@/features/teams/ui/pages/TeamNotificationsPage")),
    TeamSettings: lazy(() => import("@/features/teams/ui/pages/TeamSettings")),
    TeamTournaments: lazy(() => import("@/features/teams/ui/pages/TeamTournamentsPage")),
    TeamChat: lazy(() => import("@/features/teams/ui/pages/TeamChatPage")),
    FindTeams: lazy(() => import("@/features/teams/ui/pages/FindTeams")),

    // Events
    CreateTournament: lazy(() => import("@/features/events/ui/pages/CreateTournament")),
    TournamentById: lazy(() => import("@/features/events/ui/pages/TournamentById")),
    AllTournaments: lazy(() => import("@/features/events/ui/pages/AllTournaments")),

    // Notifications
    Notifications: lazy(() => import("@/features/notifications/ui/pages/NotificationsPage")),
};
