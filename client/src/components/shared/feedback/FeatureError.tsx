import { AlertCircle, RefreshCw, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FeatureErrorProps {
    message?: string;
    onRetry?: () => void;
    title?: string;
    icon?: LucideIcon;
    retryLabel?: string;
    className?: string;
}

export const FeatureError = ({
    message = "Failed to load data",
    onRetry,
    title = "Connection Error",
    icon: Icon = AlertCircle,
    retryLabel = "Retry Connection",
    className,
}: FeatureErrorProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[60vh] text-center p-6 w-full", className)}>
            <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <Icon className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
            <p className="text-gray-400 max-w-md mb-8 text-lg">{message}</p>
            {onRetry && (
                <Button
                    variant="outline"
                    onClick={onRetry}
                    className="border-white/10 hover:bg-white/5 bg-white/5 text-white gap-2 pl-4 pr-6 h-12 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                    <RefreshCw className="w-4 h-4" />
                    {retryLabel}
                </Button>
            )}
        </div>
    );
};
