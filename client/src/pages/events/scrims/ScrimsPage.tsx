import PopularOrganiser from "@/pages/organiser/PopularOrganiser";
import { motion } from "framer-motion";
import PageLayout from "@/pages/PageLayout";
import { Users, Clock, Timer, Gift } from "lucide-react";

const dailyScrims = [
  {
    id: 1,
    title: "Morning Glory Scrims",
    prizePool: {
      tier1: "$500",
      tier2: "$300",
      tier3: "$200",
    },
    entryFee: "Free",
    time: "10:00 UTC",
    duration: "3 hours",
    slotsLeft: 4,
    totalSlots: 24,
    image:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Popular", "Filling Fast"],
    offer: "Double XP",
    endsIn: "2h 30m",
    status: "Registration Open",
  },
  {
    id: 2,
    title: "Afternoon Warfare",
    prizePool: {
      tier1: "$750",
      tier2: "$400",
      tier3: "$250",
    },
    entryFee: "$5",
    time: "14:00 UTC",
    duration: "4 hours",
    slotsLeft: 2,
    totalSlots: 32,
    image:
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Trending", "Premium"],
    offer: "Exclusive Skin",
    endsIn: "5h 45m",
    status: "Last Call",
  },
  {
    id: 3,
    title: "Night Hunters Scrims",
    prizePool: {
      tier1: "$1000",
      tier2: "$600",
      tier3: "$400",
    },
    entryFee: "$10",
    time: "20:00 UTC",
    duration: "5 hours",
    slotsLeft: 8,
    totalSlots: 48,
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Hot", "High Stakes"],
    offer: "Bonus Credits",
    endsIn: "8h 15m",
    status: "Registration Open",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 0px 20px rgba(0, 255, 255, 0.5)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const Badge = ({ type }: { type: string }) => {
  const getBadgeColors = (type: string) => {
    switch (type.toLowerCase()) {
      case "popular":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "trending":
        return "bg-purple-500/20 text-purple-300 border-purple-500/50";
      case "hot":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      case "premium":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/50";
      case "filling fast":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "high stakes":
        return "bg-orange-500/20 text-orange-300 border-orange-500/50";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/50";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold border ${getBadgeColors(
        type
      )}`}
    >
      {type}
    </span>
  );
};

const ScrimsPage = () => {
  return (
    <PageLayout
      title="Free Fire Scrims"
      description="Join elite scrims and compete against the best teams. Level up your
            game and win amazing prizes!"
    >
      <div className="max-w-7xl mx-auto">
        <PopularOrganiser />

        {/* Daily Scrims Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-pink-500 to-purple-600">
            Daily Scrims
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
            Join daily practice matches and earn rewards. Limited time slots
            available!
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {dailyScrims.map((scrim) => (
            <motion.div
              key={scrim.id}
              variants={cardVariants}
              whileHover="hover"
              className="relative bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden backdrop-blur-sm border border-pink-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img
                src={scrim.image}
                alt={scrim.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                {scrim.badges.map((badge, index) => (
                  <Badge key={index} type={badge} />
                ))}
              </div>
              <div className="absolute top-4 right-4 z-20">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-red-500/20 text-red-300 border border-red-500/50 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                >
                  <Timer className="w-4 h-4" />
                  {scrim.endsIn}
                </motion.div>
              </div>
              <div className="relative z-20 p-6">
                <h3 className="text-2xl font-bold mb-4 text-pink-400">
                  {scrim.title}
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">
                      Prize Pool Tiers
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold">
                          {scrim.prizePool.tier1}
                        </div>
                        <div className="text-xs text-gray-500">1st</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-300 font-bold">
                          {scrim.prizePool.tier2}
                        </div>
                        <div className="text-xs text-gray-500">2nd</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-400 font-bold">
                          {scrim.prizePool.tier3}
                        </div>
                        <div className="text-xs text-gray-500">3rd</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-gray-300">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      {scrim.time}
                    </div>
                    <div className="flex items-center">
                      <Timer className="w-4 h-4 mr-2 text-purple-400" />
                      {scrim.duration}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-300">
                      <Users className="w-4 h-4 mr-2 text-green-400" />
                      <span>{scrim.slotsLeft} slots left</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Gift className="w-4 h-4 mr-2 text-pink-400" />
                      <span>{scrim.offer}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-400">
                      Entry:{" "}
                      <span className="text-green-400">{scrim.entryFee}</span>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        scrim.slotsLeft <= 4 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {scrim.status}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
                >
                  Join Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ScrimsPage;
