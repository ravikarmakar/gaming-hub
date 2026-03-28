import { TournamentFormValues } from "./tournamentSchema";

/**
 * Prepares FormData for tournament creation/update.
 * Extracts logic from useTournamentForm to keep the hook clean and testable.
 */
export const prepareTournamentFormData = (data: TournamentFormValues): FormData => {
    const fd = new FormData();
    const isScrims = data.eventType === "scrims";

    // Create a local copy to avoid mutating the original data if needed,
    // though here we are mostly just reading from it.
    const submissionData = { ...data };

    // Final safety adjustment for scrims
    if (isScrims) {
        submissionData.registrationEndsAt = submissionData.startDate;
    }

    Object.entries(submissionData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // Skip roadmap-related fields for scrims to keep the payload clean
        if (isScrims) {
            const irrelevantFields = [
                "roadmap",
                "hasRoadmap",
                "hasInvitedTeams",
                "invitedTeams",
                "invitedTeamsRoadmap",
                "invitedRoundMappings",
                "hasT1SpecialRoadmap",
                "t1SpecialRoadmap",
                "t1SpecialRoundMappings"
            ];
            if (irrelevantFields.includes(key)) return;
        }

        // Handle specific field mappings and serialization
        switch (key) {
            case "slots":
                fd.append("maxSlots", String(value));
                fd.append("slots", String(value));
                break;

            case "prizeDistribution":
            case "roadmap":
            case "invitedTeamsRoadmap":
            case "invitedRoundMappings":
            case "t1SpecialRoadmap":
            case "t1SpecialRoundMappings":
                // Only append if the corresponding "has" flag is true
                const hasKey = `has${key.charAt(0).toUpperCase()}${key.slice(1)}`.replace('RoadmapRoadmap', 'Roadmap');
                const shouldAppend = (submissionData as any)[hasKey] ?? true;
                if (shouldAppend) {
                    fd.append(key, JSON.stringify(value));
                }
                break;

            case "invitedTeams":
                if (submissionData.hasInvitedTeams && Array.isArray(value)) {
                    const teamIds = value.map(t => (typeof t === 'string' ? t : (t.teamId || t._id || t)));
                    fd.append(key, JSON.stringify(teamIds));
                }
                break;

            case "maxInvitedSlots":
                if (submissionData.hasInvitedTeams) {
                    fd.append("maxInvitedSlots", String(value || 0));
                }
                break;

            case "image":
                if (value instanceof File) {
                    fd.append("image", value);
                }
                break;

            case "eventType":
            case "category":
            case "status":
                fd.append(key, String(value).toLowerCase());
                break;

            case "isPaid":
                fd.append("isPaid", String(value));
                break;

            default:
                // For all other fields like title, game, description, startDate, etc.
                // Avoid re-appending 'image' if it was a URL string (not a File)
                if (key !== "image") {
                    fd.append(key, String(value));
                }
                break;
        }
    });

    return fd;
};
