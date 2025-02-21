import React, { useState } from "react";
import { Users, Trophy, Calendar, Gamepad, Target, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhatsNew: React.FC = () => {
  const navigate = useNavigate();
  const [, setActiveFeature] = useState(0);

  // Custom button styles for each feature
  const buttonStyles = {
    players: {
      background: "bg-gradient-to-r from-violet-600/80 to-fuchsia-600",
      hover: "hover:from-fuchsia-600 hover:to-violet-600",
      shadow: "shadow-violet-500/25",
      icon: "→",
    },
    tournaments: {
      background: "bg-gradient-to-r from-cyan-500/80 to-blue-600",
      hover: "hover:from-blue-600 hover:to-cyan-500",
      shadow: "shadow-cyan-500/25",
      icon: "↗",
    },
    team: {
      background: "bg-gradient-to-r from-emerald-500/80 to-teal-600",
      hover: "hover:from-teal-600 hover:to-emerald-500",
      shadow: "shadow-emerald-500/20",
      icon: "⚡",
    },
  };

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      secondaryIcon: <Gamepad className="w-6 h-6" />,
      title: "Build Your Dream Team",
      subtitle: "Pro Player Searching",
      description:
        "Connect with elite players regional. Advanced player finding system with real-time stats tracking.",
      stats: {
        players: "10,000+",
        matchRate: "80%",
        activeDaily: "2,400+",
      },
      bgColor: "from-violet-500/20 to-fuchsia-500/20",
      accentColor: "purple-400",
      buttonText: "Find Players",
      buttonStyle: buttonStyles.players,
      action: () => navigate("/players"),
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      secondaryIcon: <Target className="w-6 h-6" />,
      title: "Compete & Conquer",
      subtitle: "Premium Tournaments",
      description:
        "Join high-stakes tournaments with massive prize pools. Live streaming and pro casting included.",
      stats: {
        prizePool: "$50,000",
        monthlyEvents: "500+",
        viewers: "100K+",
      },
      bgColor: "from-cyan-500/20 to-blue-500/20",
      accentColor: "cyan-400",
      buttonText: "Join Tournaments",
      buttonStyle: buttonStyles.tournaments,
      action: () => navigate("/events"),
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      secondaryIcon: <Flame className="w-6 h-6" />,
      title: "Dominate The Scene",
      subtitle: "Team Management",
      description:
        "Professional tools for serious teams. AI-powered insights and performance analytics.",
      stats: {
        proTeams: "2,000+",
        winRate: "+40%",
        insights: "24/7",
      },
      bgColor: "from-emerald-500/20 to-teal-500/20",
      accentColor: "emerald-400",
      buttonText: "Create Team",
      buttonStyle: buttonStyles.team,
      action: () => navigate("/team"),
    },
  ];

  return (
    <section className="relative py-12 sm:py-24 overflow-hidden bg-gray">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,157,0.1),rgba(0,0,0,0))]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(0,184,255,0.1),rgba(0,0,0,0))]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Floating elements */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>

        {/* Main content */}
        <div className="relative">
          {/* Header section with gaming-inspired design */}
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="inline-block text-3xl md:text-5xl font-bold mb-4 sm:mb-6 relative">
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#00FF9D] via-[#00B8FF] to-[#FF00E5]">
                What's New ? here
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#00FF9D] via-[#00B8FF] to-[#FF00E5] blur-sm"></div>
              <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-[#00FF9D] via-[#00B8FF] to-[#FF00E5]"></div>
            </h2>
            <p className="text-gray-300 max-w-3xl text-sm md:text-base mx-auto px-4">
              Level up your esports career with pro tools trusted by top teams
              worldwide
            </p>
          </div>

          {/* Interactive feature cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-1 rounded-2xl bg-gradient-to-br ${feature.bgColor}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="relative h-full bg-black/90 backdrop-blur-xl rounded-2xl p-4 sm:p-8 overflow-hidden">
                  {/* Glowing orb effect */}
                  <div
                    className={`absolute -top-10 -right-10 w-40 h-40 bg-${feature.accentColor}/5 rounded-full blur-2xl
                                 transform transition-transform duration-700 group-hover:scale-150`}
                  ></div>

                  {/* Header with icons */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`p-3 rounded-xl bg-${feature.accentColor}/10 text-${feature.accentColor}`}
                    >
                      {feature.icon}
                    </div>
                    <div
                      className={`p-2 rounded-lg bg-${feature.accentColor}/5 text-${feature.accentColor}/80`}
                    >
                      {feature.secondaryIcon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p
                        className={`text-${feature.accentColor} text-xs sm:text-sm font-medium`}
                      >
                        {feature.subtitle}
                      </p>
                    </div>
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Stats display */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3 sm:py-4">
                      {Object.entries(feature.stats).map(([key, value]) => (
                        <div
                          key={key}
                          className={`text-center p-2 rounded-lg bg-${feature.accentColor}/5`}
                        >
                          <div
                            className={`text-${feature.accentColor} font-bold text-lg sm:text-xl`}
                          >
                            {value}
                          </div>
                          <div className="text-gray-400 text-[10px] sm:text-xs mt-1 capitalize">
                            {key}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* New Interactive Button Design */}
                    <button
                      onClick={feature.action}
                      className={`
                        group relative w-full py-4 px-6 rounded-xl
                        font-bold text-white text-lg
                        ${feature.buttonStyle.background}
                        ${feature.buttonStyle.hover}
                        transition-all duration-300
                        shadow-lg ${feature.buttonStyle.shadow}
                        hover:-translate-y-0.5 hover:shadow-xl
                        active:translate-y-0.5
                        overflow-hidden
                      `}
                    >
                      <div className="relative flex items-center justify-center gap-3">
                        <span>{feature.buttonText}</span>
                        <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                          {feature.buttonStyle.icon}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsNew;
