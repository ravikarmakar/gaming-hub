/**
 * TanStack Query key factory for auth queries.
 * Follows the standard pattern used across the features/ directory.
 */
export const authKeys = {
  all: ["auth"] as const,
  profile: (skipCache = false) => [...authKeys.all, "profile", { skipCache }] as const,
  session: () => [...authKeys.all, "session"] as const,
};
