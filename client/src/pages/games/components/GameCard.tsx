import React, { memo } from "react";
import { Star } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface GameCardProps {
  game: Game;
  onRatingClick: (id: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const GameCard: React.FC<GameCardProps> = memo(
  ({ game, onRatingClick, onMouseEnter, onMouseLeave }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const handleMouseEnter = () => {
      setIsHovered(true);
      onMouseEnter?.();
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      onMouseLeave?.();
    };

    return (
      <div
        className="group w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-blue-500/20"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-50" />

          {/* Main Image Container */}
          <div className="relative h-[28rem] sm:h-[32rem] w-full overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-800 animate-pulse" />
            )}
            <img
              src={game.image ?? "/api/placeholder/1200/500"}
              alt={game.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isHovered ? "scale-110" : "scale-100"
              } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-transparent to-transparent" />

            {/* Rating */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRatingClick(game.id);
              }}
              className="absolute top-4 left-4 flex items-center gap-1 bg-slate-800/90 px-3 py-1 rounded-full hover:bg-slate-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label={`Rate ${game.title}`}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-sm font-medium">4.8</span>
            </button>
          </div>

          {/* Content Section */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                  {game.title}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                  {game.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GameCard.displayName = "GameCard";

export default GameCard;
