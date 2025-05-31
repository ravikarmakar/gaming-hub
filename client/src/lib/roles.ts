export const SCOPES = {
  PLATFORM: "platform",
  ORG: "org",
  TEAM: "team",
};

export const PLATFORM_ROLES = {
  SUPER_ADMIN: "platform:super_admin",
  STAFF: "platform:staff",
  USER: "platform:user",
};

export const ORG_ROLES = {
  OWNER: "org:owner",
  MANAGER: "org:manager",
  STAFF: "org:staff",
  PLAYER: "org:player",
};

export const PLATFORM_SUPER_ADMIN_ROLES = [
  PLATFORM_ROLES.SUPER_ADMIN,
  PLATFORM_ROLES.STAFF,
];

export const ORG_ADMIN_ROLES = [
  ORG_ROLES.OWNER,
  ORG_ROLES.MANAGER,
  ORG_ROLES.STAFF,
];

export const ROUTE_PERMISSIONS = {
  "/organizer/manage-staff": ["org:owner", "org:manager"],
  "/organizer/dashboard": ["org:owner", "org:manager", "org:staff"],
  "/super-admin": ["platform:super_admin", "platform:staff"],
};
