import React from "react";
import { SCOPES } from "../../lib/scopes";
import type { Scope } from "../../lib/scopes";
import { useAccess, useCurrentUser } from "../../hooks";

interface GuardProps {
  children: React.ReactNode;
  roles?: readonly string[];
  scope?: Scope;
  scopeId?: string;
  minLevel?: number;
  fallback?: React.ReactNode;
  /** 10/10 UX: "hide" (default) or "overlay" (shows glassmorphism lock) */
  mode?: "hide" | "overlay";
}

/**
 * A declarative component to guard UI elements based on roles, scopes, or minLevel.
 * 
 * Example:
 * <Guard roles={['owner']} minLevel={10} fallback={<LockIcon />}>
 *   <TournamentSettings />
 * </Guard>
 */
export const Guard: React.FC<GuardProps> = ({
  children,
  roles = [],
  scope = SCOPES.PLATFORM,
  scopeId,
  minLevel,
  fallback = null,
  mode = "hide",
}) => {
  const { can } = useAccess();
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return null;
  if (!user) return <>{fallback}</>;

  const hasAccess = can({
    scope,
    roles,
    scopeId,
    minLevel,
  });

  if (!hasAccess) {
    if (mode === "overlay") {
      return (
        <div className="relative group overflow-hidden rounded-xl border border-white/10">
          {/* The "Locked" Content (Blurred) */}
          <div className="blur-md opacity-40 pointer-events-none select-none">
            {children}
          </div>

          {/* Premium Glassmorphism Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm transition-all duration-300">
            <div className="w-12 h-12 mb-4 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>

            <h4 className="text-white font-bold text-lg mb-1">Locked Feature</h4>
            {minLevel && (
              <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                <span className="text-blue-400 text-xs font-black uppercase tracking-wider">Level {minLevel} Required</span>
              </div>
            )}
            <p className="text-white/40 text-xs mt-3 text-center max-w-[200px]">
              {roles.length > 0 ? `Requires ${roles.join(', ')} Role` : 'Keep playing to unlock this feature!'}
            </p>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
