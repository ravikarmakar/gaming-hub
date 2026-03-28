import { LoaderCircle as Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeatureSkeletonProps {
    message?: string;
    className?: string;
    variant?: "default" | "fullscreen";
}

export const FeatureSkeleton = ({
    message = "Loading...",
    className,
    variant = "default",
}: FeatureSkeletonProps) => {
    return (
        <div className={cn(
            "flex items-center justify-center w-full transition-all duration-500",
            variant === "fullscreen" ? "fixed inset-0 min-h-screen bg-[#050505] z-[100]" : "min-h-[40vh]",
            className
        )}>
            <div className="text-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                    <Loader2 className="w-12 h-12 mx-auto text-purple-400 animate-spin relative z-10" />
                </div>
                <p className="text-sm font-medium text-gray-400 animate-pulse">{message}</p>
            </div>
        </div>
    );
};
