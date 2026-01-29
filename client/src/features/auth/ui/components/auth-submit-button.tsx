import { LoaderCircle, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps {
    isLoading: boolean;
    isSuccess?: boolean;
    label: string;
    loadingLabel: string;
    successLabel?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Reusable submit button for auth forms with loading and success states
 */
export const AuthSubmitButton = ({
    isLoading,
    isSuccess = false,
    label,
    loadingLabel,
    successLabel = "Success!",
    disabled = false,
    className,
}: AuthSubmitButtonProps) => {
    return (
        <Button
            type="submit"
            variant="gradient"
            className={cn("w-full h-10 px-4", className)}
            disabled={isLoading || isSuccess || disabled}
        >
            {isLoading ? (
                <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>{loadingLabel}</span>
                </>
            ) : isSuccess ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>{successLabel}</span>
                </>
            ) : (
                <>
                    <span className="text-sm">{label}</span>
                    <ArrowRight className="w-4 h-4" />
                </>
            )}
        </Button>
    );
};