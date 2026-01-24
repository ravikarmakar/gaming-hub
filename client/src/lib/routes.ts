import { TEAM_ROUTES } from "@/features/teams/routes";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DISCORD_CALLBACK: "/auth/discord/callback",
  PLAYER_PROFILE: "/player/:id",
  TEAM_PROFILE: TEAM_ROUTES.PROFILE,
  EMAIL_VERIFY: "/verify-email",
  TEAM_DASHBOARD: TEAM_ROUTES.DASHBOARD,
  TEAM_SETTINGS: TEAM_ROUTES.SETTINGS,
  SUPER_ADMIN: "/super-admin/:id",
  CREATE_ORG: "/create-org",
  NOTIFICATIONS: "/notifications",
  ALL_PLAYERS: "/players",
  ALL_TEAMS: "/teams",

  ORG_PROFILE: "/organizer/:id",
  ORG_DASHBOARD: "/organizer-dashboard/:id",

  ALL_EVENTS: "/tournaments",
  EVENT_DETAILS: "/organizer/event/:eventId",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  TRENDING: "/trending",
  COMMUNITY: "/community",
  UPGRADE: "/upgrade",
};
