import multer from "multer";
import path from "path";
import fs from "fs";

// Use absolute path for the uploads directory - PRIVATE directory, not public
const uploadDir = path.join(process.cwd(), "uploads", "temp");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Validate file content by checking magic numbers (file signatures)
 * Prevents malicious files with spoofed extensions/MIME types
 * @param {Buffer} buffer - File buffer to validate
 * @param {string} mimetype - Expected MIME type
 * @returns {boolean} - True if valid, false otherwise
 */
const validateFileContent = (buffer, mimetype) => {
  if (!buffer || buffer.length < 4) return false;

  const magicNumbers = {
    "image/jpeg": [
      [0xFF, 0xD8, 0xFF] // JPEG signature
    ],
    "image/png": [
      [0x89, 0x50, 0x4E, 0x47] // PNG signature
    ],
    "image/webp": [
      // WebP uses RIFF container: 'RIFF' at offset 0, 'WEBP' at offset 8
      // We check for RIFF first, then WEBP
      [0x52, 0x49, 0x46, 0x46]
    ],
    "application/pdf": [
      [0x25, 0x50, 0x44, 0x46] // %PDF signature
    ]
  };

  const signatures = magicNumbers[mimetype];
  if (!signatures) return false;

  // Special handling for WebP to check for 'WEBP' at offset 8
  if (mimetype === "image/webp") {
    // Check RIFF header first (offset 0)
    const isRiff = signatures.some(signature =>
      signature.every((byte, index) => buffer[index] === byte)
    );
    if (!isRiff) return false;

    // Check 'WEBP' at offset 8
    if (buffer.length < 12) return false;
    const webpSignature = [0x57, 0x45, 0x42, 0x50]; // 'WEBP'
    return webpSignature.every((byte, index) => buffer[index + 8] === byte);
  }

  // Check if buffer matches any of the valid signatures for this MIME type
  return signatures.some(signature => {
    return signature.every((byte, index) => buffer[index] === byte);
  });
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a clean, unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();

    // START: Extension Validation
    // Ensure the extension matches the mimetype to prevent spoofing
    const mimeToExt = {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"]
    };

    const validExts = mimeToExt[file.mimetype];
    if (!validExts || !validExts.includes(ext)) {
      return cb(new Error("Invalid file extension for declared MIME type"));
    }
    // END: Extension Validation

    let baseName = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "-") // Replace non-alphanumeric with hyphens
      .replace(/-+/g, "-")         // Remove duplicate hyphens
      .replace(/^-|-$/g, "");      // Trim hyphens from start/end

    // Handle edge case: if baseName becomes empty after sanitization
    if (!baseName || baseName.length === 0) {
      baseName = "upload";
    }

    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Stricter file filter for images and PDFs
const fileFilter = (req, file, cb) => {
  // Note: "image/jpg" is NOT a valid MIME type; only "image/jpeg" is valid
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    // MIME type check passed, will validate actual content after upload
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

/**
 * Middleware to validate uploaded file content using magic numbers
 * Use this AFTER multer middleware to verify file integrity
 * Usage: upload.single('file'), validateUploadedFileContent, yourController
 */
export const validateUploadedFileContent = (req, res, next) => {
  // Skip if no file was uploaded
  if (!req.file && !req.files) {
    return next();
  }

  const filesToValidate = [];

  // Handle single file upload
  if (req.file) {
    filesToValidate.push(req.file);
  }

  // Handle multiple file upload
  if (req.files) {
    if (Array.isArray(req.files)) {
      filesToValidate.push(...req.files);
    } else {
      // Handle fields upload (object with field names as keys)
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          filesToValidate.push(...fileArray);
        }
      });
    }
  }

  // Helper to safely delete a file
  const safeDelete = (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Failed to delete file ${filePath}:`, err);
    }
  };

  // Helper to cleanup ALL uploaded files in this request
  const cleanupAllFiles = () => {
    filesToValidate.forEach(file => safeDelete(file.path));
  };

  // Validate each file's content
  for (const file of filesToValidate) {
    let fd;
    try {
      // Read only the first 12 bytes for header validation (12 bytes is enough for WebP check)
      const buffer = Buffer.alloc(12);
      fd = fs.openSync(file.path, 'r');
      const bytesRead = fs.readSync(fd, buffer, 0, 12, 0);

      // Close file descriptor immediately after reading to prevent descriptor leaks
      fs.closeSync(fd);
      fd = null; // Clear fd so finally block doesn't try to close it again

      const isValid = validateFileContent(buffer.slice(0, bytesRead), file.mimetype);

      if (!isValid) {
        // Cleanup ALL files (including valid ones) because the request is rejected
        cleanupAllFiles();
        return res.status(400).json({
          success: false,
          message: `File validation failed: ${file.originalname} does not match its declared type.`
        });
      }
    } catch (error) {
      // Clean up ALL files on error
      if (fd) try { fs.closeSync(fd); } catch (e) { }
      cleanupAllFiles();
      return res.status(500).json({
        success: false,
        message: "Error validating uploaded file."
      });
    } finally {
      if (fd) {
        try { fs.closeSync(fd); } catch (e) {
          console.error(`Failed to close file descriptor for ${file.path}:`, e);
        }
      }
    }
  }

  next();
};
