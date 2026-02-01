import { Joi } from "express-validation";
import { Roles } from "../constants/roles.js";

// Common regex or constraints
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const createTeamValidation = {
    body: Joi.object({
        teamName: Joi.string().min(3).max(50).required().messages({
            "string.empty": "Team name is required",
            "string.min": "Team name must be at least 3 characters",
            "string.max": "Team name must look real",
        }),
        bio: Joi.string().max(300).allow("").optional(),
        tag: Joi.string().min(2).max(6).required(),
        region: Joi.string().required(), // You might want a valid list of regions here
    }),
};

export const updateTeamValidation = {
    body: Joi.object({
        teamName: Joi.string().min(3).max(50).optional(),
        bio: Joi.string().max(300).allow("").optional(),
        tag: Joi.string().min(2).max(6).optional(),
        region: Joi.string().optional(),
        isRecruiting: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(), // Handled specifically in controller for FormData
        twitter: Joi.string().uri().allow("").optional(),
        discord: Joi.string().uri().allow("").optional(), // Discord invite link pattern could be stricter
        youtube: Joi.string().uri().allow("").optional(),
        instagram: Joi.string().uri().allow("").optional(),
    }).unknown(true), // Content-Type multipart/form-data might send other fields or files, allow unknown
};

export const addMembersValidation = {
    body: Joi.object({
        members: Joi.array().items(objectId).min(1).required().messages({
            "array.min": "Please provide at least one team member",
        }),
        teamId: objectId.optional(),
    }),
};

export const manageMemberRoleValidation = {
    body: Joi.object({
        memberId: objectId.required(),
        role: Joi.string().required().valid("igl", "player", "sniper", "rusher", "support", "coach", "manager", "substitute", "content_creator").messages({
            "any.only": "Invalid role specified",
        }),
    }).unknown(true),
};

export const manageStaffRoleValidation = {
    body: Joi.object({
        memberId: objectId.required(),
        action: Joi.string().valid("promote", "demote").required(),
    }).unknown(true),
};

export const transferOwnerValidation = {
    body: Joi.object({
        memberId: objectId.required(),
    }).unknown(true),
};

export const manageJoinRequestValidation = {
    params: Joi.object({
        requestId: objectId.required(),
    }),
    body: Joi.object({
        action: Joi.string().valid("accepted", "rejected").required(),
    }).unknown(true),
};
