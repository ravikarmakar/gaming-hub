import { Joi } from "express-validation";
import { Roles } from "../constants/roles.js";

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const createOrgValidation = {
    body: Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        description: Joi.string().max(1000).required(),
        tag: Joi.string().min(2).max(6).required(),
    }),
};

export const updateOrgValidation = {
    params: Joi.object({
        orgId: objectId.required(),
    }),
    body: Joi.object({
        name: Joi.string().min(3).max(50).optional(),
        email: Joi.string().email().optional(),
        description: Joi.string().max(1000).optional(),
        tag: Joi.string().min(2).max(6).optional(),
        isHiring: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
        socialLinks: Joi.alternatives().try(Joi.string(), Joi.object()).optional(), // Handled for JSON parsing in controller
    }).unknown(true),
};

export const addStaffValidation = {
    params: Joi.object({
        orgId: objectId.required(),
    }),
    body: Joi.object({
        staff: Joi.array().items(objectId).min(1).required(),
    }),
};

export const updateStaffRoleValidation = {
    params: Joi.object({
        orgId: objectId.required(),
    }),
    body: Joi.object({
        userId: objectId.required(),
        newRole: Joi.string().valid(...Object.values(Roles.ORG)).required(),
    }),
};

export const removeStaffValidation = {
    params: Joi.object({
        orgId: objectId.required(),
        id: objectId.required(),
    }),
};

export const joinOrgValidation = {
    params: Joi.object({
        orgId: objectId.required(),
    }),
    body: Joi.object({
        message: Joi.string().max(500).allow("").optional(),
    }),
};

export const manageJoinRequestValidation = {
    params: Joi.object({
        orgId: objectId.required(), // Some routes might not have this in path, but usually for nested routes they do.
        requestId: objectId.required(),
    }).unknown(true), // Allow other params if needed
    body: Joi.object({
        action: Joi.string().valid("accepted", "rejected").required(),
    }),
};

export const transferOwnershipValidation = {
    params: Joi.object({
        orgId: objectId.required(),
    }),
    body: Joi.object({
        newOwnerId: objectId.required(),
    }),
};
