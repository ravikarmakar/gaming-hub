import { z } from "zod";

export const signupSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters"),

    email: z.string().email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
        ),

    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
});

export const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must only contain digits"),
});

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(
                /[^A-Za-z0-9]/,
                "Password must contain at least one special character"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignupSchemaType = z.infer<typeof signupSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpSchemaType = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;