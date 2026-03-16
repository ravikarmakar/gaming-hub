import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { RoadmapToggleHeader } from "./roadmaps/RoadmapToggleHeader";
import { RoadmapRoundsSection } from "./roadmaps/RoadmapRoundsSection";
import { LeagueConfigSection } from "./roadmaps/LeagueConfigSection";
import { MergeConfigSection } from "./roadmaps/MergeConfigSection";
import { TournamentFormValues } from "@/features/tournaments/lib";

export const T1SpecialRoadmapSection = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    const { control, watch, setValue, register } = useFormContext<TournamentFormValues>();
    const [isRoundsConfirmed, setIsRoundsConfirmed] = useState(false);
    const [isMappingSaved, setIsMappingSaved] = useState(false);
    const { fields, append, remove } = useFieldArray({
        control,
        name: "t1SpecialRoadmap",
    });

    const eventType = watch("eventType");
    const roadmapData = watch("t1SpecialRoadmap") || [];
    const mappingData = watch("t1SpecialRoundMappings") || [];

    // Initialize with at least one round
    useEffect(() => {
        const isSupportedType = eventType === "t1-special" || eventType === "tournament";
        if (fields.length === 0 && isSupportedType) {
            append({ name: "Round 1", title: "", isLeague: false, leagueType: "18-teams" });
        }
    }, [fields.length, append, eventType]);

    // Keep round names in sync with their index
    useEffect(() => {
        fields.forEach((_, index) => {
            const expectedName = `Round ${index + 1}`;
            if (watch(`t1SpecialRoadmap.${index}.name`) !== expectedName) {
                setValue(`t1SpecialRoadmap.${index}.name`, expectedName);
            }
        });
    }, [fields.length, setValue, watch]);

    useEffect(() => {
        if (fields.length > 0 && roadmapData.every(r => r.title?.trim() !== "")) {
            if (roadmapData.some(r => r.isLeague)) {
                setIsRoundsConfirmed(true);
            }
        }
    }, [fields.length, roadmapData]);

    useEffect(() => {
        if (mappingData.length > 0 && mappingData[0].targetMainRound?.roundNumber !== undefined) {
            setIsMappingSaved(true);
        }
    }, [mappingData]);

    const handleConfirmedToggle = () => {
        if (!isRoundsConfirmed) {
            const hasEmptyTitles = roadmapData.some(round => !round.title?.trim());
            if (hasEmptyTitles) {
                return;
            }
        }
        setIsRoundsConfirmed(!isRoundsConfirmed);
    };

    const hasRoadmapValue = watch("hasT1SpecialRoadmap");
    const hasRoadmap = hasRoadmapValue ?? (eventType === "tournament" || eventType === "t1-special");

    if (!isEmbedded && eventType !== "tournament" && eventType !== "t1-special") return null;

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <RoadmapToggleHeader
                    title="T1 Special Roadmap"
                    description="Create a separate track for T1 special invited teams"
                    icon={Trophy}
                    id="has-t1-special-roadmap"
                    checked={hasRoadmap}
                    onCheckedChange={(checked) => setValue("hasT1SpecialRoadmap", checked)}
                    accentColor="amber"
                />
            )}

            {hasRoadmap && (
                <GlassCard className={cn("p-8 space-y-6", isEmbedded && "border-none bg-transparent p-0 shadow-none")}>
                    <RoadmapRoundsSection
                        title="T1 Special Roadmap"
                        description="Define the progression of the T1 Special stage"
                        isRoundsConfirmed={isRoundsConfirmed}
                        roadmapData={roadmapData}
                        fields={fields}
                        fieldNamePrefix="t1SpecialRoadmap"
                        register={register}
                        onAddRound={() => append({ name: `Round ${fields.length + 1}`, title: "", isLeague: false, leagueType: "18-teams" })}
                        onRemoveRound={remove}
                        onToggleConfirmed={handleConfirmedToggle}
                        isSavingDisabled={roadmapData.some(r => !r.title?.trim())}
                        accentColor="amber"
                    />

                    {isRoundsConfirmed && (
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <MergeConfigSection
                                mappingName="t1SpecialRoundMappings"
                                sourceRoadmapName="t1SpecialRoadmap"
                                isMappingSaved={isMappingSaved}
                                setIsMappingSaved={setIsMappingSaved}
                                accentColor="amber"
                                sourceLabel="T1 Special Roadmap"
                            />

                            <div className="pt-8 border-t border-white/10">
                                <LeagueConfigSection
                                    roadmapName="t1SpecialRoadmap"
                                    fields={fields}
                                    accentColor="amber"
                                />
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
};
