import { useFormContext, Controller } from "react-hook-form";
import { Gamepad2, Shield, IndianRupee } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard, SectionHeader } from "@/features/events/ui/components/ThemedComponents";
import { categoryOptions, eventTypeOptions, EventFormValues } from "@/features/events/lib";

export const BasicInfoSection = () => {
    const { register, watch, setValue, control, formState: { errors } } = useFormContext<EventFormValues>();

    const isPaid = watch("isPaid");

    return (
        <GlassCard className="p-8 space-y-6">
            <SectionHeader title="Basic Information" icon={Shield} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Tournament Title</Label>
                    <Input
                        {...register("title")}
                        placeholder="e.g. Winter Championship 2024"
                        className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all font-bold"
                    />
                    {errors.title && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Game Name</Label>
                    <div className="relative">
                        <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <Input
                            {...register("game")}
                            placeholder="e.g. Valorant, BGMI, Free Fire..."
                            className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl focus:border-purple-500/50 transition-all font-bold"
                        />
                    </div>
                    {errors.game && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.game.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Tournament Format</Label>
                    <Select value={watch("category")} onValueChange={(val) => setValue("category", val as any)}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                            {categoryOptions.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Tournament Type</Label>
                    <Select value={watch("eventType")} onValueChange={(val) => setValue("eventType", val as any)}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                            {eventTypeOptions.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="pt-4 flex items-center space-x-3">
                <Controller
                    name="isPaid"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="isPaid"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 rounded-md"
                        />
                    )}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label
                        htmlFor="isPaid"
                        className="text-xs font-bold text-white cursor-pointer select-none"
                    >
                        Paid Tournament
                    </Label>
                    <p className="text-[10px] text-gray-500 font-medium">
                        Enable this if players need to pay an entry fee
                    </p>
                </div>
            </div>

            {isPaid && (
                <div className="pt-2 space-y-2 max-w-sm">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Entry Fee (₹)</Label>
                    <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                        <Controller
                            name="entryFee"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    value={value ? Number(value).toLocaleString('en-IN') : ""}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, "");
                                        if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                                            onChange(val === "" ? "" : Math.max(0, Number(val)));
                                        }
                                    }}
                                    placeholder="0.00"
                                    type="text"
                                    inputMode="numeric"
                                    className="pl-12 bg-white/5 border-white/10 text-white h-12 focus:ring-emerald-500/20 rounded-xl font-bold"
                                />
                            )}
                        />
                    </div>
                    {errors.entryFee && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.entryFee.message}</p>}
                </div>
            )}
        </GlassCard>
    );
};
