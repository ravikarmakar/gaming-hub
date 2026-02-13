import { Joi } from "express-validation";

export const registerValidation = {
    body: Joi.object({
        username: Joi.string().min(3).max(30).required().messages({
            "string.empty": "Username is required",
            "string.min": "Username must be at least 3 characters",
            "string.max": "Username must be less than 30 characters",
        }),
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
        }),
        password: Joi.string()
            .min(8)
            .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d\\s]).{8,}$"))
            .required()
            .messages({
                "string.empty": "Password is required",
                "string.min": "Password must be at least 8 characters",
                "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            }),
    }),
};

export const loginValidation = {
    body: Joi.object({
        identifier: Joi.string().required().messages({
            "string.empty": "Email or Username is required",
        }),
        password: Joi.string().required().messages({
            "string.empty": "Password is required",
        }),
    }),
};

export const sendResetOtpValidation = {
    body: Joi.object({
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
        }),
    }),
};

export const verifyResetOtpValidation = {
    body: Joi.object({
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
        }),
        otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
            "string.empty": "OTP is required",
            "string.length": "OTP must be exactly 6 digits",
            "string.pattern.base": "OTP must contain only numeric digits",
        }),
    }),
};

export const resetPasswordValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
            "string.length": "OTP must be exactly 6 digits",
            "string.pattern.base": "OTP must contain only numeric digits",
        }),
        newPassword: Joi.string()
            .min(8)
            .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d\\s]).{8,}$"))
            .required()
            .messages({
                "string.empty": "New password is required",
                "string.min": "Password must be at least 8 characters",
                "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            }),
    }),
};

export const verifyEmailValidation = {
    body: Joi.object({
        otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
            "string.empty": "OTP is required",
            "string.length": "OTP must be exactly 6 digits",
            "string.pattern.base": "OTP must contain only numeric digits",
        }),
    }),
};

export const updateProfileValidation = {
    body: Joi.object({
        username: Joi.string().min(3).max(30).optional().messages({
            "string.min": "Username must be at least 3 characters",
            "string.max": "Username must be less than 30 characters",
        }),
        bio: Joi.string().max(500).allow("").optional().messages({
            "string.max": "Bio must be less than 500 characters",
        }),
        esportsRole: Joi.string().valid("rusher", "sniper", "support", "igl", "coach", "player").optional().messages({
            "any.only": "Please select a valid esports role",
        }),
        region: Joi.string().valid("na", "eu", "sea", "sa", "mea", "global").optional().messages({
            "any.only": "Please select a valid region",
        }),
        country: Joi.string().max(100).optional().allow(""),
        isLookingForTeam: Joi.boolean().optional(),
        gameIgn: Joi.string().max(30).allow("").optional(),
        gameUid: Joi.string().max(30).allow("").optional(),
        gender: Joi.string().valid("male", "female", "other", "prefer_not_to_say").optional(),
        dob: Joi.date().iso().max("now").optional().allow(null, ""),
        phoneNumber: Joi.string().max(20).allow("").optional(),
    }),
};

export const updateSettingsValidation = {
    body: Joi.object({
        allowChallenges: Joi.boolean().optional(),
        allowMessages: Joi.boolean().optional(),
        notifications: Joi.object({
            platform: Joi.boolean().optional(),
            email: Joi.boolean().optional(),
            sms: Joi.boolean().optional(),
        }).optional(),
    }),
};

export const changePasswordValidation = {
    body: Joi.object({
        currentPassword: Joi.string().required().messages({
            "string.empty": "Current password is required",
        }),
        newPassword: Joi.string()
            .min(8)
            .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d\\s]).{8,}$"))
            .required()
            .messages({
                "string.empty": "New password is required",
                "string.min": "Password must be at least 8 characters",
                "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            }),
    }),
};
