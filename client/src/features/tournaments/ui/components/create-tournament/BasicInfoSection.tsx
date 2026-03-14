import { useFormContext, Controller } from "react-hook-form";
import { Gamepad2, Shield, IndianRupee } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { GlassCard, SectionHeader } from "@/features/events/ui/components/ThemedComponents";
import { categoryOptions, eventTypeOptions, registrationModeOptions, EventFormValues, GAMES_MAPS } from "@/features/events/lib";
import { Category, RegistrationMode } from "../../../types";

export const BasicInfoSection = () => {
    const { register, watch, setValue, control, formState: { errors } } = useFormContext<EventFormValues>();
    const isPaid = watch("isPaid");

    return (
        <GlassCard className="p-5 space-y-4">
            <SectionHeader
                title="Basic Information"
                icon={Shield}
                className="mb-4"
                titleClassName="text-sm"
                iconClassName="w-4 h-4"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Tournament Title</Label>
                    <Input
                        {...register("title")}
                        placeholder="e.g. Winter Championship 2024"
                        className="bg-white/5 border-white/10 h-9 rounded-lg focus:border-purple-500/50 transition-all font-bold text-xs"
                    />
                    {errors.title && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                    <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Game Name</Label>
                    <div className="relative">
                        <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={13} />
                        <Controller
                            name="game"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="bg-white/5 border-white/10 h-9 pl-9 rounded-lg focus:border-purple-500/50 transition-all font-bold text-xs">
                                        <SelectValue placeholder="Select a game" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                                        {Object.keys(GAMES_MAPS).map((game) => (
                                            <SelectItem key={game} value={game} className="capitalize text-xs">
                                                {game}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    {errors.game && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.game.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Format</Label>
                    <Select value={watch("category")} onValueChange={(val) => setValue("category", val as Category)}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-9 rounded-lg text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                            {categoryOptions.map((type) => (
                                <SelectItem key={type.value} value={type.value} className="text-xs">
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Type</Label>
                    <Select value={watch("eventType")} onValueChange={(val) => setValue("eventType", val as EventFormValues["eventType"])}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-9 rounded-lg text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                            {eventTypeOptions.map((type) => (
                                <SelectItem key={type.value} value={type.value} className="text-xs">
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Mode</Label>
                    <Select value={watch("registrationMode")} onValueChange={(val) => setValue("registrationMode", val as RegistrationMode)}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-9 rounded-lg focus:border-purple-500/50 transition-all font-bold text-xs">
                            <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B0C1A] border-white/10 text-white">
                            {registrationModeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="focus:bg-purple-500/10 focus:text-purple-400 text-xs">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.registrationMode && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.registrationMode.message}</p>}
                </div>
            </div>

            {watch("eventType") === "scrims" && (
                <div className="space-y-1 max-w-[calc(33.33%-0.5rem)]">
                    <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Number of Matches</Label>
                    <Input
                        {...register("matchCount")}
                        type="number"
                        placeholder="e.g. 1"
                        className="bg-white/5 border-white/10 h-9 rounded-lg focus:border-purple-500/50 transition-all font-bold text-xs"
                    />
                    {errors.matchCount && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.matchCount.message}</p>}
                </div>
            )}

            <div className="space-y-2">
                <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    {watch("eventType") === "scrims" ? "Available Maps (Randomized Rotation)" : "Map Rotation (Select maps)"}
                </Label>
                <div className="flex flex-wrap gap-1.5 focus-within:ring-1 focus-within:ring-purple-500/20 rounded-lg">
                    {(() => {
                        const gameKey = watch("game")?.toLowerCase();
                        const eventType = watch("eventType");
                        const availableMaps = (GAMES_MAPS as Record<string, readonly string[]>)[gameKey || ""] || [];
                        const currentMaps = watch("map") || [];

                        if (availableMaps.length === 0) {
                            return <p className="text-[9px] text-gray-400 italic">No predefined maps for this game.</p>
                        }

                        if (eventType === "scrims") {
                            return (
                                <div className="space-y-1.5 w-full">
                                    <div className="flex flex-wrap gap-1">
                                        {availableMaps.map((mapName: string) => (
                                            <span
                                                key={mapName}
                                                className="px-2.5 py-1 rounded-md text-[9px] font-bold bg-white/5 border border-white/10 text-gray-400"
                                            >
                                                {mapName}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[8px] text-purple-400 font-bold italic animate-pulse">
                                        * Map rotation will be assigned randomly for each match in scrims.
                                    </p>
                                </div>
                            );
                        }

                        return availableMaps.map((mapName: string) => {
                            const isSelected = currentMaps.includes(mapName);
                            return (
                                <button
                                    key={mapName}
                                    type="button"
                                    onClick={() => {
                                        const newMaps = isSelected
                                            ? currentMaps.filter(m => m !== mapName)
                                            : [...currentMaps, mapName];
                                        setValue("map", newMaps, { shouldValidate: true, shouldDirty: true });
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all border ${isSelected
                                        ? "bg-purple-600 border-purple-500 text-white shadow-glow"
                                        : "bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/30 hover:bg-purple-500/10"
                                        }`}
                                >
                                    {mapName}
                                </button>
                            );
                        });
                    })()}
                </div>
                {errors.map && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.map.message}</p>}
            </div>

            <div className="flex items-center space-x-2.5">
                <Controller
                    name="isPaid"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="isPaid"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-3.5 w-3.5 border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 rounded-sm"
                        />
                    )}
                />
                <div className="grid gap-0.5 leading-none">
                    <Label
                        htmlFor="isPaid"
                        className="text-[10px] font-bold text-white cursor-pointer select-none"
                    >
                        Paid Tournament
                    </Label>
                    <p className="text-[8px] text-gray-500 font-medium">
                        Enable this if players need to pay an entry fee
                    </p>
                </div>
            </div>

            {isPaid && (
                <div className="space-y-1 max-w-[200px]">
                    <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Entry Fee (₹)</Label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={13} />
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
                                    placeholder="0"
                                    type="text"
                                    inputMode="numeric"
                                    className="pl-8 bg-white/5 border-white/10 text-white h-9 focus:ring-emerald-500/20 rounded-lg font-bold text-xs"
                                />
                            )}
                        />
                    </div>
                    {errors.entryFee && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.entryFee.message}</p>}
                </div>
            )}
        </GlassCard>
    );
};
