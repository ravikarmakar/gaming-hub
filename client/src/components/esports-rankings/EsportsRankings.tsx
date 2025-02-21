import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface RankingItem {
  rank: number;
  name: string;
  score: number;
  image: string;
  category: string;
}

const mockData: RankingItem[] = [
  {
    rank: 1,
    name: "Ninja",
    score: 9800,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVufGVufDB8fDB8fHww",
    category: "YouTuber",
  },
  {
    rank: 2,
    name: "Shroud",
    score: 9600,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVufGVufDB8fDB8fHww",
    category: "Player",
  },
  {
    rank: 3,
    name: "FaZe Clan",
    score: 9500,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWVufGVufDB8fDB8fHww",
    category: "Organization",
  },
  {
    rank: 4,
    name: "FaZe Clan",
    score: 9500,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWVufGVufDB8fDB8fHww",
    category: "Organization",
  },

  {
    rank: 5,
    name: "FaZe Clan",
    score: 9500,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWVufGVufDB8fDB8fHww",
    category: "Organization",
  },
];

const categories = ["All", "Player", "YouTuber", "Organization"];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Player":
      return "from-cyan-500 to-blue-600";
    case "YouTuber":
      return "from-red-500 to-pink-600";
    case "Organization":
      return "from-purple-500 to-indigo-600";
    default:
      return "from-purple-500 to-pink-600";
  }
};

export const EsportsRankings: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredRankings =
    selectedCategory === "All"
      ? mockData
      : mockData.filter((item) => item.category === selectedCategory);

  return (
    <div className="relative overflow-hidden bg-[#000b14] text-white py-12 md:py-16 px-3 sm:px-6 lg:px-8">
      {/* Cyber Grid Background */}

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 relative z-10 py-2 px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
                Top Esports Rankings
              </span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm md:text-lg mt-4 max-w-2xl mx-auto">
            Discover the elite players, content creators, and organizations
            dominating the esports scene
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`relative group px-4 md:px-6 py-2 md:py-3 text-sm md:text-base 
                        overflow-hidden transition-all duration-300 
                        ${
                          selectedCategory === category
                            ? "text-white"
                            : "text-gray-400 hover:text-white"
                        }`}
            >
              <span className="relative z-10">{category}</span>
              {/* Button Background & Effects */}
              <div
                className={`absolute inset-0 ${
                  selectedCategory === category
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                } transition-opacity duration-300`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
                <div className="absolute inset-px bg-[#0f0721] rounded-sm"></div>
              </div>
              {/* Active Indicator */}
              {selectedCategory === category && (
                <>
                  <div className="absolute h-px w-full bottom-0 left-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                  <div className="absolute h-px w-[80%] mx-[10%] -bottom-1 left-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent blur-sm"></div>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Rankings List */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {filteredRankings.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Card Container */}
              <div className="relative bg-[#0a0520] rounded-lg overflow-hidden">
                {/* Rank Decoration */}
                <div
                  className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b ${getCategoryColor(
                    item.category
                  )}`}
                ></div>

                {/* Mobile Layout */}
                <div className="md:hidden relative">
                  <div className="flex items-center p-3 gap-3">
                    {/* Rank */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 flex items-center justify-center text-xl font-bold
                        ${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                            ? "text-gray-300"
                            : index === 2
                            ? "text-amber-700"
                            : "text-purple-400"
                        }`}
                      >
                        #{item.rank}
                      </div>
                      {/* Rank Decoration */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg -z-10"></div>
                    </div>

                    {/* Image and Details */}
                    <div className="flex-1 flex items-center gap-3">
                      {/* Image Container */}
                      <div className="relative group-hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 rounded overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Image Frame */}
                        <div className="absolute inset-0 border-2 border-purple-500/20"></div>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-purple-500/40"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-purple-500/40"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-purple-500/40"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-purple-500/40"></div>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] rounded 
                            bg-gradient-to-r ${getCategoryColor(
                              item.category
                            )} bg-opacity-10
                            border border-purple-500/20`}
                          >
                            {item.category}
                          </span>
                          <span className="text-sm font-medium text-purple-300">
                            {item.score.toLocaleString()} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                  <div className="flex items-center p-4 gap-6">
                    {/* Rank */}
                    <div className="relative w-20">
                      <div
                        className={`text-4xl font-bold text-center
                        ${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                            ? "text-gray-300"
                            : index === 2
                            ? "text-amber-700"
                            : "text-purple-400"
                        }`}
                      >
                        #{item.rank}
                      </div>
                      {/* Rank Decoration */}
                      <div
                        className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg -z-10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      ></div>
                    </div>

                    {/* Image Container */}
                    <div className="relative group-hover:scale-105 transition-transform duration-300">
                      <div className="w-16 h-16 rounded overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Image Frame */}
                      <div className="absolute inset-0 border-2 border-purple-500/20"></div>
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500/40"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500/40"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500/40"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500/40"></div>
                    </div>

                    {/* Details */}
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold">{item.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`px-3 py-1 text-sm rounded 
                          bg-gradient-to-r ${getCategoryColor(
                            item.category
                          )} bg-opacity-10
                          border border-purple-500/20`}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-end">
                      <div className="text-3xl font-bold">
                        {item.score.toLocaleString()}
                      </div>
                      <span className="text-xs text-purple-400">POINTS</span>
                    </div>
                  </div>

                  {/* Hover Effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
                    <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-10">
          <Link
            to="/rankings"
            className="relative inline-flex items-center px-6 md:px-8 py-3 md:py-4 
                     text-white font-bold text-sm md:text-lg 
                     overflow-hidden group"
          >
            {/* Button Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-[1px] bg-[#0a0520] group-hover:bg-[#110a2d] transition-colors duration-300"></div>

            {/* Button Content */}
            <span className="relative z-10 flex items-center">
              View Full Rankings
              <svg
                className="ml-2 w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsportsRankings;
