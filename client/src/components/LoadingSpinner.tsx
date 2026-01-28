import { Loader } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 via-purple-950/50 to-black/40 backdrop-blur-lg z-50">
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-purple-600/30 rounded-full animate-pulse" />
        <Loader className="relative w-16 h-16 text-purple-400 animate-spin sm:w-10 sm:h-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
      </div>
    </div>
  );
}
