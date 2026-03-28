import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

export const FormSection = ({
    title,
    description,
    icon: Icon,
    iconColor = "text-purple-400",
    children,
    className,
    contentClassName,
}: FormSectionProps) => {
    return (
        <Card className={cn("bg-[#0F111A]/60 border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/5", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    {Icon && <Icon className={cn("w-5 h-5", iconColor)} aria-hidden="true" />}
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className={cn("space-y-6", contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
};
