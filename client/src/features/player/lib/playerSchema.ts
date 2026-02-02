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
    region: z.enum(["na", "eu", "sea", "sa", "mea", "global"], {
        required_error: "Please select your region",
    }),
    country: z.string().optional().or(z.literal("")),
    isLookingForTeam: z.boolean(),
    gameIgn: z.string().max(30, { message: "IGN must be less than 30 characters" }).optional().or(z.literal("")),
    gameUid: z.string().max(30, { message: "UID must be less than 30 characters" }).optional().or(z.literal("")),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
    dob: z.string().optional().or(z.literal("")),
    phoneNumber: z.string().max(20, { message: "Phone number too long" }).optional().or(z.literal("")),
    socialLinks: z.object({
        discord: z.string().optional().or(z.literal("")),
        twitter: z.string().optional().or(z.literal("")),
        instagram: z.string().optional().or(z.literal("")),
        youtube: z.string().optional().or(z.literal("")),
        website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    }).optional(),
});

export type PlayerSettingsValues = z.infer<typeof playerSettingsSchema>;
