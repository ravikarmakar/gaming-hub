import { FcGoogle } from "react-icons/fc";
import { BsDiscord } from "react-icons/bs";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialLoginProps {
  onGoogleLogin: () => void;
  isGoogleLoading?: boolean;
  onDiscordLogin?: () => void;
  isDiscordLoading?: boolean;
}

export const SocialLogin = ({
  onGoogleLogin,
  isGoogleLoading = false,
  onDiscordLogin,
  isDiscordLoading = false,
}: SocialLoginProps) => {
  const isAnyLoading = isGoogleLoading || isDiscordLoading;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-900/40"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-[10px] text-gray-500 bg-[#0a0a0a] uppercase tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={isAnyLoading}
          onClick={onGoogleLogin}
          className={cn(
            "w-full h-9 bg-gray-900/60 hover:bg-purple-950/40 text-gray-200 hover:text-white border-purple-900/40 hover:border-purple-600/50 font-medium transition-all duration-300",
            isGoogleLoading && "opacity-80"
          )}
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          ) : (
            <FcGoogle className="w-5 h-5" />
          )}
          <span className="text-sm">{isGoogleLoading ? "Connecting..." : "Google"}</span>
        </Button>

        {onDiscordLogin && (
          <Button
            type="button"
            variant="outline"
            disabled={isAnyLoading}
            onClick={onDiscordLogin}
            className={cn(
              "w-full h-9 bg-gray-900/60 hover:bg-purple-950/40 text-gray-200 hover:text-white border-purple-900/40 hover:border-purple-600/50 font-medium transition-all duration-300",
              isDiscordLoading && "opacity-80"
            )}
          >
            {isDiscordLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#5865F2]" />
            ) : (
              <BsDiscord className="w-5 h-5 text-[#5865F2]" />
            )}
            <span className="text-sm">{isDiscordLoading ? "Redirecting..." : "Discord"}</span>
          </Button>
        )}
      </div>
    </div>
  );
};