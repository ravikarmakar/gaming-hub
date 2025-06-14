import { Loader } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/20 via-[#1a093e]/20 to-[#0a0f1d]/20 backdrop-blur-md z-50">
      <div>
        <Loader className="w-16 h-16 text-purple-400 animate-spin sm:w-10 sm:h-10" />
      </div>
    </div>
  );
}
