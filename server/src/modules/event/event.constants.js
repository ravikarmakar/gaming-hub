export const registrationStatusEnum = [
    "registration-open",
    "registration-closed",
    "live",
];

export const eventProgressEnum = [
    "pending",
    "ongoing",
    "completed",
];

export const eventTypeEnum = [
    "scrims",
    "tournament",
    "invited-tournament",
    "t1-special",
];

export const eventCategoryEnum = [
    "solo",
    "duo",
    "squad",
];

export const registrationModeEnum = [
    "open",
    "invite-only",
];

export const eventRoadmapTypeEnum = [
    "tournament",
    "invitedTeams",
    "t1-special",
];

export const GAMES_MAPS = {
    "free fire": ["Bermuda", "Purgatory", "Kalahari", "Alpine", "Nexterra"],
    "bgmi": ["Erangel", "Miramar", "Sanhok", "Vikendi", "Nusa", "Karakin"],
    "valorant": ["Ascent", "Bind", "Haven", "Icebox", "Breeze", "Fracture", "Pearl", "Lotus", "Sunset"]
};

export const REQUIRED_EVENT_FIELDS = [
  "title",
  "game",
  "startDate",
  "registrationEndsAt",
  "slots",
  "category",
  "registrationMode",
];