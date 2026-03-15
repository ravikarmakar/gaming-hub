import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { IndianRupee, Trophy, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard, SectionHeader } from "@/features/tournaments/ui/components/ThemedComponents";
import { TournamentFormValues } from "../../../lib";

export const PrizeSection = () => {
    const { register, control, watch } = useFormContext<TournamentFormValues>();

    const { fields, append, replace } = useFieldArray({
        control,
        name: "prizeDistribution",
    });

    const prizePool = watch("prizePool");
    const prizeDistribution = watch("prizeDistribution") || [];

    const totalBounty = Number(prizePool) || 0;
    const distributedAmount = prizeDistribution.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const remainingBounty = totalBounty - distributedAmount;

    const isPrizePoolEntered = totalBounty > 0;
    const canAddSlice = isPrizePoolEntered && remainingBounty > 0;

    const handleRemoveSlice = (index: number) => {
        const currentFields = [...fields];
        currentFields.splice(index, 1);

        const resequenced = currentFields.map((field, i) => ({
            ...field,
            rank: i + 1,
            label: `Rank ${i + 1}`,
            amount: 0
        }));

        replace(resequenced);
    };

    return (
        <GlassCard className="p-8 space-y-6 border-amber-500/10">
            <SectionHeader title="Prize Pool" icon={Trophy} />

            <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Total Prize Pool (₹)</Label>
                <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                    <Controller
                        name="prizePool"
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
                                className="pl-12 bg-white/5 border-white/10 text-white h-12 focus:ring-amber-500/20 rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Rank Distribution</span>
                        {isPrizePoolEntered && (
                            <span className={`text-[10px] font-bold pl-1 ${remainingBounty > 0 ? "text-amber-400" : remainingBounty < 0 ? "text-rose-500" : "text-emerald-400"}`}>
                                Remaining: ₹{remainingBounty.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        type="button"
                        disabled={!canAddSlice}
                        onClick={() => append({ rank: fields.length + 1, amount: 0, label: `Rank ${fields.length + 1}` })}
                        className="h-auto p-0 text-[10px] font-black text-purple-400 hover:text-white hover:bg-transparent transition-colors shadow-none disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        + ADD RANK
                    </Button>
                </div>

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 group/rank">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input
                                    type="number"
                                    {...register(`prizeDistribution.${index}.rank` as const, { valueAsNumber: true })}
                                    className="bg-white/10 border-white/10 h-10 text-xs font-bold rounded-lg cursor-not-allowed"
                                    placeholder="Rank"
                                    readOnly
                                />
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                    <Controller
                                        name={`prizeDistribution.${index}.amount` as const}
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Input
                                                value={value ? Number(value).toLocaleString('en-IN') : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/,/g, "");
                                                    if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                                                        const currentAmount = Number(val) || 0;
                                                        const otherAmounts = distributedAmount - (Number(value) || 0);
                                                        const maxPossible = totalBounty - otherAmounts;

                                                        onChange(val === "" ? "" : Math.min(maxPossible, Math.max(0, currentAmount)));
                                                    }
                                                }}
                                                className="bg-white/5 border-white/10 text-white pl-9 text-sm focus:ring-purple-500/20 rounded-lg"
                                                placeholder="Amount"
                                                type="text"
                                                inputMode="numeric"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            {fields.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={() => handleRemoveSlice(index)}
                                    className="h-10 w-10 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                >
                                    <X size={14} />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
};
