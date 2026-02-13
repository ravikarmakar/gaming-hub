import { validate } from "express-validation";
import fs from "fs";

const cleanupFiles = (req) => {
  if (req.file) {
    try { fs.unlinkSync(req.file.path); } catch (e) { }
  }
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    files.forEach(file => {
      try { fs.unlinkSync(file.path); } catch (e) { }
    });
  }
};

export const validateRequest = (schema) => {
  const validationMiddleware = validate(schema, {}, { abortEarly: false });

  return (req, res, next) => {
    validationMiddleware(req, res, (err) => {
      if (err) {
        // cleanup files if validation fails
        cleanupFiles(req);
        return next(err);
      }
      next();
    });
  };
};
