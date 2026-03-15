import { lazy, Suspense } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { GlassCard, SectionHeader } from "@/features/tournaments/ui/components/ThemedComponents";
import { TournamentFormValues } from "../../../lib";

const FileUpload = lazy(() => import("@/components/FileUpload"));

export const MediaSection = () => {
    const { control } = useFormContext<TournamentFormValues>();

    return (
        <GlassCard className="p-8 space-y-6 border-purple-500/10">
            <SectionHeader title="Tournament Banner" icon={ImageIcon} />
            <Suspense fallback={<div className="h-32 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 animate-pulse text-xs text-gray-500">Loading Upload...</div>}>
                <Controller
                    name="image"
                    control={control}
                    render={({ field, fieldState }) => (
                        <FileUpload
                            label="Tournament Banner Image"
                            hint="Max size: 10MB (16:9 Aspect Ratio)"
                            maxSize={10 * 1024 * 1024}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </Suspense>
        </GlassCard>
    );
};
