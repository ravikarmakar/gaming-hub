import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { EVENT_ROUTES } from "@/features/events/lib/routes";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleEnterArena = () => {
    if (user) {
      navigate(EVENT_ROUTES.TOURNAMENTS);
    } else {
      navigate(AUTH_ROUTES.REGISTER);
    }
  };

  return (
    <div className="relative min-h-[140vh] bg-[#02000a] overflow-hidden pb-32">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[#02000a]">
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px] mix-blend-screen" />
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-pink-600/10 rounded-full blur-[80px] mix-blend-screen"
        />
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] left-[20%] w-[25%] h-[25%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen"
        />

        {/* New Top Right Orbs */}
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute top-[10%] right-[10%] w-[20%] h-[20%] bg-purple-600/10 rounded-full blur-[80px] mix-blend-screen"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-50" />
      </div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 pt-20 pb-20 lg:pt-32 lg:pb-32 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-black text-purple-300 uppercase tracking-[0.2em] font-mono">
            WELCOME TO THE NEXT LEVEL
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative text-6xl md:text-6xl lg:text-[8rem] font-black tracking-tighter mb-6 leading-[0.85] select-none"
        >
          <span className="block text-white">DON'T JUST PLAY.</span>
          <span className="relative block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 animate-gradient-x">
            DOMINATE.
            <span className="absolute inset-0 text-cyan-500 opacity-30 blur-sm animate-pulse" aria-hidden="true">DOMINATE.</span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base md:text-xl text-zinc-400 max-w-3xl mb-12 leading-relaxed font-medium"
        >
          Stop watching from the sidelines. Step into the arena where <span className="text-white font-bold">legends are forged</span>. Grind, rank up, and silence the doubters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
        >
          <Button
            size="lg"
            onClick={handleEnterArena}
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-purple-600 text-white font-bold text-base hover:bg-purple-700 transition-all shadow-[0_0_20px_rgba(147,51,234,0.5)] transform hover:-translate-y-1 active:translate-y-0 active:shadow-none"
          >
            ENTER THE ARENA
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(EVENT_ROUTES.TOURNAMENTS)}
            className="w-full sm:w-auto h-12 px-8 rounded-full border-2 border-white/10 bg-white/5 text-white font-bold text-base hover:bg-purple-900/40 hover:border-purple-500/50 hover:text-white backdrop-blur-sm transition-all"
          >
            SCOUT TOURNAMENTS
          </Button>
        </motion.div>
      </motion.div>

      {/* "Why We Are Here" Section - Floating Cards */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Trophy}
          title="Compete"
          description="Join high-stakes tournaments organized by top-tier communities. Prove your worth and climb the global leaderboards."
          delay={0.8}
          color="purple"
        />
        <FeatureCard
          icon={Users}
          title="Connect"
          description="Find your dream team or recruit top talent. Build lasting alliances and dominate the server together."
          delay={1.0}
          color="indigo"
        />
        <FeatureCard
          icon={Zap}
          title="Conquer"
          description="Track your stats, showcase your achievements, and build a legacy that will be remembered forever."
          delay={1.2}
          color="cyan"
        />
      </div>

      {/* Bottom fade for smooth transition */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#02000a] to-transparent z-20 pointer-events-none" />
    </div >
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay, color }: { icon: any, title: string, description: string, delay: number, color: string }) => {
  const colorClasses: Record<string, string> = {
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={cn(
        "p-8 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl hover:bg-purple-900/20 hover:border-purple-500/50 transition-all duration-500 group cursor-pointer",
        "hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(147,51,234,0.3)]"
      )}
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500", colorClasses[color])}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-all">
        {title}
      </h3>
      <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
        {description}
      </p>
    </motion.div>
  );
}

export { HeroSection };
