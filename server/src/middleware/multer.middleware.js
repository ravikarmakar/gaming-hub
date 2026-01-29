import multer from "multer";
import path from "path";
import fs from "fs";

// Use absolute path for the uploads directory
const uploadDir = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a clean, unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "-") // Replace non-alphanumeric with hyphens
      .replace(/-+/g, "-")         // Remove duplicate hyphens
      .replace(/^-|-$/g, "");      // Trim hyphens from start/end

    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Stricter file filter for images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed."), false);
  }
};

// Export the optimized upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
});
