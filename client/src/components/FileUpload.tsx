import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, Check, AlertTriangle, FileIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FileUploadProps {
  label?: string;
  name?: string;
  id?: string;
  accept?: string;
  maxSize?: number;
  error?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  name,
  id,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  error,
  onChange,
  value,
  hint,
  required = false,
  disabled = false,
  className,
  compact = false,
}) => {
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalErrors, setInternalErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalFile(value || null);
  }, [value]);

  const validateAndPreviewFile = useCallback(
    (file: File | null) => {
      const newErrors: string[] = [];

      if (file) {
        if (file.size > maxSize) {
          newErrors.push(
            `File size exceeds the limit of ${Math.round(
              maxSize / (1024 * 1024)
            )}MB.`
          );
        }

        // Validate file type
        const acceptedTypesArray = accept.split(",").map((type) => type.trim());
        const isImageAccept = acceptedTypesArray.some(
          (type) => type === "image/*" || type.startsWith("image/")
        );

        if (isImageAccept && !file.type.startsWith("image/")) {
          newErrors.push("Only image files are supported for preview.");
        } else if (
          !acceptedTypesArray.includes(file.type) &&
          !isImageAccept &&
          !acceptedTypesArray.includes("application/pdf")
        ) {
          // More robust check for specific types if not image/*
          newErrors.push(
            `File type '${file.type
            }' not supported. Accepted: ${acceptedTypesArray.join(", ")}`
          );
        }

        // Create preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          // For non-image files (e.g., PDFs), no preview image
          setPreview(null);
        }
      } else {
        setPreview(null);
      }

      setInternalErrors(newErrors);
      onChange(newErrors.length > 0 ? null : file); // Notify react-hook-form
    },
    [maxSize, accept, onChange]
  );

  // Handle file input change event
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setInternalFile(file); // Update internal state immediately
    validateAndPreviewFile(file); // Validate and trigger onChange
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    setInternalFile(file); // Update internal state immediately
    validateAndPreviewFile(file); // Validate and trigger onChange
  };

  // Remove the selected file
  const removeFile = () => {
    setInternalFile(null);
    setPreview(null);
    setInternalErrors([]);
    onChange(null); // Notify react-hook-form about removal

    // Reset the native input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Combine internal errors with errors from react-hook-form/zod
  const displayedErrors = [...internalErrors, ...(error ? [error] : [])];
  const isImage = internalFile?.type.startsWith("image/");
  const showFileIcon = !isImage || !preview; // Show generic file icon if not image or no preview

  return (
    <div className={`${compact ? "space-y-1" : "space-y-1.5"} ${className || ""}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id || name}
            className="block text-sm font-medium text-gray-200"
          >
            {label} {required && <span className="text-purple-400">*</span>}
          </label>

          {hint && (
            <span className="text-xs text-gray-400 transition-colors duration-200 group-hover:text-gray-300">
              {hint}
            </span>
          )}
        </div>
      )}

      <div className="relative group">
        {/* Gradient border effect (visual flair) */}
        <div
          className={`
            absolute -inset-0.5 rounded-lg blur-sm opacity-0 transition-opacity duration-300
            ${isDragging ? "opacity-50" : "group-hover:opacity-20"}
            bg-gradient-to-r from-purple-600 to-blue-600
            ${disabled ? "hidden" : ""}
          `}
        ></div>

        {/* Upload area - styled like a shadcn Input */}
        <div
          className={`
            relative bg-gray-900/80 rounded-lg overflow-hidden
            ${displayedErrors.length > 0
              ? "border border-red-500/50"
              : "border border-gray-700 group-hover:border-gray-600"
            }
            ${isDragging
              ? "border-purple-500/70 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
              : ""
            }
            transition-all duration-300
            ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          {/* Hidden native file input */}
          <input
            ref={inputRef}
            type="file"
            id={id || name}
            name={name}
            accept={accept}
            onChange={handleInputChange}
            className="sr-only" // Hide visually but keep accessible
            aria-invalid={displayedErrors.length > 0}
            aria-describedby={
              displayedErrors.length > 0 ? `${name}-error` : undefined
            }
            disabled={disabled}
          />

          {!internalFile ? (
            <motion.div
              whileHover={disabled ? {} : { scale: 1.01 }}
              className={`flex flex-col items-center justify-center ${compact ? "p-1.5" : "p-6"}`}
            >
              <div className={`rounded-full bg-purple-500/10 ${compact ? "p-1.5 mb-1" : "p-3 mb-4"}`}>
                <Upload size={compact ? 14 : 24} className="text-purple-400" />
              </div>
              <p className={`mb-0.5 text-gray-300 ${compact ? "text-[10px]" : "text-sm"}`}>
                <span className="font-medium text-purple-400">
                  {compact ? "Upload" : "Click to upload"}
                </span>{" "}
                {!compact && "or drag and drop"}
              </p>
              {!compact && (
                <p className="text-xs text-gray-500">
                  {accept.includes("image")
                    ? "SVG, PNG, JPG or GIF"
                    : "Supported files"}
                  {maxSize
                    ? ` (max. ${Math.round(maxSize / (1024 * 1024))}MB)`
                    : ""}
                </p>
              )}
            </motion.div>
          ) : (
            <div className={compact ? "p-2" : "p-4"}>
              <div className="flex items-center gap-4">
                {showFileIcon ? (
                  <div className={`flex items-center justify-center flex-shrink-0 bg-gray-800 rounded-lg ${compact ? "w-10 h-10" : "w-16 h-16"}`}>
                    <FileIcon size={compact ? 16 : 24} className="text-gray-400" />
                  </div>
                ) : (
                  <div className={`flex-shrink-0 overflow-hidden bg-gray-800 rounded-lg ${compact ? "w-10 h-10" : "w-16 h-16"}`}>
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={preview || ""} // preview will be null if showFileIcon is true
                      alt="File preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {internalFile.name}
                    </p>

                    {!disabled && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={removeFile}
                        className="p-1 text-gray-400 transition-colors bg-gray-800 rounded-full hover:bg-gray-700 hover:text-red-400"
                      >
                        <X size={16} />
                      </motion.button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-gray-400">
                      {(internalFile.size / 1024).toFixed(1)} KB
                    </div>

                    {displayedErrors.length === 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <Check size={12} />
                        <span>Ready to upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error message with animation */}
      <AnimatePresence>
        {displayedErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 space-y-1"
          >
            {displayedErrors.map((errMsg, idx) => (
              <p
                key={idx}
                id={`${name}-error-${idx}`}
                className="flex items-center gap-1.5 text-xs text-red-400"
                role="alert"
              >
                <AlertTriangle size={12} className="flex-shrink-0" />
                <span>{errMsg}</span>
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;