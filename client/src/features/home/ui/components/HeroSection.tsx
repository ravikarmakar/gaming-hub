import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Trophy, Users, Zap, Shield, Gamepad2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TOURNAMENT_ROUTES } from "@/features/tournaments/lib/routes";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";

// --- Trust Bar Stat ---
const TrustStat = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString();
      }
    });
  }, [springValue]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-white font-black text-lg md:text-xl tabular-nums">
        <span ref={ref}>0</span>{suffix}
      </span>
      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider hidden sm:inline">
        {label}
      </span>
    </div>
  );
};

// --- Feature Card ---
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  delay: number;
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:shadow-purple-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 group-hover:shadow-indigo-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:shadow-cyan-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="group relative p-6 md:p-8 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl 
                 hover:bg-purple-950/20 hover:border-purple-500/30 transition-all duration-500 cursor-pointer
                 hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(147,51,234,0.15)]"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 rounded-3xl animate-shimmer pointer-events-none" />

      <div className="relative z-10">
        <div
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-5 border transition-all duration-500 group-hover:scale-110",
            colorClasses[color]
          )}
        >
          <Icon className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

// --- Main Hero Section ---
const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleEnterArena = () => {
    if (user) {
      navigate(TOURNAMENT_ROUTES.TOURNAMENTS);
    } else {
      navigate(AUTH_ROUTES.REGISTER);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#02000a] overflow-hidden flex flex-col">
      {/* ====== BACKGROUND SYSTEM ====== */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{ opacity: [0.3, 0.15, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-[30%] right-[5%] w-[25%] h-[25%] bg-cyan-600/5 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[10%] left-[40%] w-[20%] h-[20%] bg-pink-600/5 rounded-full blur-[64px]"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)] opacity-60" />

        {/* Radial center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.06)_0%,transparent_70%)]" />
      </div>

      {/* ====== MAIN HERO CONTENT ====== */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 pt-24 pb-8 lg:pt-28 lg:pb-12">
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-[11px] font-black text-purple-300 uppercase tracking-[0.25em] font-mono">
                SEASON 4 — LIVE NOW
              </span>
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            className="text-center max-w-6xl mx-auto mb-8"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] select-none mb-4">
              <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                DON'T JUST PLAY.
              </span>
              <span className="relative block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 animate-gradient-x mt-2">
                DOMINATE.
                <span
                  className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 opacity-40 blur-lg"
                  aria-hidden="true"
                >
                  DOMINATE.
                </span>
              </span>
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            The ultimate esports platform where{" "}
            <span className="text-white font-bold">legends are forged</span>. Compete in
            tournaments, build your dream team, and climb the global
            leaderboards.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12"
          >
            <Button
              size="lg"
              onClick={handleEnterArena}
              className="w-full sm:w-auto h-14 px-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base 
                         hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 
                         transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100"
            >
              ENTER THE ARENA
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(TOURNAMENT_ROUTES.TOURNAMENTS)}
              className="w-full sm:w-auto h-14 px-10 rounded-full border-2 border-white/10 bg-white/[0.03] text-white font-bold text-base 
                         hover:bg-purple-900/30 hover:border-purple-500/40 hover:text-white backdrop-blur-sm 
                         transition-all duration-300 hover:-translate-y-1"
            >
              <Trophy className="w-5 h-5 mr-2" />
              SCOUT TOURNAMENTS
            </Button>
          </motion.div>

          {/* Trust Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-5 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <TrustStat value={2400} suffix="+" label="Online Now" />
            </div>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <TrustStat value={150} suffix="K+" label="Total Players" />
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <TrustStat value={12} suffix="K+" label="Tournaments" />
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Anti-Cheat
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ====== FEATURE CARDS ====== */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <FeatureCard
            icon={Trophy}
            title="Compete & Win"
            description="Join verified tournaments with real prize pools. Anti-cheat protected, fair play guaranteed across 8+ game titles."
            delay={1.0}
            color="purple"
          />
          <FeatureCard
            icon={Users}
            title="Build Your Squad"
            description="Find your dream team with smart matching. Connect with players who match your playstyle, rank, and goals."
            delay={1.2}
            color="indigo"
          />
          <FeatureCard
            icon={Zap}
            title="Rise to Glory"
            description="Track every stat, climb global leaderboards, and build a legacy. Your gaming career starts here."
            delay={1.4}
            color="cyan"
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="relative z-10 flex justify-center pb-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-zinc-600"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#02000a] to-transparent z-20 pointer-events-none" />
    </div>
  );
};

export { HeroSection };
