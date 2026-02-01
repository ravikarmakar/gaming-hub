import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

export const teamSchema = z.object({
    teamName: z.string().min(3, "Team name must be at least 3 characters").max(50, "Max 50 characters"),
    tag: z.string().min(2, "Tag must be at least 2 characters").max(5, "Max 5 characters").toUpperCase(),
    region: z.enum(["NA", "EU", "ASIA", "SEA", "SA", "OCE", "MENA", "INDIA"], {
        required_error: "Please select a region",
    }),
    bio: z.string().max(300, "Bio must not exceed 300 characters").optional(),
    isRecruiting: z.boolean().default(false).optional(),

    // Social Links (Optional)
    twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
    discord: z.string().optional().or(z.literal("")),
    youtube: z.string().url("Invalid YouTube URL").optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")), // Instagram URLs can be weird, simple string is safer or loose regex

    // Files are optional for updates
    image: z
        .any()
        .refine((file) => !file || file instanceof File, "Must be a file")
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
        .refine(
            (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        )
        .optional(),

    banner: z
        .any()
        .refine((file) => !file || file instanceof File, "Must be a file")
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max banner size is 5MB.`)
        .refine(
            (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        )
        .optional(),
});

export type TeamForm = z.infer<typeof teamSchema>;
