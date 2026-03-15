import { useFormContext } from "react-hook-form";
import { LayoutGrid } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard, SectionHeader } from "@/features/tournaments/ui/components/ThemedComponents";
import { TournamentFormValues } from "../../../lib";

export const DescriptionSection = () => {
    const { register, formState: { errors } } = useFormContext<TournamentFormValues>();

    return (
        <GlassCard className="p-8 space-y-6">
            <SectionHeader title="Tournament Description" icon={LayoutGrid} />
            <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Rules & Info</Label>
                <Textarea
                    {...register("description")}
                    placeholder="Enter tournament rules, map pool, and schedule details..."
                    className="bg-white/5 border-white/10 min-h-[200px] rounded-2xl p-6 focus:border-purple-500/50 transition-all text-gray-300 font-medium leading-relaxed"
                />
                {errors.description && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.description.message}</p>}
            </div>
        </GlassCard>
    );
};
