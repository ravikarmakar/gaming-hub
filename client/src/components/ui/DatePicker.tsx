import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Override some default styles of react-datepicker to match the theme
import "./DatePicker.css";

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    min?: string;
    showTimeSelect?: boolean;
    dateFormat?: string;
}

export function DatePicker({ value, onChange, label, error, icon, min, showTimeSelect, dateFormat }: DatePickerProps) {
    const selectedDate = value ? new Date(value) : null;
    const minDate = min ? new Date(min) : new Date();

    const handleDateChange = (date: Date | null) => {
        if (date) {
            // Keep the output consistent with the input (ISO string)
            onChange(date.toISOString());
        } else {
            onChange("");
        }
    };

    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase">
                    {icon}
                    {label}
                </label>
            )}
            <div className="relative group w-full">
                <ReactDatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    showTimeSelect={showTimeSelect}
                    timeFormat="hh:mm aa"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat={dateFormat || (showTimeSelect ? "dd/MM/yyyy h:mm aa" : "dd/MM/yyyy")}
                    minDate={minDate}
                    portalId="root-portal" /* Forces the calendar to escape overflow: hidden containers */
                    className={cn(
                        "flex h-10 w-full bg-white/5 border-white/10 text-sm text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all rounded-lg cursor-pointer px-3 py-2",
                        "appearance-none",
                        error && "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/60"
                    )}
                    placeholderText="Select date"
                    wrapperClassName="w-full"
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
