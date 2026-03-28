import React from "react";
import { Camera, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface BannerUploadProps {
  id?: string;
  name?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
  preview: string | null;
  label?: string;
  displayedErrors: string[];
  inputRef: React.RefObject<HTMLInputElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BannerUpload: React.FC<BannerUploadProps> = ({
  id, name, accept, disabled, className, preview, label, displayedErrors, inputRef, handleInputChange
}) => {
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
        <div className="absolute top-2 left-2 right-2 flex flex-col gap-2 z-10">
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
};
