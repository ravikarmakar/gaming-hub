import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizerErrorProps {
    message?: string;
    onRetry?: () => void;
    title?: string;
}

export const OrganizerError = ({
    message = "Failed to load organization data",
    onRetry,
    title = "Connection Error"
}: OrganizerErrorProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 w-full">
            <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <AlertCircle className="w-12 h-12 text-red-500" />
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
                    Retry Connection
                </Button>
            )}
        </div>
    );
};
