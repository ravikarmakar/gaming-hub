import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, AlertTriangle, ImageIcon, FileText, Camera } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  label,
  name,
  id,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024,
  error,
  onChange,
  value,
  hint,
  required = false,
  disabled = false,
  className,
  compact = false,
  variant = "dropzone",
  fallbackText,
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
  const isImage = internalFile?.type.startsWith("image/") || (preview && typeof value === 'string') || (preview && internalFile);

  if (variant === "avatar") {
    return (
      <div className={cn("relative group", className)}>
        <input
          ref={inputRef}
          type="file"
          id={id || name}
          name={name}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32">
          <Avatar className="w-full h-full border-4 border-[#06040a] bg-[#0d0b14] shadow-2xl relative overflow-hidden group-hover:border-purple-500/50 transition-all">
            <AvatarImage src={preview || undefined} className="object-cover" />
            <AvatarFallback className="bg-purple-500/10 text-purple-400 text-2xl font-bold">
              {fallbackText || <ImageIcon className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          {!disabled && (
            <Button
              size="icon"
              variant="secondary"
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full size-8 sm:size-10 shadow-lg border border-white/10 bg-gray-900 hover:bg-purple-600 transition-colors z-10"
            >
              <Camera className="size-4 sm:size-5 text-purple-400 group-hover:text-white" />
            </Button>
          )}
        </div>
        {displayedErrors.length > 0 && (
          <div className="mt-2 text-center">
            {displayedErrors.map((err, i) => (
              <p key={i} className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{err}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={cn("relative group rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]", className)}>
        <input
          ref={inputRef}
          type="file"
          id={id || name}
          name={name}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="h-48 relative">
          <img
            src={preview || "/placeholder-banner.jpg"}
            alt="Banner"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06040a] to-transparent" />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-xl text-[10px] font-black tracking-[2px] transition-all hover:bg-black/80 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                {label || "Change Banner"}
              </Button>
            </div>
          )}
        </div>
        {displayedErrors.length > 0 && (
          <div className="absolute top-2 left-2 right-2">
            {displayedErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-lg text-rose-500 border border-rose-500/20">
                <AlertTriangle size={12} />
                <p className="text-[10px] font-black uppercase tracking-widest">{err}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between mb-1 px-1">
          <label
            htmlFor={id || name}
            className="text-[10px] font-black text-gray-500 uppercase tracking-widest"
          >
            {label} {required && <span className="text-purple-500">*</span>}
          </label>
          {hint && <span className="text-[10px] text-gray-600 font-bold uppercase">{hint}</span>}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer transition-all duration-500",
          "rounded-2xl border-2 border-dashed overflow-hidden",
          isDragging ? "border-purple-500 bg-purple-500/10 shadow-glow" : "border-white/10 bg-white/5 hover:border-white/20",
          displayedErrors.length > 0 ? "border-rose-500/50 bg-rose-500/5" : "",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          id={id || name}
          name={name}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {!internalFile && !preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn("flex flex-col items-center justify-center py-10 px-4 text-center", compact && "py-6")}
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-purple-600/20 blur-xl rounded-full" />
                <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="text-purple-400" size={24} />
                </div>
              </div>
              <p className="text-sm font-bold text-white mb-1">
                Broadcasting Module: <span className="text-purple-400">Initiate Upload</span>
              </p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                DRAG & DROP OR CLICK TO BROWSE
              </p>
              <div className="mt-4 flex gap-2 opacity-50">
                <ImageIcon size={14} className="text-gray-400" />
                <FileText size={14} className="text-gray-400" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video w-full overflow-hidden group/preview"
            >
              {isImage ? (
                <img src={preview!} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6">
                  <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 mb-4">
                    <FileText className="text-red-400" size={48} />
                  </div>
                  <p className="text-sm font-black text-white uppercase tracking-wider truncate max-w-xs">
                    {internalFile?.name || "Document Encrypted"}
                  </p>
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-3 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    {internalFile ? `${(internalFile.size / 1024 / 1024).toFixed(2)} MB` : "ACTIVE PREVIEW"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {displayedErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-1"
          >
            {displayedErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 mt-2 text-rose-500">
                <AlertTriangle size={12} />
                <p className="text-[10px] font-black uppercase tracking-widest">{err}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;