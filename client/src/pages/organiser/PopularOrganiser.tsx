import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Timer,
  Star,
  Shield,
  Award,
  Target,
  Crown,
} from "lucide-react";

const organizers = [
  {
    id: 1,
    name: "Elite Gaming",
    verified: true,
    tournaments: 156,
    totalPrizePool: "$250,000",
    rating: 4.9,
    players: "50K+",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    speciality: ["Pro Leagues", "Weekly Tournaments"],
    badges: ["Elite", "Verified"],
    nextEvent: "2h 15m",
    social: {
      followers: "250K",
      engagement: "95%",
    },
  },
  {
    id: 2,
    name: "Cyber Warriors",
    verified: true,
    tournaments: 98,
    totalPrizePool: "$180,000",
    rating: 4.8,
    players: "35K+",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    speciality: ["Scrims", "Community Events"],
    badges: ["Premium", "Top Rated"],
    nextEvent: "5h 30m",
    social: {
      followers: "180K",
      engagement: "92%",
    },
  },
  {
    id: 3,
    name: "Phoenix Esports",
    verified: true,
    tournaments: 134,
    totalPrizePool: "$220,000",
    rating: 4.7,
    players: "45K+",
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    speciality: ["Championships", "Training Camps"],
    badges: ["Professional", "Featured"],
    nextEvent: "1h 45m",
    social: {
      followers: "210K",
      engagement: "88%",
    },
  },
];

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const organizerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateY: -180,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8,
    },
  },
  hover: {
    scale: 1.05,
    rotateY: 10,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

function PopularOrganiser() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {organizers.map((org) => (
            <motion.div
              key={org.id}
              variants={organizerVariants}
              whileHover="hover"
              className="relative bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 rounded-2xl overflow-hidden backdrop-blur-lg border border-orange-500/20 transform perspective-1000"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />

              <div className="relative">
                <img
                  src={org.image}
                  alt={org.name}
                  className="w-full h-48 object-cover"
                />
                <motion.div
                  className="absolute top-4 right-4 z-20 flex items-center space-x-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {org.verified && (
                    <Shield className="w-6 h-6 text-blue-400 drop-shadow-glow" />
                  )}
                </motion.div>
              </div>

              <div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-orange-400">
                    {org.name}
                  </h3>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="text-yellow-300">{org.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-gray-400 text-sm mb-1">
                      Tournaments
                    </div>
                    <div className="text-orange-300 font-bold flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      {org.tournaments}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-gray-400 text-sm mb-1">Prize Pool</div>
                    <div className="text-green-300 font-bold flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      {org.totalPrizePool}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-gray-300">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-purple-400" />
                      <span>{org.players} Players</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2 text-cyan-400" />
                      <span>{org.social.engagement} Engagement</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 my-3">
                    {org.speciality.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-500/10 text-orange-300 rounded-full text-sm border border-orange-500/20"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-300">
                      <Timer className="w-4 h-4 mr-2 text-red-400" />
                      <span>Next Event: {org.nextEvent}</span>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex items-center text-blue-300"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      <span>{org.social.followers} Followers</span>
                    </motion.div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
                  >
                    Follow
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-white/20 transition-all duration-300 border border-gray-600"
                  >
                    View Events
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default PopularOrganiser;
