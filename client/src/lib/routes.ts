export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DISCORD_CALLBACK: "/auth/discord/callback",
  PLAYER_PROFILE: "/player/:id",
  TEAM_PROFILE: "/team/:id",
  EMAIL_VERIFY: "/verify-account",
  TEAM_DASHBOARD: "/dashboard/team",
  SUPER_ADMIN: "/super-admin/:id",
  CREATE_ORG: "/create-org",
  NOTIFICATIONS: "/notifications",
  ALL_PLAYERS: "/players",

  ORG_PROFILE: "/organizer/:id",
  ORG_DASHBOARD: "/organizer-dashboard/:id",
};

// export const ROUTES = {
//   HOME: "/",

//   AUTH: {
//     LOGIN: "/login",
//     REGISTER: "/register",
//     FORGOT_PASSWORD: "/forgot-password",
//     DISCORD_CALLBACK: "/auth/discord/callback",
//     VERIFY_EMAIL: "/verify-account",
//   },

//   DASHBOARD: {
//     PLAYER: "/dashboard/player",
//     TEAM: "/dashboard/team",
//     ORGANIZER: "/organizer",
//     SUPER_ADMIN: "/super-admin",
//   },

//   PROFILE: {
//     PLAYER: "/player/:id",
//     TEAM: "/team/:id",
//     ORGANIZER: "/organizer/:id",
//   },

//   TEAM: {
//     SETTINGS: "/dashboard/team/settings",
//     TOURNAMENTS: "/dashboard/team/tournaments",
//     PLAYERS: "/dashboard/team/players",
//     PERFORMANCE: "/dashboard/team/performance",
//   },

//   ORGANIZER: {
//     CREATE: "/create-org",
//   },

//   NOTIFICATIONS: "/notifications",
// };

// lib/routes/index.ts
// export const ROUTES = {
//   AUTH: {
//     LOGIN: "/login",
//     REGISTER: "/register",
//     FORGOT_PASSWORD: "/forgot-password",
//     VERIFY_EMAIL: "/verify-account",
//     DISCORD_CALLBACK: "/auth/discord/callback",
//   },
//   DASHBOARD: {
//     ORG: "/organizer",
//     TEAM: "/dashboard/team",
//     SUPER_ADMIN: "/super-admin",
//   },
//   PROFILE: {
//     PLAYER: "/player/:id",
//     TEAM: "/team/:id",
//     ORG: "/organizer/:id",
//   },
//   GENERAL: {
//     HOME: "/",
//     CREATE_ORG: "/create-org",
//     NOTIFICATIONS: "/notifications",
//   },
// };
