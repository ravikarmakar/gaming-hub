import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { LucideIcon } from "lucide-react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FieldConfig<T extends FieldValues> = {
    name: FieldPath<T>;
    label: string;
    placeholder?: string;
    type?: "text" | "select" | "custom";
    options?: { label: string; value: string }[];
    render?: (field: any) => React.ReactNode;
    icon?: LucideIcon;
    iconColor?: string;
    colSpan?: string;
    className?: string;
    maxLength?: number;
    disabled?: boolean;
};

interface GeneralInfoSectionProps<T extends FieldValues> {
    control: Control<T>;
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor?: string;
    fields: FieldConfig<T>[];
    className?: string;
    gridClassName?: string;
}

export function GeneralInfoSection<T extends FieldValues>({
    control,
    title,
    description,
    icon: Icon,
    iconColor = "text-blue-500",
    fields,
    className,
    gridClassName = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
}: GeneralInfoSectionProps<T>) {
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
            <CardContent className="p-8 pt-0 space-y-8">
                <div className={cn("grid gap-8", gridClassName)}>
                    {fields.map((fieldConfig) => (
                        <FormField
                            key={fieldConfig.name}
                            control={control}
                            name={fieldConfig.name}
                            render={({ field }) => (
                                <FormItem className={cn("space-y-2.5", fieldConfig.colSpan)}>
                                    <div className="flex items-center gap-2 px-1">
                                        {fieldConfig.icon && (
                                            <fieldConfig.icon className={cn("w-3 h-3", fieldConfig.iconColor || "text-zinc-500/50")} />
                                        )}
                                        <FormLabel className="text-[10px] font-black tracking-[3px] text-zinc-400 uppercase">
                                            {fieldConfig.label}
                                        </FormLabel>
                                    </div>
                                    {fieldConfig.type === "select" && fieldConfig.options && fieldConfig.options.length > 0 ? (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={fieldConfig.disabled}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-white/[0.03] border-white/5 focus:ring-0 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 capitalize">
                                                    <SelectValue placeholder={fieldConfig.placeholder} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#0d0b14] border-white/10 text-zinc-200 rounded-xl overflow-hidden backdrop-blur-xl">
                                                {fieldConfig.options?.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                        className="capitalize py-3 focus:bg-purple-500/10 focus:text-white transition-colors cursor-pointer font-bold text-xs tracking-widest"
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : fieldConfig.type === "custom" && fieldConfig.render ? (
                                        fieldConfig.render(field)
                                    ) : (
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    {...field}
                                                    disabled={fieldConfig.disabled}
                                                    maxLength={fieldConfig.maxLength}
                                                    className={cn(
                                                        "h-12 bg-white/[0.03] border-white/5 focus:border-purple-500/50 transition-all rounded-xl text-white font-bold tracking-tight text-sm px-4 placeholder:text-zinc-700",
                                                        fieldConfig.className
                                                    )}
                                                    placeholder={fieldConfig.placeholder}
                                                />
                                                <div className="absolute inset-0 rounded-xl bg-purple-500/0 group-focus-within:bg-purple-500/[0.02] pointer-events-none transition-all" />
                                            </div>
                                        </FormControl>
                                    )}
                                    <FormMessage className="text-[10px] font-bold text-red-500/80 px-1" />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
