import React from "react";
import { Camera, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface AvatarUploadProps {
  id?: string;
  name?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
  preview: string | null;
  fallbackText?: string;
  displayedErrors: string[];
  inputRef: React.RefObject<HTMLInputElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  id, name, accept, disabled, className, preview, fallbackText, displayedErrors, inputRef, handleInputChange
}) => {
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
          <AvatarImage src={preview || undefined} alt="File preview" className="object-cover" />
          <AvatarFallback className="bg-purple-500/10 text-purple-400 text-2xl font-bold">
            {fallbackText || <ImageIcon className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>
        {!disabled && (
          <Button
            size="icon"
            aria-label="Change avatar"
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
};
