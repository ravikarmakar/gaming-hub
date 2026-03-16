import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { RoadmapToggleHeader } from "./roadmaps/RoadmapToggleHeader";
import { RoadmapRoundsSection } from "./roadmaps/RoadmapRoundsSection";
import { LeagueConfigSection } from "./roadmaps/LeagueConfigSection";
import { TournamentFormValues } from "@/features/tournaments/lib";

export const RoadmapSection = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    const { control, watch, setValue, register } = useFormContext<TournamentFormValues>();
    const [isRoundsConfirmed, setIsRoundsConfirmed] = useState(false);
    const { fields, append, remove } = useFieldArray({
        control,
        name: "roadmap",
    });

    const eventType = watch("eventType");
    const roadmapData = watch("roadmap") || [];

    // Initialize with at least one round if not scrims
    useEffect(() => {
        if (fields.length === 0 && eventType !== "scrims") {
            append({ name: "Round 1", title: "", isLeague: false, leagueType: "18-teams" });
        }
    }, [fields.length, append, eventType]);

    // Keep round names in sync with their index
    useEffect(() => {
        fields.forEach((_, index) => {
            const expectedName = `Round ${index + 1}`;
            if (watch(`roadmap.${index}.name`) !== expectedName) {
                setValue(`roadmap.${index}.name`, expectedName);
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

    const handleConfirmedToggle = () => {
        if (!isRoundsConfirmed) {
            const hasEmptyTitles = roadmapData.some(round => !round.title?.trim());
            if (hasEmptyTitles) {
                return;
            }
        }
        setIsRoundsConfirmed(!isRoundsConfirmed);
    };

    const hasRoadmapValue = watch("hasRoadmap");
    const hasRoadmap = hasRoadmapValue ?? (eventType === "tournament");

    if (eventType === "scrims") return null;

    return (
        <div className="space-y-6">
            {!isEmbedded && eventType === "invited-tournament" && (
                <RoadmapToggleHeader
                    title="eSports Invitation"
                    description="Do you want to create a roadmap for this invitation?"
                    icon={Trophy}
                    id="has-roadmap"
                    checked={hasRoadmap}
                    onCheckedChange={(checked) => setValue("hasRoadmap", checked)}
                    accentColor="amber"
                />
            )}

            {hasRoadmap && (
                <GlassCard className={cn("p-8 space-y-6", isEmbedded && "border-none bg-transparent p-0 shadow-none")}>
                    <RoadmapRoundsSection
                        title="Tournament Roadmap"
                        description="Define the progression of your tournament"
                        isRoundsConfirmed={isRoundsConfirmed}
                        roadmapData={roadmapData}
                        fields={fields}
                        fieldNamePrefix="roadmap"
                        register={register}
                        onAddRound={() => append({ name: `Round ${fields.length + 1}`, title: "", isLeague: false, leagueType: "18-teams" })}
                        onRemoveRound={remove}
                        onToggleConfirmed={handleConfirmedToggle}
                        isSavingDisabled={roadmapData.some(r => !r.title?.trim())}
                        accentColor="purple"
                    />

                    {isRoundsConfirmed && (
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <LeagueConfigSection
                                roadmapName="roadmap"
                                fields={fields}
                                accentColor="purple"
                            />
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
};
