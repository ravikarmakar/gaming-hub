export const rolesPermissions = {
  user: {
    actions: ["player"],
    restrictions: ["limited-access"],
  },
  team: {
    actions: ["join-tournament"],
    restrictions: ["cannot-create-event"],
  },
  organizer: {
    actions: ["create-event", "manage-teams", "edit-profile"],
    restrictions: ["limited-team-management"],
  },
  admin: {
    actions: ["manage-everything"],
    restrictions: [],
  },
  super_admin: {
    actions: ["manage-everything", "full-access"],
    restrictions: [],
  },
};

// export const rolesPermissions = {
//   USER: ["player"],
//   TEAM: ["join-tournament"],
//   ORGANIZER: ["create-event", "manage-teams", "edit-profile"],
//   STAFF: ["manage-users", "create-event"],
//   MODERATOR: ["manage-content", "manage-users"],
//   ADMIN: ["manage-everything"],
//   SUPER_ADMIN: ["manage-everything", "full-access"],
// };
