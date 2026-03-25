import React from 'react';

type ColorVariant = 'emerald' | 'blue' | 'violet' | 'fuchsia' | 'rose';

interface ProfileBadgeProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  colorVariant?: ColorVariant;
  animatePulse?: boolean;
  className?: string;
}

const variantStyles: Record<ColorVariant, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
};

const pulseStyles: Record<ColorVariant, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  fuchsia: 'bg-fuchsia-500',
  rose: 'bg-rose-500',
};

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  icon,
  label,
  colorVariant = 'blue',
  animatePulse = false,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${variantStyles[colorVariant]} ${className}`}
    >
      {animatePulse && (
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${pulseStyles[colorVariant]}`} />
      )}
      {icon}
      {label}
    </div>
  );
};
