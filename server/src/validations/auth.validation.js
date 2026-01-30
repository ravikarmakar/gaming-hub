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
        password: Joi.string().min(6).required().messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters",
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
        otp: Joi.string().length(6).required().messages({
            "string.empty": "OTP is required",
            "string.length": "OTP must be exactly 6 digits",
        }),
    }),
};

export const resetPasswordValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required(),
        newPassword: Joi.string().min(6).required(),
    }),
};

export const verifyEmailValidation = {
    body: Joi.object({
        otp: Joi.string().required().messages({
            "string.empty": "OTP is required",
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
    }),
};
