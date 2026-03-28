import { useState, useRef, useEffect, useCallback } from "react";

import { AvatarUpload } from "./file-upload/AvatarUpload";
import { BannerUpload } from "./file-upload/BannerUpload";
import { DropzoneUpload } from "./file-upload/DropzoneUpload";

interface FileUploadProps {
  label?: string;
  name?: string;
  id?: string;
  accept?: string;
  maxSize?: number;
  error?: string;
  onChange: (file: File | null) => void;
  value?: File | null | string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
  variant?: "dropzone" | "avatar" | "banner";
  fallbackText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label, name, id, accept = "image/*", maxSize = 10 * 1024 * 1024,
  error, onChange, value, hint, required = false, disabled = false,
  className, compact = false, variant = "dropzone", fallbackText,
}) => {
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(typeof value === "string" ? value : null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalErrors, setInternalErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value instanceof File) {
      setInternalFile(value);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(value);
    } else if (typeof value === "string") {
      setPreview(value);
    } else if (value === null) {
      setInternalFile(null);
      setPreview(null);
    }
  }, [value]);

  const validateAndPreviewFile = useCallback(
    (file: File | null) => {
      const newErrors: string[] = [];

      if (file) {
        if (file.size > maxSize) {
          newErrors.push(
            `File exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit.`
          );
        }

        const acceptedTypesArray = accept.split(",").map((type) => type.trim());
        const isImage = file.type.startsWith("image/");

        const isAccepted = acceptedTypesArray.some(type => {
          if (type === "image/*") return isImage;
          return file.type === type;
        });

        if (!isAccepted) {
          newErrors.push(`Format ${file.type.split('/')[1].toUpperCase()} not supported.`);
        }

        if (isImage && newErrors.length === 0) {
          const reader = new FileReader();
          reader.onloadend = () => setPreview(reader.result as string);
          reader.readAsDataURL(file);
        } else if (!isImage) {
          setPreview(null);
        }
      }

      setInternalErrors(newErrors);
      if (newErrors.length === 0) {
        onChange(file);
      } else {
        onChange(null);
      }
    },
    [maxSize, accept, onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setInternalFile(file);
    validateAndPreviewFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    setInternalFile(file);
    validateAndPreviewFile(file);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalFile(null);
    setPreview(null);
    setInternalErrors([]);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayedErrors = [...internalErrors, ...(error ? [error] : [])];
  const isImage = Boolean(
    (internalFile?.type.startsWith("image/")) ||
    (typeof value === 'string' && preview?.startsWith('http')) ||
    (!internalFile && preview && typeof preview === 'string')
  );

  if (variant === "avatar") {
    return (
      <AvatarUpload
        id={id} name={name} accept={accept} disabled={disabled} className={className}
        preview={preview} fallbackText={fallbackText} displayedErrors={displayedErrors}
        inputRef={inputRef} handleInputChange={handleInputChange}
      />
    );
  }

  if (variant === "banner") {
    return (
      <BannerUpload
        id={id} name={name} accept={accept} disabled={disabled} className={className}
        preview={preview} label={label} displayedErrors={displayedErrors}
        inputRef={inputRef} handleInputChange={handleInputChange}
      />
    );
  }

  return (
    <DropzoneUpload
      id={id} name={name} accept={accept} disabled={disabled} className={className}
      preview={preview} label={label} hint={hint} required={required} compact={compact}
      isDragging={isDragging} setIsDragging={setIsDragging} displayedErrors={displayedErrors}
      internalFile={internalFile} isImage={isImage} inputRef={inputRef}
      handleInputChange={handleInputChange} handleDrop={handleDrop} removeFile={removeFile}
    />
  );
};

export default FileUpload;