import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Clock, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { GlassCard, SectionHeader } from "@/features/events/ui/components/ThemedComponents";
import { registrationStatusOptions, EventFormValues, RegistrationStatus } from "@/features/events/lib";
import { formatDateToLocalHTML } from "@/lib/utils";

export const ScheduleSection = () => {
    const { register, control, watch, setValue } = useFormContext<EventFormValues>();
    const minDate = formatDateToLocalHTML(new Date());
    const eventType = watch("eventType");

    useEffect(() => {
        if (eventType === "scrims") {
            setValue("registrationEndsAt", null as any, { shouldValidate: true, shouldDirty: true });
        }
    }, [eventType, setValue]);

    return (
        <GlassCard className="p-8 space-y-6 border-purple-500/10 shadow-glow">
            <SectionHeader title="Schedule & Slots" icon={Clock} />

            {watch("eventType") !== "scrims" && (
                <Controller
                    name="registrationEndsAt"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registration Deadline (DD/MM/YYYY)</Label>
                            <DatePicker
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                min={minDate}
                                error={fieldState.error?.message}
                                showTimeSelect
                            />
                        </div>
                    )}
                />
            )}

            <Controller
                name="startDate"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {watch("eventType") === "scrims" ? "Scrims Date & Time (DD/MM/YYYY)" : "Tournament Start Date (DD/MM/YYYY)"}
                        </Label>
                        <DatePicker
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            min={minDate}
                            error={fieldState.error?.message}
                            showTimeSelect
                        />
                    </div>
                )}
            />

            <div className="pt-4 space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tournament Status</Label>
                    <Select
                        value={watch("status")}
                        onValueChange={(val) => setValue("status", val as RegistrationStatus, { shouldValidate: true, shouldDirty: true })}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                            {registrationStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 pt-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Maximum Teams/Players</Label>
                    <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <Input
                            {...register("slots", { valueAsNumber: true })}
                            type="number"
                            className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl font-black"
                        />
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
