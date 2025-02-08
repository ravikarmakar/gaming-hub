// import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../../PageLayout";
import { FIND_PLAYER_DATA } from "@/lib/constants";

const FindPlayer: React.FC = () => {
  return (
    <PageLayout
      title="Find Best Player For Your Team"
      description="here you can find top best player for you team"
    >
      <div>all players</div>
    </PageLayout>
  );
};

export default FindPlayer;
