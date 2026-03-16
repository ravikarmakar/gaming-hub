import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { RoadmapToggleHeader } from "./roadmaps/RoadmapToggleHeader";
import { RoadmapRoundsSection } from "./roadmaps/RoadmapRoundsSection";
import { LeagueConfigSection } from "./roadmaps/LeagueConfigSection";
import { MergeConfigSection } from "./roadmaps/MergeConfigSection";
import { TournamentFormValues } from "@/features/tournaments/lib";

export const InvitedTeamsRoadmapSection = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    const { control, watch, setValue, register } = useFormContext<TournamentFormValues>();
    const [isRoundsConfirmed, setIsRoundsConfirmed] = useState(false);
    const [isMappingSaved, setIsMappingSaved] = useState(false);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "invitedTeamsRoadmap",
    });

    const eventType = watch("eventType");
    const roadmapData = watch("invitedTeamsRoadmap") || [];
    const mappingData = watch("invitedRoundMappings") || [];

    // Initialize with at least one round
    useEffect(() => {
        const isSupportedType = eventType === "invited-tournament" || eventType === "tournament";
        if (fields.length === 0 && isSupportedType) {
            append({ name: "Round 1", title: "", isLeague: false, leagueType: "18-teams" });
        }
    }, [fields.length, append, eventType]);

    // Keep round names in sync with their index
    useEffect(() => {
        fields.forEach((_, index) => {
            const expectedName = `Round ${index + 1}`;
            if (watch(`invitedTeamsRoadmap.${index}.name`) !== expectedName) {
                setValue(`invitedTeamsRoadmap.${index}.name`, expectedName);
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

    const hasRoadmapValue = watch("hasInvitedTeamsRoadmap");
    const hasInvitedTeams = watch("hasInvitedTeams");
    const hasRoadmap = hasRoadmapValue || hasInvitedTeams || (eventType === "invited-tournament");

    if (!isEmbedded && eventType !== "invited-tournament") return null;

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <RoadmapToggleHeader
                    title="eSports Invitation"
                    description="Do you want to create a roadmap for this invitation?"
                    icon={Users}
                    id="has-invited-teams-roadmap"
                    checked={hasRoadmap}
                    onCheckedChange={(checked) => setValue("hasInvitedTeamsRoadmap", checked)}
                    accentColor="indigo"
                />
            )}

            {hasRoadmap && (
                <GlassCard className={cn("p-8 space-y-6", isEmbedded && "border-none bg-transparent p-0 shadow-none")}>
                    <RoadmapRoundsSection
                        title="eSports Invitation Roadmap"
                        description="Define the progression of the invited teams stage"
                        isRoundsConfirmed={isRoundsConfirmed}
                        roadmapData={roadmapData}
                        fields={fields}
                        fieldNamePrefix="invitedTeamsRoadmap"
                        register={register}
                        onAddRound={() => append({ name: `Round ${fields.length + 1}`, title: "", isLeague: false, leagueType: "18-teams" })}
                        onRemoveRound={remove}
                        onToggleConfirmed={handleConfirmedToggle}
                        isSavingDisabled={roadmapData.some(r => !r.title?.trim())}
                        accentColor="indigo"
                    />

                    {isRoundsConfirmed && (
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <MergeConfigSection
                                mappingName="invitedRoundMappings"
                                sourceRoadmapName="invitedTeamsRoadmap"
                                isMappingSaved={isMappingSaved}
                                setIsMappingSaved={setIsMappingSaved}
                                accentColor="indigo"
                                sourceLabel="Invitation Roadmap"
                            />

                            <div className="pt-8 border-t border-white/10">
                                <LeagueConfigSection
                                    roadmapName="invitedTeamsRoadmap"
                                    fields={fields}
                                    accentColor="indigo"
                                />
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
};
