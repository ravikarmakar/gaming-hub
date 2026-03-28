import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'glass';

interface ProfileActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  icon?: React.ReactElement;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20 shadow-xl',
  secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20',
  outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5',
  glass: 'bg-black/40 hover:bg-violet-500/20 text-white border border-white/10 hover:border-violet-500/50 backdrop-blur-md',
};

export const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <Button
      className={cn(
        'h-12 px-8 rounded-2xl transition-all active:scale-95 group font-black tracking-widest text-xs uppercase',
        fullWidth ? 'w-full' : 'w-auto',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && React.cloneElement(icon, {
        className: cn('w-4 h-4 mr-2 transition-all', icon.props.className)
      })}
      {children}
    </Button>
  );
};
