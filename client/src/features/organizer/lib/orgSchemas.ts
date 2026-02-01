import { z } from "zod";

export const orgSettingsSchema = z.object({
    name: z
        .string()
        .min(3, "Organization name must be at least 3 characters")
        .nonempty("Organization name is required"),

    tag: z
        .string()
        .regex(/^[A-Z0-9]{2,5}$/, "Tag must be 2-5 uppercase letters/numbers")
        .nonempty("Organization tag is required"),

    email: z
        .string()
        .email("Please enter a valid email address")
        .nonempty("Email is required"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .optional()
        .or(z.literal("")),

    isHiring: z.boolean(),

    socialLinks: z.object({
        discord: z.string().optional(),
        twitter: z.string().optional(),
        website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
        instagram: z.string().optional(),
        youtube: z.string().optional(),
    }),

    // File fields are handled separately or as custom validations if needed,
    // but for react-hook-form integration with file inputs, we often keep them out of the main data schema
    // or use z.custom<File>() if we want to validate them here.
    // Since update allows partial updates and we might not always upload files, we can make them optional.
    image: z.custom<File>((file) => file instanceof File).optional(),
    banner: z.custom<File>((file) => file instanceof File).optional(),
});

export const orgSchema = z.object({
    name: z
        .string()
        .min(3, "Organization name must be at least 3 characters")
        .nonempty("Organization name is required"),

    tag: z
        .string()
        .regex(/^[A-Z]{2,5}$/, "Tag must be 2-5 uppercase letters (e.g. 'KRM')")
        .nonempty("Organization tag is required"),

    email: z
        .string()
        .email("Please enter a valid email address")
        .nonempty("Email is required"),

    image: z.custom<File>((file) => file instanceof File, {
        message: "Organization logo is required",
    }),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .nonempty("Description is required"),
});

// type inference for typescript
export type OrgFormSchema = z.infer<typeof orgSchema>;
export type OrgSettingsFormSchema = z.infer<typeof orgSettingsSchema>;
