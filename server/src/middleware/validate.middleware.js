import { validate } from "express-validation";

export const validateRequest = (schema) =>
  validate(schema, {}, { abortEarly: false });
