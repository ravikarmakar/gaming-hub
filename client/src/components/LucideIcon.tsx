import * as LucideIcons from "lucide-react";
import { icons } from "lucide-react";

type IconNames = keyof typeof icons;

interface LucideIconProps {
  icon: IconNames;
  size?: number;
  className?: string;
}

export const LucideIcon = ({ icon, size = 24, className }: LucideIconProps) => {
  const LucideIcon = LucideIcons[icon] || LucideIcons.Activity;

  return (
    <div className={`${className}`}>
      <LucideIcon size={size} />
    </div>
  );
};
