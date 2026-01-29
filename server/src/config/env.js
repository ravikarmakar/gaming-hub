import Joi from "joi";
import dotenv from "dotenv";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
    PORT: Joi.number().default(4000),
    MONGO_URI: isTest ? Joi.string().optional() : Joi.string().required(),
    REDIS_URL: Joi.string().optional(),
    ACCESS_TOKEN_SECRET: isTest ? Joi.string().default("test_secret") : Joi.string().required(),
    REFRESH_TOKEN_SECRET: isTest ? Joi.string().default("test_refresh_secret") : Joi.string().required(),
    SENDER_EMAIL: isTest ? Joi.string().email().optional() : Joi.string().email().required(),
    BREVO_SMTP_HOST: isTest ? Joi.string().optional() : Joi.string().required(),
    BREVO_SMTP_PORT: isTest ? Joi.number().optional() : Joi.number().required(),
    BREVO_SMTP_USER: isTest ? Joi.string().optional() : Joi.string().required(),
    BREVO_SMTP_PASS: isTest ? Joi.string().optional() : Joi.string().required(),
    GOOGLE_CLIENT_ID: isTest ? Joi.string().optional() : Joi.string().required(),
    GOOGLE_CLIENT_SECRET: isTest ? Joi.string().optional() : Joi.string().required(),
    DISCORD_CLIENT_ID: isTest ? Joi.string().optional() : Joi.string().required(),
    DISCORD_CLIENT_SECRET: isTest ? Joi.string().optional() : Joi.string().required(),
    DISCORD_REDIRECT_URI: isTest ? Joi.string().uri().optional() : Joi.string().uri().required(),
}).unknown().required();

const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const env = value;
