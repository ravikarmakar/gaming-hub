import { z } from "zod";

const prizeDistributionItemSchema = z.object({
    rank: z.number().min(1, "Rank must be at least 1"),
    amount: z.number().min(0, "Amount cannot be negative"),
    label: z.string().optional(),
});

const roadmapItemSchema = z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    isFinale: z.boolean().optional(),
    isLeague: z.boolean().optional(),
    leagueType: z.enum(["12-teams", "18-teams"]).optional(),
    grandFinaleType: z.string().optional(),
    groups: z.string().optional(),
    // groupSize: z.union([z.string(), z.number()]).optional(),
});

const invitedRoundMappingSchema = z.object({
    startRound: z.number().min(0),
    endRound: z.number().min(0),
    targetMainRound: z.number().min(0),
});

export const eventSchema = z.object({
    title: z.string().min(3, "Tournament title must be at least 3 characters"),
    game: z.string().min(2, "Game name is required"),
    eventType: z.enum(["scrims", "tournament", "invited-tournament"]),
    isPaid: z.boolean(),
    startDate: z.string().min(1, "Start date is required"),
    registrationEndsAt: z.string().nullable().optional(),
    slots: z.coerce.string().min(1, "Player/Team count is required").regex(/^\d+$/, "Must be a number"),
    category: z.enum(["solo", "duo", "squad"], {
        errorMap: () => ({ message: "Select tournament format" }),
    }),
    registrationMode: z.enum(["open", "invite-only"]),
    prizePool: z.union([z.string(), z.number()]).optional(),
    entryFee: z.union([z.string(), z.number()]).optional(),
    matchCount: z.coerce.number().optional(),
    map: z.array(z.string()).optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    status: z.enum(["registration-open", "registration-closed", "live", "completed"]),
    prizeDistribution: z.array(prizeDistributionItemSchema).optional(),
    hasRoadmap: z.boolean().optional(),
    roadmap: z.array(roadmapItemSchema).optional(),
    hasInvitedTeams: z.boolean().optional(),
    invitedTeams: z.array(z.object({
        teamName: z.string().min(1, "Team name is required"),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
    })).optional(),
    maxInvitedSlots: z.union([z.string(), z.number()]).optional(),
    invitedTeamsRoadmap: z.array(roadmapItemSchema).optional(),
    invitedRoundMappings: z.array(invitedRoundMappingSchema).optional(),
    hasT1SpecialRoadmap: z.boolean().optional(),
    t1SpecialRoadmap: z.array(roadmapItemSchema).optional(),
    t1SpecialRoundMappings: z.array(invitedRoundMappingSchema).optional(),
    roadmaps: z.array(z.object({
        type: z.enum(["tournament", "invitedTeams", "t1-special"]),
        data: z.array(roadmapItemSchema)
    })).optional(),
    image: z.any()
        .refine((file) => {
            if (!file || !(file instanceof File)) return true;
            return file.size <= 10 * 1024 * 1024;
        }, "File too large (max 10MB)")
        .optional(),
}).refine((data) => {
    if (data.isPaid && !data.entryFee) {
        return false;
    }
    return true;
}, {
    message: "Entry fee is required for paid events",
    path: ["entryFee"],
}).refine((data) => {
    const pool = Number(data.prizePool) || 0;
    const totalDistributed = data.prizeDistribution?.reduce((acc, item) => acc + item.amount, 0) || 0;
    return totalDistributed <= pool;
}, {
    message: "Total reward distribution exceeds total bounty",
    path: ["prizeDistribution"],
}).refine((data) => {
    if (data.eventType !== "scrims" && !data.registrationEndsAt) {
        return false;
    }
    return true;
}, {
    message: "Registration deadline is required",
    path: ["registrationEndsAt"],
}).refine((data) => {
    const start = new Date(data.startDate);
    const registrationEnd = data.registrationEndsAt ? new Date(data.registrationEndsAt) : null;

    if (data.eventType === "scrims") {
        if (!registrationEnd) return true; // Scrims don't strictly require registrationEnd in UI
        return registrationEnd <= start;
    }

    if (!registrationEnd) return false; // Should be caught by previous refine
    return registrationEnd < start;
}, {
    message: "Tournament must start after the registration deadline",
    path: ["startDate"],
}).refine((data) => {
    if (data.eventType !== "scrims") {
        return data.prizeDistribution && data.prizeDistribution.length > 0;
    }
    return true;
}, {
    message: "Prize distribution is required",
    path: ["prizeDistribution"],
});

export type EventFormValues = z.infer<typeof eventSchema>;