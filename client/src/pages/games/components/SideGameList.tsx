import { motion } from "framer-motion";

type SideGame = {
  title: string;
  image: string;
  description: string;
};

type SideGameListProps = {
  gameData: SideGame[];
  currentIndex: number;
};

const SideGameList: React.FC<SideGameListProps> = ({
  currentIndex,
  gameData,
}) => (
  <div className="w-full lg:w-[380px] xl:w-[420px] space-y-2 hidden lg:block">
    {gameData.map((game, index) => (
      <motion.div
        key={index}
        className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${
          index === currentIndex ? "bg-blue-500" : ""
        }`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={game.image}
          alt={game.title}
          className="w-14 h-14 rounded-lg object-cover"
        />
        <span className="text-white font-medium">{game.title}</span>
      </motion.div>
    ))}
  </div>
);

export default SideGameList;
