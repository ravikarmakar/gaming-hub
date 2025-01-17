import { TwitchIcon, YoutubeIcon } from "lucide-react";

export const SocialAuth = () => {
  return (
    <div className="space-y-4">
      <div className="relative flex items-center gap-4">
        <div className="flex-grow h-px bg-gray-800" />
        <span className="text-gray-400 text-sm">or continue with</span>
        <div className="flex-grow h-px bg-gray-800" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg
          bg-purple-600/20 border border-purple-600/30
          hover:bg-purple-600/30 hover:border-purple-600/50
          transition-all duration-300 group"
        >
          <TwitchIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
          <span className="text-purple-400 group-hover:text-purple-300">
            Twitch
          </span>
        </button>

        <button
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg
          bg-red-600/20 border border-red-600/30
          hover:bg-red-600/30 hover:border-red-600/50
          transition-all duration-300 group"
        >
          <YoutubeIcon className="w-5 h-5 text-red-400 group-hover:text-red-300" />
          <span className="text-red-400 group-hover:text-red-300">YouTube</span>
        </button>
      </div>
    </div>
  );
};
