import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, AlertTriangle, Terminal, Cpu, Activity, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";

export const NotFound = () => {
  const navigate = useNavigate();
  const [glitchTitle, setGlitchTitle] = useState("404");

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);

  const springMouseX = useSpring(mouseX, springConfig);
  const springMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPct = (clientX / innerWidth - 0.5) * 20;
      const yPct = (clientY / innerHeight - 0.5) * -20;

      mouseX.set(clientX);
      mouseY.set(clientY);
      rotateX.set(yPct);
      rotateY.set(xPct);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [rotateX, rotateY, mouseX, mouseY]);

  // Random glitch effect for the title
  useEffect(() => {
    const chars = "404%/!X";
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        const glitched = "404".split("").map(c => Math.random() > 0.8 ? chars[Math.floor(Math.random() * chars.length)] : c).join("");
        setGlitchTitle(glitched);
        setTimeout(() => setGlitchTitle("404"), 150);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0514] font-mono selection:bg-purple-500/30 cursor-none">

      {/* Dynamic Cursor Spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 mix-blend-soft-light"
        style={{
          background: `radial-gradient(circle 300px at ${springMouseX.get()}px ${springMouseY.get()}px, rgba(139, 92, 246, 0.15), transparent 80%)`,
        }}
        animate={{
          background: `radial-gradient(circle 300px at ${springMouseX.get()}px ${springMouseY.get()}px, rgba(139, 92, 246, 0.15), transparent 80%)`
        }}
      />

      {/* Cyber Background Layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Tilting Data Streams */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-[150%] h-[150%] opacity-20">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: ["-20%", "20%"],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                  duration: 5 + i * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                style={{ top: `${20 * i}%` }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Corrupted HUD Elements */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none opacity-40">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-purple-500 font-bold tracking-widest animate-pulse">
              <ShieldAlert size={12} /> CRITICAL_SYSTEM_FAILURE: SECTOR_ZERO
            </div>
            <div className="text-[8px] text-white/20 whitespace-pre font-mono leading-none">
              {`[STATUS] OFFLINE\n[LOC] UNKNOWN_VAR_77\n[AUTH] ACCESS_DENIED`}
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center justify-end gap-2 text-violet-400">
              <span className="text-[10px] uppercase font-black">Link_Status</span>
              <Activity size={12} className="animate-bounce" />
            </div>
            <div className="w-32 h-[2px] bg-white/5 relative overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-violet-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <Cpu size={24} className="text-white/10" />
            <div className="text-[8px] text-white/20 tracking-[0.4em] uppercase">
              Neural_Nexus_Sync: FAILED
            </div>
          </div>
          <div className="font-mono text-[8px] text-white/10 text-right">
            0x000FF404 // KERNEL_PANIC
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-20 flex flex-col items-center"
      >
        <div className="relative group">
          {/* Chromatic Aberration Layers */}
          <motion.div
            animate={{
              x: [-1, 1, -1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
            className="absolute inset-0 text-[150px] md:text-[280px] font-black font-orbitron text-purple-600 mix-blend-screen blur-[2px] select-none pointer-events-none opacity-40"
          >
            {glitchTitle}
          </motion.div>
          <motion.div
            animate={{
              x: [1, -1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
            className="absolute inset-0 text-[150px] md:text-[280px] font-black font-orbitron text-indigo-500 mix-blend-screen blur-[2px] select-none pointer-events-none opacity-40"
          >
            {glitchTitle}
          </motion.div>

          <h1 className="text-[150px] md:text-[280px] font-black font-orbitron text-white leading-none tracking-tighter drop-shadow-2xl relative z-10 transition-all duration-75">
            {glitchTitle}
          </h1>

          {/* Center Scanline */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-white/20 blur-sm z-20 pointer-events-none"
          />
        </div>

        {/* Message HUD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl max-w-lg text-center relative group overflow-hidden"
        >
          {/* Corner Decals */}
          <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-violet-500/50" />
          <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-violet-500/50" />
          <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-violet-500/50" />
          <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-violet-500/50" />

          <h2 className="text-xl md:text-3xl font-black font-grotesk uppercase italic tracking-widest text-white mb-4">
            Connection Lost
          </h2>
          <p className="text-white/40 text-[10px] md:text-xs leading-relaxed uppercase tracking-[0.2em]">
            The requested sector has been detached from the grid.
            Reality sync error detected at 0x404.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="h-12 px-6 rounded-xl border border-white/5 hover:bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest group"
            >
              <Terminal size={14} className="mr-2 text-violet-500" />
              Retry_Link
            </Button>

            <Button
              onClick={() => navigate("/")}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest relative overflow-hidden group shadow-2xl shadow-purple-600/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Home size={14} className="mr-2" />
              Return_Home
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Background Ambience Icons */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 text-white/5 border border-white/5 p-4 rounded-full animate-pulse">
        <AlertTriangle size={48} />
      </div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 text-white/5 border border-white/5 p-4 rounded-full animate-pulse" style={{ animationDelay: '1s' }}>
        <ShieldAlert size={48} />
      </div>

    </div>
  );
};
