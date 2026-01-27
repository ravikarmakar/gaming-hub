import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export function DatePicker({ value, onChange, label, error, icon }: DatePickerProps) {
    // datetime-local expects YYYY-MM-DDTHH:mm
    const formattedValue = value ? new Date(value).toISOString().slice(0, 16) : "";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) {
            onChange("");
            return;
        }
        try {
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
                onChange(date.toISOString());
            }
        } catch (err) {
            console.error("Invalid date selected", err);
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase">
                    {icon}
                    {label}
                </label>
            )}
            <div className="relative group">
                <Input
                    type="datetime-local"
                    value={formattedValue}
                    onChange={handleInputChange}
                    className={cn(
                        "h-10 bg-white/5 border-white/10 text-sm text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all rounded-lg cursor-pointer",
                        "appearance-none",
                        error && "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/60"
                    )}
                    style={{
                        colorScheme: "dark",
                    }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-purple-400 transition-colors">
                    <CalendarIcon className="w-4 h-4" />
                </div>
            </div>
            {error && (
                <p className="text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
}
