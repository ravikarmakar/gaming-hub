import { useState } from "react";
import { AlertTriangle, LucideIcon } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/dialogs/ConfirmActionDialog";

export interface DangerZoneProps {
    title: React.ReactNode;
    description: React.ReactNode;
    icon?: LucideIcon;
    warningContent?: React.ReactNode;

    // Action Section
    actionTitle?: React.ReactNode;
    actionDescription?: React.ReactNode;
    buttonText: React.ReactNode;
    buttonIcon?: LucideIcon;

    // Dialog Section
    dialogTitle: string;
    dialogDescription: React.ReactNode;
    dialogConfirmLabel: string;

    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;

    // Styling overrides
    className?: string;
}

export const DangerZone = ({
    title,
    description,
    icon: Icon = AlertTriangle,
    warningContent,
    actionTitle,
    actionDescription,
    buttonText,
    buttonIcon: ButtonIcon,
    dialogTitle,
    dialogDescription,
    dialogConfirmLabel,
    onConfirm,
    isLoading = false,
    className = "",
}: DangerZoneProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleConfirm = async () => {
        try {
            await onConfirm();
        } finally {
            setIsDialogOpen(false);
        }
    };

    return (
        <Card className={`bg-red-500/5 border-red-500/20 overflow-hidden relative shadow-inner ${className}`}>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Icon size={120} />
            </div>

            <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2 text-xl">
                    <Icon className="w-5 h-5" />
                    {title}
                </CardTitle>
                <CardDescription className="text-gray-400">
                    {description}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {warningContent && (
                    <div className="text-sm text-red-300/60 mb-6 leading-relaxed bg-red-950/20 p-4 rounded-lg border border-red-500/10">
                        {warningContent}
                    </div>
                )}

                {actionTitle || actionDescription ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div className="space-y-1">
                            {actionTitle && <h4 className="text-white font-semibold">{actionTitle}</h4>}
                            {actionDescription && <p className="text-sm text-gray-400">{actionDescription}</p>}
                        </div>
                        <Button
                            type="button"
                            onClick={() => setIsDialogOpen(true)}
                            variant="destructive"
                            disabled={isLoading}
                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 transition-all font-bold min-w-[140px]"
                        >
                            {buttonText}
                            {ButtonIcon && <ButtonIcon className="size-4 ml-2" />}
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="destructive"
                        onClick={() => setIsDialogOpen(true)}
                        disabled={isLoading}
                        className="bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white font-black px-8"
                    >
                        {buttonText}
                        {ButtonIcon && <ButtonIcon className="size-4 ml-2" />}
                    </Button>
                )}

                <ConfirmActionDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    title={dialogTitle}
                    description={dialogDescription}
                    actionLabel={dialogConfirmLabel}
                    onConfirm={handleConfirm}
                    isLoading={isLoading}
                    variant="danger"
                />
            </CardContent>
        </Card>
    );
};
