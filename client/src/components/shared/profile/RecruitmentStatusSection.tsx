import React from "react";
import { Control } from "react-hook-form";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormControl, FormLabel, FormDescription, FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface RecruitmentStatusSectionProps {
    control: Control<any>;
    name: string;
    title: string;
    label: string;
    description: string;
    icon: LucideIcon;
    iconColor?: string;
    accentColor?: "emerald" | "purple" | "blue" | "zinc";
    disabled?: boolean;
}

export const RecruitmentStatusSection: React.FC<RecruitmentStatusSectionProps> = ({
    control,
    name,
    title,
    label,
    description,
    icon: Icon,
    iconColor = "text-emerald-400",
    accentColor = "emerald",
    disabled = false,
}) => {
    const colorClasses = {
        emerald: {
            item: "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10",
            checkbox: "border-emerald-500/30 data-[state=checked]:bg-emerald-500",
            label: "text-emerald-400"
        },
        purple: {
            item: "bg-purple-500/5 border-purple-500/10 hover:bg-purple-500/10",
            checkbox: "border-purple-500/30 data-[state=checked]:bg-purple-500",
            label: "text-purple-400"
        },
        blue: {
            item: "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10",
            checkbox: "border-blue-500/30 data-[state=checked]:bg-blue-500",
            label: "text-blue-400"
        },
        zinc: {
            item: "bg-zinc-500/5 border-zinc-500/10 hover:bg-zinc-500/10",
            checkbox: "border-zinc-500/30 data-[state=checked]:bg-zinc-500",
            label: "text-zinc-400"
        }
    }[accentColor];

    return (
        <Card className="bg-[#0B0C1A] border-white/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-widest text-zinc-400">
                    <Icon className={cn("size-4", iconColor)} /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    control={control}
                    name={name}
                    render={({ field }) => (
                        <FormItem className={cn(
                            "flex items-center space-x-3 p-3 rounded-xl border transition-colors space-y-0",
                            colorClasses.item
                        )}>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={disabled}
                                    className={cn(
                                        "data-[state=checked]:text-white",
                                        colorClasses.checkbox
                                    )}
                                />
                            </FormControl>
                            <div 
                                className="grid gap-1.5 leading-none cursor-pointer flex-1 outline-none" 
                                onClick={() => !disabled && field.onChange(!field.value)}
                                onKeyDown={(e) => {
                                    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        field.onChange(!field.value);
                                    }
                                }}
                                role="button"
                                tabIndex={disabled ? -1 : 0}
                                aria-label={label}
                            >
                                <FormLabel className={cn(
                                    "text-sm font-bold leading-none cursor-pointer",
                                    colorClasses.label
                                )}>
                                    {label}
                                </FormLabel>
                                <FormDescription className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                                    {description}
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
};
