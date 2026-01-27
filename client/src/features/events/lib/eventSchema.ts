import { z } from "zod";

const prizeDistributionItemSchema = z.object({
    rank: z.number().min(1, "Rank must be at least 1"),
    amount: z.number().min(0, "Amount cannot be negative"),
    label: z.string().optional(),
});

export const eventSchema = z.object({
    title: z.string().min(3, "Mission title must be at least 3 characters"),
    game: z.string().min(2, "Game title is mandatory"),
    eventType: z.enum(["scrims", "tournament"]),
    startDate: z.string().min(1, "Commencement date required"),
    registrationEndsAt: z.string().min(1, "Registration lock date required"),
    slots: z.string().min(1, "Slot count required").regex(/^\d+$/, "Must be a numeric value"),
    category: z.enum(["solo", "duo", "squad"], {
        errorMap: () => ({ message: "Select engagement format" }),
    }),
    registrationMode: z.enum(["open", "invite-only"]),
    prizePool: z.string().regex(/^\d*$/, "Must be numeric").optional(),
    description: z.string().min(10, "Tactical description must be at least 10 characters"),
    status: z.enum(["registration-open", "registration-closed", "live", "completed"]),
    prizeDistribution: z.array(prizeDistributionItemSchema).min(1, "Reward matrix requires at least one entry"),
    image: z.any().optional(),
}).refine((data) => {
    const pool = Number(data.prizePool) || 0;
    const totalDistributed = data.prizeDistribution.reduce((acc, item) => acc + item.amount, 0);
    return totalDistributed <= pool;
}, {
    message: "Total reward distribution exceeds total bounty",
    path: ["prizeDistribution"],
});

export type EventFormValues = z.infer<typeof eventSchema>;