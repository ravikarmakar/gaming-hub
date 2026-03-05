import { Save, Loader2, RotateCcw } from "lucide-react";
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
                "flex items-center gap-2 sm:gap-3 duration-300 animate-in fade-in slide-in-from-right-4",
                className
            )}
        >
            {showReset && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="text-gray-400 h-9 transition-all border border-transparent hover:text-white hover:bg-white/5 hover:border-white/10"
                    onClick={onReset}
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                </Button>
            )}
            <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/50 h-9 px-4 transition-all font-bold"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                        <span className="sm:hidden">...</span>
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">{saveLabel}</span>
                        <span className="sm:hidden">Save</span>
                    </>
                )}
            </Button>
        </div>
    );
};
