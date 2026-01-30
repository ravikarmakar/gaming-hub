import { z } from "zod";

export const playerSettingsSchema = z.object({
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(30, { message: "Username must be less than 30 characters" }),
    bio: z
        .string()
        .max(500, { message: "Bio must be less than 500 characters" })
        .optional()
        .or(z.literal("")),
    esportsRole: z.enum(["rusher", "sniper", "support", "igl", "coach", "player"], {
        required_error: "Please select an esports role",
    }),
});

export type PlayerSettingsValues = z.infer<typeof playerSettingsSchema>;
