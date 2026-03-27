import { Save, LoaderCircle as Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingsFormActionsProps {
    isDirty: boolean;
    isLoading: boolean;
    onReset: () => void;
    saveLabel?: string;
    className?: string;
    showReset?: boolean;
}

export const SettingsFormActions = ({
    isDirty,
    isLoading,
    onReset,
    saveLabel = "Save Changes",
    className,
    showReset = true,
}: SettingsFormActionsProps) => {
    if (!isDirty && !isLoading) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                className
            )}
        >
            {showReset && (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onReset}
                    disabled={isLoading}
                    className="h-12 px-6 text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-semibold rounded-xl transition-all"
                >
                    <X className="w-4 h-4 mr-2 opacity-50" />
                    Cancel
                </Button>
            )}
            <Button
                type="submit"
                disabled={isLoading}
                className="group relative overflow-hidden px-10 h-12 bg-purple-600 hover:bg-purple-500 text-white transition-all font-semibold text-sm rounded-xl active:scale-[0.98] shadow-xl shadow-purple-500/10"
            >
                <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                            {saveLabel}
                        </>
                    )}
                </span>
            </Button>
        </div>
    );
};
