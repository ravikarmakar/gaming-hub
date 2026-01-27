import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, AlertTriangle, ImageIcon, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  name,
  id,
  accept = "image/*,application/pdf",
  maxSize = 10 * 1024 * 1024,
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
  const [preview, setPreview] = useState<string | null>(typeof value === "string" ? value : null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalErrors, setInternalErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value instanceof File) {
      setInternalFile(value);
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

        if (isImage) {
          const reader = new FileReader();
          reader.onloadend = () => setPreview(reader.result as string);
          reader.readAsDataURL(file);
        } else {
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
  const isImage = internalFile?.type.startsWith("image/") || (preview && typeof value === 'string');

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