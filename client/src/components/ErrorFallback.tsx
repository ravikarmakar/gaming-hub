import { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    // Audit Recommendation: Strict Logging
    // In production, integrate with Sentry:
    // Sentry.captureException(error);
    console.error("Tournament Component Crash:", error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center p-8 text-center bg-red-500/5 border border-red-500/20 rounded-2xl backdrop-blur-sm animate-in fade-in duration-500">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Protocol Failure</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-6 font-medium leading-relaxed">
        An unexpected error occurred in this sector. The incident has been logged for command review.
      </p>
      <div className="bg-black/40 p-3 rounded-lg border border-white/5 mb-6 w-full max-w-md">
        <code className="text-[10px] text-red-400 font-mono break-all">{error.message}</code>
      </div>
      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        size="sm"
        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-black uppercase tracking-widest text-[10px] h-9"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-2" />
        Restart Module
      </Button>
    </div>
  );
}
