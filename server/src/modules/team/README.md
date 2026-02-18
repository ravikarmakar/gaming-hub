# Team Service

## Overview
The Team Service manages the lifecycle of competitive gaming teams, including creation, branding, roster management, and recruitment. It implements a highly consistent architecture using MongoDB transactions and an optimized caching strategy using Redis.

## Architecture
The service follows a modular approach within the `src/modules/team` directory:
- **Routes (`team.route.js`)**: Entry points for all team operations, including RBAC and validation middleware.
- **Controllers (`team.controller.js`)**: Orchestrates the flow between HTTP requests, services, and caching.
- **Services (`team.service.js`)**: Contains the core business logic and atomic database operations.
- **Models (`team.model.js`)**: Defines the schema, indexes, and automated hooks for slugs/stats.
- **Validation (`team.validation.js`)**: Joi-based request validation.

## Data Flow
### Team Creation Lifecycle
1. **Pre-check**: Verify team name uniqueness and user eligibility (must not already be in a team).
2. **Branding**: Upload team logo/banner to ImageKit (outside transaction).
3. **Transaction**:
   - Create `Team` document.
   - Update `User` document (assign `teamId` and `TEAM_OWNER` role).
4. **Post-Process**: Invalidate user profile cache and clean up local temp files.

### Join Request Handing (Acceptance)
1. **Validate**: Check request status and team recruiting status.
2. **Transaction**:
   - Add player to `teamMembers` array (atomic limit check for 12 members).
   - Update `User` with `teamId` and `TEAM_PLAYER` role.
   - Update `JoinRequest` status to 'accepted'.
   - Reject other pending join requests for the same user (auto-cleanup).
3. **Cache**: Invalidate both the team details and the requester’s profile in Redis.

## API Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Fetch all teams (paginated/filtered) | Public |
| `POST` | `/create-team` | Create a new team with logo | Authenticated |
| `GET` | `/details/:teamId` | Get full team profile (with cache) | Public |
| `PUT` | `/update-team` | Update branding and socials | Owner/Manager |
| `PUT` | `/remove-member/:id` | Remove a member from the roster | Owner/Manager |
| `PUT` | `/leave-member` | Leave the current team | Members |
| `PUT` | `/transfer-owner` | Transfer captaincy to another member | Owner |
| `PUT` | `/manage-staff-role` | Promote/Demote members to Managers | Owner |
| `DELETE` | `/delete-team` | Soft delete team and clear member refs | Owner |

## State Management (Frontend)
The frontend uses **Zustand** (`useTeamStore.ts`) to manage team state globally.
- **Central Store**: Maintains `currentTeam`, `paginatedTeams`, and `joinRequests`.
- **Refetch Strategy**: 
  - `getTeamById(id, forceRefresh)` is used on page mount.
  - Manual triggers happen after mutations (e.g., updating roles or accepting requests).
- **Manual State Mutation**: The store manually updates the `currentTeam` or `joinRequests` array after successful API calls to provide instant UI feedback without a full reload.

## Cache Strategy
- **Shared Cache**: Team profile details are stored in Redis under the key `team_details:${teamId}` for 1 hour.
- **Consistency**: 
  - **Invalidation**: Every mutation (update, member change, delete) triggers an immediate `redis.del`.
  - **L2-L1 Sync**: User profile updates in the Auth service trigger a `syncUserInTeams` helper to keep denormalized `username`/`avatar` fields fresh in the Team model.
- **Self-Healing**: If a JSON parse error occurs during Redis retrieval, the key is automatically deleted, and data is refetched from the DB.

## Known Risks & Mitigation

### ✅ Fixed Risks

- **~~Data Consistency~~**: FIXED - The `teamMembers` array contains denormalized data (`username`, `avatar`). Previously, `syncUserInTeams` failures could lead to stale display data.
  - **Mitigation**: Implemented retry logic (max 3 attempts with exponential backoff) in `syncUserInTeamsWithRetry`. Critical failures are logged for manual intervention, but don't block the main operation.

- **~~Stale Cache~~**: FIXED - Previously, if `redis.del` failed during a mutation, users might see stale team details for up to 1 hour.
  - **Mitigation**: Implemented `invalidateCacheWithRetry` with 3 retry attempts and exponential backoff. Final fallback sets 1-second TTL to force near-immediate expiration if deletion fails.

- **~~Multi-User Sync~~**: FIXED - Two managers accepting requests simultaneously could hit the 12-member limit. Atomic `$expr` check mitigates this.
  - **Mitigation**: Added descriptive error messages with current team size and error codes (`TEAM_LIMIT_EXCEEDED`, `CONCURRENT_MODIFICATION`) for better frontend handling and user feedback.

- **~~Tight Coupling~~**: FIXED - `team.route.js` previously imported controllers directly from the `join-request` module.
  - **Mitigation**: Created dedicated `join-request.route.js` router. All join-request routes are now registered separately in `app.js` at the same `/api/v1/teams/:teamId/join-request` base path.

### Remaining Considerations

- **Network Partitions**: In rare cases where Redis is completely unavailable, the 1-second TTL fallback may also fail. Users would see stale data until cache naturally expires (1 hour).
- **Denormalization Lag**: If all 3 retry attempts fail for `syncUserInTeams`, team roster displays may show outdated username/avatar until the next profile update or manual intervention.

## Improvement Opportunities
- **Audit Logging**: Implement a history collection to track member changes (join/leave/kick/promote) for transparency.
- **Cache Resilience**: Implement a background "refresh-ahead" for popular teams to reduce cold-start latency.
- **Event-Driven Sync**: Replace the `syncUserInTeams` service call with an event-driven approach (e.g., EventEmitter or Message Queue) to further decouple Auth from Teams.
- **Observability**: Add metrics tracking for cache hit/miss rates, retry success rates, and sync failures to monitor system health.
