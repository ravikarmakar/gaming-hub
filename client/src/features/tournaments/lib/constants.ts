export const registrationStatusOptions = [
    { value: "registration-open", label: "Registration Open" },
    { value: "registration-closed", label: "Registration Closed" },
    { value: "live", label: "Live" },
];

export const tournamentTypeOptions = [
    { value: "tournament", label: "Tournament" },
    { value: "scrims", label: "Scrims" },
    { value: "invited-tournament", label: "Invited Tournament" },
    { value: "t1-special", label: "T1 Special" },
];

export const categoryOptions = [
    { value: "solo", label: "Solo" },
    { value: "duo", label: "Duo" },
    { value: "squad", label: "Squad" },
];

export const registrationModeOptions = [
    { value: "open", label: "Open" },
    { value: "invite-only", label: "Invite-only" },
];

export const GAMES_MAPS = {
    "free fire": ["Bermuda", "Purgatory", "Kalahari", "Alpine", "Nexterra"],
    "bgmi": ["Erangel", "Miramar", "Sanhok", "Vikendi", "Nusa", "Karakin"],
    "valorant": ["Ascent", "Bind", "Haven", "Icebox", "Breeze", "Fracture", "Pearl", "Lotus", "Sunset"]
} as const;
