import React from "react";
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
}

const GameCard: React.FC<GameCardProps> = ({ game, onRatingClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  // console.log("Clicked");

  return (
    <div
      className="group w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-blue-500/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
        {/* Main Image Container */}
        <div className="relative h-[28rem] sm:h-[32rem] w-full overflow-hidden">
          <img
            src={game.image ?? "/api/placeholder/1200/500"}
            alt={game.title}
            className={`absolute inset-0 w-full h-full object-cover ransition-transform duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-transparent to-transparent" />

          {/* Rating */}
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-slate-800/90 px-3 py-1 cursor-pointer rounded-full">
            <Star
              className="w-4 h-4 text-yellow-400 fill-yellow-400"
              onClick={() => onRatingClick(game.id)}
            />
            <span className="text-white text-sm font-medium">4.8</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                {game.title}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                {game.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
