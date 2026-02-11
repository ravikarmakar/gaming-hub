import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, Terminal } from "lucide-react";
import { Button } from "./ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth Mouse Position Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 100 });

  // 3D Parallax Values
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { damping: 20, stiffness: 80 });
  const rotateY = useSpring(rawRotateY, { damping: 20, stiffness: 80 });

  // Reactive spotlight gradient
  const spotlightBackground = useMotionTemplate`radial-gradient(circle 500px at ${smoothX}px ${smoothY}px, rgba(139, 92, 246, 0.1), transparent 80%)`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      mouseX.set(clientX);
      mouseY.set(clientY);

      // Calculate parallax rotation
      const xPct = (clientX / innerWidth - 0.5) * 15;
      const yPct = (clientY / innerHeight - 0.5) * -15;
      rawRotateX.set(yPct);
      rawRotateY.set(xPct);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, rawRotateX, rawRotateY]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050110] font-mono selection:bg-purple-500/30 px-4"
    >
      {/* Texture Overlays */}
      <div className="absolute inset-0 z-[50] pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div className="absolute inset-0 z-[51] pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Interactive Mouse Spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-10 mix-blend-soft-light opacity-40 hidden md:block"
        style={{
          background: spotlightBackground,
        }}
      />

      {/* Dynamic Background Orbs (Subdued) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 60, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] max-w-[600px] bg-[#581c87]/10 blur-[130px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] max-w-[500px] bg-[#9333ea]/5 blur-[130px] rounded-full"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center max-w-2xl w-full text-center py-12">
        {/* Premium Large 404 with 3D Parallax */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative group cursor-default"
        >
          <div className="absolute inset-[-20%] blur-[60px] bg-purple-500/5 group-hover:bg-purple-500/15 transition-all duration-1000 rounded-full"
            style={{ transform: "translateZ(-50px)" }} />

          <h1 className="text-[clamp(140px,25vw,280px)] font-[900] font-orbitron leading-none tracking-tighter select-none
            text-transparent bg-clip-text bg-gradient-to-b from-white via-white/70 to-purple-900/40
            drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] relative z-10"
            style={{ transform: "translateZ(50px)" }}>
            404
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="absolute top-1/2 left-[-10%] right-[-10%] h-[2px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
            style={{ transform: "translateZ(25px)" }}
          />
        </motion.div>

        {/* Narrative Section */}
        <div className="mt-4 md:mt-8 space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-5xl font-black font-orbitron tracking-[0.2em] text-white/90 uppercase italic">
              Page Not Found
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-gray-500 text-sm md:text-xl leading-relaxed max-w-sm md:max-w-md mx-auto font-medium px-4"
          >
            The page you are looking for doesn't exist or has been moved.
          </motion.p>
        </div>

        {/* Action Hub */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 md:mt-20 flex flex-col sm:flex-row gap-4 md:gap-8 w-full sm:w-auto px-6"
        >
          <Button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            variant="ghost"
            className="group relative h-14 md:h-16 px-8 md:px-12 rounded-2xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-xl text-gray-500 hover:text-white transition-all overflow-hidden flex-1 sm:flex-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Terminal size={20} className="mr-3 text-purple-600/60 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <span className="relative z-10 font-black tracking-[0.2em] uppercase text-[10px] md:text-xs">Go Back</span>
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="group relative h-14 md:h-16 px-10 md:px-14 rounded-2xl bg-purple-900/10 border border-purple-500/20 text-purple-300 font-black hover:bg-purple-900/20 transition-all shadow-2xl overflow-hidden flex-1 sm:flex-none"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/05 via-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Home size={20} className="mr-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform" />
            <span className="relative z-10 tracking-[0.2em] uppercase text-[10px] md:text-xs text-purple-200">Return Home</span>
          </Button>
        </motion.div>

        {/* Global Footer Trace */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-16 md:mt-28 flex items-center gap-6 text-[9px] md:text-[10px] font-mono tracking-[0.6em] text-purple-500/40 uppercase"
        >
          <span className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
          KRM ESPORTS // ERROR 404
          <span className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
        </motion.div>
      </div>

    </div>
  );
};



