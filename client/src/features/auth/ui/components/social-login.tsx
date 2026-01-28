import { FcGoogle } from "react-icons/fc";
import { BsDiscord } from "react-icons/bs";

import { Button } from "@/components/ui/button";

interface SocialLoginProps {
  onGoogleLogin: () => void;
  onDiscordLogin?: () => void;
}

export const SocialLogin = ({
  onGoogleLogin,
  onDiscordLogin,
}: SocialLoginProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700/50"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-xs text-gray-400 bg-[#0a0a0a]">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleLogin}
          className="w-full h-9 bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium transition-all duration-200 hover:shadow-md hover:shadow-purple-500/20 hover:ring-1 hover:ring-purple-500/20"
        >
          <FcGoogle className="w-5 h-5" />
          <span>Google</span>
        </Button>

        {onDiscordLogin && (
          <Button
            type="button"
            variant="outline"
            onClick={onDiscordLogin}
            className="w-full h-9 bg-[#5865F2] hover:bg-[#4752C4] text-white border-[#5865F2] font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#5865F2]/40 hover:ring-1 hover:ring-[#5865F2]/50"
          >
            <BsDiscord className="w-5 h-5" />
            <span>Discord</span>
          </Button>
        )}
      </div>
    </div>
  );
};
