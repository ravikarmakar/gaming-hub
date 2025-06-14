import { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="p-4 text-red-700 bg-red-100 rounded">
      <p>Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-1 mt-2 text-white bg-red-500 rounded"
      >
        Try again
      </button>
    </div>
  );
}
