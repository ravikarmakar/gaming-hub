import React from "react";
import { Loader2, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";

export type DialogVariant = "danger" | "warning" | "success" | "info" | "default";

interface ConfirmActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string | React.ReactNode;
    actionLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
    confirmDisabled?: boolean;
    variant?: DialogVariant;
    icon?: React.ReactNode;
}

const variantStyles = {
    danger: {
        title: "text-red-500",
        action: "bg-red-600 hover:bg-red-500 text-white border-0 shadow-[0_0_20px_rgba(220,38,38,0.3)]",
        icon: <AlertTriangle className="text-red-500 w-5 h-5" />,
    },
    warning: {
        title: "text-amber-500",
        action: "bg-amber-600 hover:bg-amber-500 text-white border-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
        icon: <AlertCircle className="text-amber-500 w-5 h-5" />,
    },
    success: {
        title: "text-green-500",
        action: "bg-green-600 hover:bg-green-500 text-white border-0 shadow-[0_0_20px_rgba(22,163,74,0.3)]",
        icon: <CheckCircle2 className="text-green-500 w-5 h-5" />,
    },
    info: {
        title: "text-blue-500",
        action: "bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]",
        icon: <Info className="text-blue-500 w-5 h-5" />,
    },
    default: {
        title: "text-white",
        action: "bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
        icon: <Info className="text-purple-400 w-5 h-5" />,
    },
};

export const ConfirmActionDialog = ({
    open,
    onOpenChange,
    title,
    description,
    actionLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    isLoading = false,
    confirmDisabled = false,
    variant = "default",
    icon,
}: ConfirmActionDialogProps) => {
    const styles = variantStyles[variant];

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#0F0720]/95 border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <AlertDialogHeader>
                    <AlertDialogTitle className={cn("text-2xl font-black tracking-tight flex items-center gap-2", styles.title)}>
                        {icon || styles.icon}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400 font-medium leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 sm:gap-0 mt-4">
                    <AlertDialogCancel
                        className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading || confirmDisabled}
                        className={cn("transition-all font-bold", styles.action, (isLoading || confirmDisabled) && "opacity-50 cursor-not-allowed")}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            actionLabel
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
