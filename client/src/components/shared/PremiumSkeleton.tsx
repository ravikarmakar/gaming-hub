import { cn } from "@/lib/utils";

interface PremiumSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    variant?: "card" | "text" | "avatar" | "circle";
}

export const PremiumSkeleton = ({
    className,
    variant = "card",
    ...props
}: PremiumSkeletonProps) => {
    return (
        <div
            className={cn(
                "relative overflow-hidden bg-white/[0.03] border border-white/5",
                "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent",
                {
                    "rounded-3xl": variant === "card",
                    "rounded-md": variant === "text",
                    "rounded-full": variant === "avatar" || variant === "circle",
                },
                className
            )}
            {...props}
        />
    );
};
