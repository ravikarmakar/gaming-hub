export const BackgroundAnimation = () => {
  return (
    <>
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/50" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]"
        style={{
          maskImage:
            "radial-gradient(circle at center, black, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black, transparent 90%)",
        }}
      />

      {/* Light vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.3) 100%)",
        }}
      />
    </>
  );
};
