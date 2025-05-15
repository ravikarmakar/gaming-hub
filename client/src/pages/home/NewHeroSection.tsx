import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Trophy,
  Users,
  Calendar,
  Target,
  Zap,
  Crosshair,
  Flame,
} from "lucide-react";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hoverCard, setHoverCard] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const ctaRef = useRef(null);

  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle countdown timer
  useEffect(() => {
    const targetDate = new Date("2025-06-15T00:00:00");
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = (heroRef.current as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle CTA pulse animation
  useEffect(() => {
    if (ctaRef.current) {
      const pulseInterval = setInterval(() => {
        ctaRef.current.classList.add("scale-105");
        ctaRef.current.classList.add("shadow-glow");
        setTimeout(() => {
          if (ctaRef.current) {
            ctaRef.current.classList.remove("scale-105");
            ctaRef.current.classList.remove("shadow-glow");
          }
        }, 700);
      }, 3000);
      return () => clearInterval(pulseInterval);
    }
  }, []);

  // Game stats for animated display
  const gameStats = [
    {
      label: "Prize Pool",
      value: "₹100,000",
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
    },
    {
      label: "Teams",
      value: "100+",
      icon: <Users className="w-4 h-4 text-blue-400" />,
    },
    {
      label: "Maps",
      value: "4",
      icon: <Target className="w-4 h-4 text-red-400" />,
    },
    {
      label: "Rounds",
      value: "6",
      icon: <Zap className="w-4 h-4 text-purple-400" />,
    },
  ];

  return (
    <div
      ref={heroRef}
      className="relative w-full min-h-screen py-20 bg-black overflow-hidden"
    >
      {/* Futuristic cyber grid background */}
      <div className="absolute inset-0 z-0">
        {/* Animated grid lines */}
        <div
          className="absolute inset-0"
          style={{
            background: `
            linear-gradient(90deg, rgba(16,18,27,0.9) 21px, transparent 1%) center,
            linear-gradient(rgba(16,18,27,0.9) 21px, transparent 1%) center,
            rgba(0, 0, 0, 0.8)
          `,
            backgroundSize: "22px 22px",
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        ></div>
        {/* Hexagon mesh pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpolygon points='14,0 28,12.5 14,25 0,12.5'/%3E%3Cpolygon points='14,25 28,37.5 14,50 0,37.5'/%3E%3C/g%3E%3C/svg%3E")`,
            transform: `translateY(${-scrollY * 0.1}px)`,
          }}
        ></div>
        {/* Dynamic glowing orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-xl"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 20}%`,
                backgroundColor: i % 2 === 0 ? "#1a6dff" : "#ff1a5e",
                width: `${150 + i * 30}px`,
                height: `${150 + i * 30}px`,
                opacity: 0.06 + i * 0.01,
                transform: `translate(
                  ${Math.sin(scrollY * 0.001 + i) * 100}px, 
                  ${Math.cos(scrollY * 0.001 + i) * 100}px
                )`,
                transition: "transform 0.1s ease-out",
              }}
            />
          ))}
        </div>
        {/* Parallax layer */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-purple-900/10"
          style={{
            transform: `translate(
              ${(mousePosition.x - 0.5) * -20}px, 
              ${(mousePosition.y - 0.5) * -20}px
            )`,
            transition: "transform 0.05s ease-out",
          }}
        ></div>
        {/* Edge glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/10 via-transparent to-red-700/10"></div>
        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(0deg, rgba(255,255,255,.03) 1px, transparent 1px)",
            backgroundSize: "100% 4px",
            backgroundRepeat: "repeat",
            zIndex: 2,
          }}
        ></div>
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
            mixBlendMode: "overlay",
          }}
        ></div>
      </div>
      {/* Main content container with entrance animation */}
      <div
        className={`relative flex flex-col w-full min-h-screen px-4 py-10 mx-auto transition-all duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container max-w-6xl mx-auto my-auto">
          {/* Top navigation bar/pill indicators */}
          <div className="flex items-center justify-between py-2 mb-12">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <div className="px-4 py-1 text-xs font-bold text-green-400 uppercase border border-green-500/30 rounded-full bg-green-900/20">
                Server Status: Online
              </div>
              <div className="w-px h-6 mx-4 bg-gray-700"></div>
              <div className="px-4 py-1 text-xs font-bold text-purple-300 uppercase border border-purple-500/30 rounded-full bg-purple-900/20">
                Players online: 2,487
              </div>
            </div>
          </div>
          {/* Hero content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left column - Text content */}
            <div
              className="space-y-8 z-10"
              style={{
                transform: `translateY(${(mousePosition.y - 0.5) * -10}px)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Eyebrow text with glitch effect */}
              <div className="relative inline-flex items-center px-3 py-1 overflow-hidden font-mono text-xs tracking-widest text-cyan-300 uppercase bg-cyan-900/20 border border-cyan-500/20 rounded-md before:absolute before:inset-0 before:bg-cyan-500/10 before:animate-pulse">
                <span className="relative z-10 flex items-center">
                  <span className="w-2 h-2 mr-2 bg-cyan-400 rounded-full animate-ping"></span>
                  Live Registration Open
                </span>
              </div>
              {/* Main heading with animated gradient */}
              <h1
                className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl"
                style={{
                  transform: `translateY(${(mousePosition.y - 0.5) * -5}px)`,
                  transition: "transform 0.15s ease-out",
                }}
              >
                <div className="mb-2 text-white">NEXT-GEN</div>
                <div
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #00dbde, #fc00ff)",
                    backgroundSize: "200% 200%",
                    animation: "gradient-shift 3s ease infinite",
                  }}
                >
                  BATTLE ARENA
                </div>
                <div className="text-3xl font-bold text-gray-300">
                  FREE FIRE & PUBG
                </div>
              </h1>
              {/* Descriptive text with cyberpunk style */}
              <p
                className="max-w-lg text-xl text-cyan-100"
                style={{
                  textShadow: "0 0 10px rgba(80, 240, 255, 0.3)",
                }}
              >
                Enter the ultimate gaming zone where legends are born. Compete
                in a high-stakes tournament with cutting-edge gameplay and
                real-time spectator integration.
              </p>
              {/* Countdown timer */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                  Tournament begins in:
                </h3>
                <div className="flex space-x-4">
                  {Object.entries(countdown).map(([unit, value]) => (
                    <div key={unit} className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg">
                        {value < 10 ? `0${value}` : value}
                      </div>
                      <div className="mt-1 text-xs font-medium text-gray-400 uppercase">
                        {unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* CTA buttons with advanced hover effects */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  ref={ctaRef}
                  className="relative px-8 py-4 font-bold text-white uppercase transition-all transform rounded-md group hover:scale-105"
                  style={{
                    background: "linear-gradient(90deg, #fc00ff, #00dbde)",
                    boxShadow: "0 0 25px rgba(252, 0, 255, 0.2)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={() =>
                    ctaRef.current.classList.add("shadow-glow")
                  }
                  onMouseLeave={() =>
                    ctaRef.current.classList.remove("shadow-glow")
                  }
                >
                  <span className="relative z-10 flex items-center">
                    REGISTER NOW
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </span>
                  <div className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 bg-gradient-to-r from-yellow-500 to-red-500 rounded-md group-hover:opacity-100"></div>
                </button>
                <button className="px-8 py-4 font-bold text-white uppercase transition-all bg-transparent border border-gray-500 rounded-md backdrop-blur-sm hover:bg-white/5 hover:border-cyan-500 hover:text-cyan-300">
                  Watch Trailer
                </button>
              </div>
              {/* Social proof/stats */}
              <div>
                <div className="flex flex-wrap items-center mb-2 space-x-1 text-gray-400">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 border border-gray-800"
                      ></div>
                    ))}
                  </div>
                  <span className="ml-2 text-sm">
                    +2.4k players already registered
                  </span>
                </div>
              </div>
            </div>
            {/* Right column - 3D card and stats */}
            <div
              className="relative p-1 rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/90 to-black/80 backdrop-blur-lg overflow-hidden group"
              style={{
                boxShadow: "0 20px 80px -10px rgba(66, 71, 91, 0.1)",
                transform: `perspective(2000px) rotateY(${
                  (mousePosition.x - 0.5) * 10
                }deg) rotateX(${(mousePosition.y - 0.5) * -10}deg)`,
                transition: "transform 0.1s ease-out",
              }}
              onMouseEnter={() => setHoverCard(true)}
              onMouseLeave={() => setHoverCard(false)}
            >
              {/* Glowing border effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(90deg, #fc00ff, #00dbde, #fc00ff)",
                  backgroundSize: "200% auto",
                  animation: "border-flow 3s linear infinite",
                  filter: "blur(12px)",
                  zIndex: -1,
                }}
              ></div>
              {/* Card content */}
              <div className="relative p-5 overflow-hidden bg-gray-900 rounded-xl">
                {/* Tournament image with overlay */}
                <div className="relative overflow-hidden rounded-lg group">
                  {/* Holographic image effect */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent opacity-70"></div>
                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                  <img
                    src="/api/placeholder/800/500"
                    alt="Battle Royale Tournament"
                    className={`object-cover w-full h-64 md:h-80 transition-transform duration-700 group-hover:scale-110 ${
                      hoverCard ? "scale-105" : "scale-100"
                    }`}
                  />
                  {/* Overlay elements */}
                  <div className="absolute top-0 left-0 z-20 p-4">
                    <div className="px-3 py-1 text-xs font-bold text-cyan-300 uppercase bg-cyan-900/30 border border-cyan-500/30 rounded-md backdrop-blur-sm">
                      Official Tournament
                    </div>
                  </div>
                  {/* Brand elements */}
                  <div className="absolute bottom-0 right-0 z-20 p-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="text-lg font-bold tracking-widest text-white uppercase">
                        LIVE STREAM
                      </div>
                    </div>
                  </div>
                </div>
                {/* Stats and game info */}
                <div className="p-4 space-y-6">
                  {/* Game stats with pulsing animations */}
                  <div className="grid grid-cols-2 gap-4">
                    {gameStats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center px-2 py-1 text-xs text-cyan-300 bg-cyan-900/20 border border-cyan-500/20 rounded-full"
                        style={{
                          animationDelay: `${index * 200}ms`,
                          transform: hoverCard
                            ? `translateY(${index % 2 === 0 ? -3 : 3}px)`
                            : "translateY(0)",
                          transition: "transform 0.3s ease",
                        }}
                      >
                        <div className="flex items-center justify-center p-2 bg-gray-700/50 rounded-md">
                          {stat.icon}
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">
                            {stat.label}
                          </div>
                          <div className="text-lg font-bold text-white">
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Tournament progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-400">
                        Registration capacity
                      </div>
                      <div className="text-sm font-bold text-cyan-400">
                        72% Full
                      </div>
                    </div>
                    <div className="relative h-2 overflow-hidden bg-gray-800 rounded-full">
                      <div
                        className="absolute top-0 bottom-0 left-0 w-4/5 bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{
                          width: "72%",
                          boxShadow: "0 0 10px rgba(6, 182, 212, 0.5)",
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-cyan-300">
                      <span className="font-bold">
                        Limited slots remaining!
                      </span>{" "}
                      Register before they fill up
                    </div>
                  </div>
                  {/* Tournament features */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: "Cross Platform",
                        icon: <Crosshair className="w-3 h-3" />,
                      },
                      {
                        label: "Live Streaming",
                        icon: <Flame className="w-3 h-3" />,
                      },
                      {
                        label: "Pro Coaches",
                        icon: <Users className="w-3 h-3" />,
                      },
                    ].map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center px-3 py-1 text-xs font-medium text-cyan-200 bg-gray-800/60 border border-cyan-500/10 rounded-full gap-2"
                      >
                        {feature.icon}
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* End main content container */}
    </div>
  );
}
