import React, { useState, useRef } from "react";
import { Upload, X, Check, AlertTriangle, FileIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FileUploadProps {
  label: string;
  name: string;
  id?: string;
  accept?: string;
  maxSize?: number; // in bytes
  error?: string[] | null;
  onChange: (file: File | null) => void;
  hint?: string;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  name,
  id,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  error = null,
  onChange,
  hint,
  required = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalErrors, setInternalErrors] = useState<string[]>([]);
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    const newErrors: string[] = [];

    if (file) {
      // Validate file size
      if (file.size > maxSize) {
        newErrors.push(
          `File size exceeds the limit of ${Math.round(
            maxSize / (1024 * 1024)
          )}MB`
        );
      }

      // Validate file type
      const fileType = file.type.split("/")[0];
      const acceptedTypes = accept.split(",").map((type) => type.trim());

      if (acceptedTypes.includes("image/*") && fileType !== "image") {
        if (!acceptedTypes.includes(file.type)) {
          newErrors.push("File type not supported");
        }
      }

      // Create preview for images
      if (fileType === "image") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }

    setInternalErrors(newErrors);
    setSelectedFile(file);
    setIsTouched(true);
    onChange(newErrors.length > 0 ? null : file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setInternalErrors([]);
    onChange(null);

    // Reset the input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const displayedErrors = [...(internalErrors || []), ...(error || [])];
  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <div className="space-y-1.5">
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

      <div className="relative group">
        {/* Gradient border effect */}
        <div
          className={`
            absolute -inset-0.5 rounded-lg blur-sm opacity-0 transition-opacity duration-300
            ${isDragging ? "opacity-50" : "group-hover:opacity-20"}
            bg-gradient-to-r from-purple-600 to-blue-600
          `}
        ></div>

        {/* Upload area */}
        <div
          className={`
            relative bg-gray-900/80 rounded-lg overflow-hidden
            ${
              displayedErrors.length > 0
                ? "border border-red-500/50"
                : "border border-gray-700 group-hover:border-gray-600"
            }
            ${
              isDragging
                ? "border-purple-500/70 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                : ""
            }
            transition-all duration-300
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            id={id || name}
            name={name}
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            aria-invalid={displayedErrors.length > 0}
            aria-describedby={
              displayedErrors.length > 0 ? `${name}-error` : undefined
            }
          />

          {!selectedFile ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex flex-col items-center justify-center p-6 cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <div className="p-3 mb-4 rounded-full bg-purple-500/10">
                <Upload size={24} className="text-purple-400" />
              </div>
              <p className="mb-1 text-sm text-gray-300">
                <span className="font-medium text-purple-400">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {accept.includes("image")
                  ? "SVG, PNG, JPG or GIF"
                  : "Supported files"}
                {maxSize
                  ? ` (max. ${Math.round(maxSize / (1024 * 1024))}MB)`
                  : ""}
              </p>
            </motion.div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-4">
                {preview && isImage ? (
                  <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-800 rounded-lg">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={preview}
                      alt="File preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 bg-gray-800 rounded-lg">
                    <FileIcon size={24} className="text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {selectedFile.name}
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={removeFile}
                      className="p-1 text-gray-400 transition-colors bg-gray-800 rounded-full hover:bg-gray-700 hover:text-red-400"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
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
        {displayedErrors.length > 0 && isTouched && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 space-y-1"
          >
            {displayedErrors.map((errMsg, index) => (
              <p
                key={index}
                id={`${name}-error-${index}`}
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
