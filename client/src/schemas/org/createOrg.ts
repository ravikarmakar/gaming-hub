// validation/orgSchema.ts
import { z } from "zod";

export const orgSchema = z.object({
  orgName: z
    .string()
    .min(3, "Organization name must be at least 3 characters")
    .nonempty("Organization name is required"),

  orgTag: z
    .string()
    .regex(/^[A-Z]{2,5}$/, "Tag must be 2-5 uppercase letters (e.g. 'KRM')")
    .nonempty("Organization tag is required"),

  orgEmail: z
    .string()
    .email("Please enter a valid email address")
    .nonempty("Email is required"),

  logo: z.custom<File>((file) => file instanceof File, {
    message: "Organization logo is required",
  }),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .nonempty("Description is required"),
});

// type inference for typescript
export type OrgFormSchema = z.infer<typeof orgSchema>;
