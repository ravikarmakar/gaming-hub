import { Control, FieldPath, FieldValues } from "react-hook-form";
import { LucideIcon, FileText } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BioSectionProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    title?: string;
    description?: string;
    label?: string;
    placeholder?: string;
    icon?: LucideIcon;
    iconColor?: string;
    maxLength?: number;
    className?: string;
    disabled?: boolean;
}

export function BioSection<T extends FieldValues>({
    control,
    name,
    title = "About You",
    description = "Describe yourself and your gaming experience.",
    label = "Bio",
    placeholder = "Tell us about yourself...",
    icon: Icon = FileText,
    iconColor = "text-emerald-500",
    maxLength = 500,
    className,
    disabled = false,
}: BioSectionProps<T>) {
    return (
        <Card className={cn("bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden", className)}>
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <Icon className={cn("w-4 h-4", iconColor)} />
                    <CardTitle className="text-sm font-black text-white tracking-[2px]">{title}</CardTitle>
                </div>
                <CardDescription className="text-xs text-zinc-400 font-medium">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <FormField
                    control={control}
                    name={name}
                    render={({ field }) => (
                        <FormItem className="space-y-2.5">
                            <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400 px-1 uppercase">{label}</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <Textarea
                                        {...field}
                                        disabled={disabled}
                                        placeholder={placeholder}
                                        maxLength={maxLength}
                                        className="min-h-[160px] bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-2xl text-white font-medium text-sm leading-relaxed px-5 py-4 resize-none placeholder:text-zinc-700"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                </div>
                            </FormControl>
                            <div className="flex justify-between items-center px-1">
                                <FormDescription className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase">
                                    {maxLength} characters max
                                </FormDescription>
                                <span className="text-[9px] font-bold text-zinc-600 tracking-widest">
                                    {field.value?.length || 0} / {maxLength}
                                </span>
                            </div>
                            <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
