import { motion } from "framer-motion";
import SingleEventHeader from "./single-event-components/SingleEventHeader";
// import { TopWinners } from "./single-event-components/TopWinners";
import PrizeTiers from "./single-event-components/PrizeTiers";
import LeaderBoard from "./single-event-components/Leaderboard";
import { useParams } from "react-router-dom";
// import { useEvent } from "./Event";
import EventStatus from "./single-event-components/EventStatus";
import { EventRules } from "./single-event-components/EventRules";
import EventDetails from "./single-event-components/EventDetails";
// import EventStats from "./single-event-components/EventStats";
import EventTimeLine from "./single-event-components/EventTimeline";
import QuickAction from "./single-event-components/QuickActions";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./single-event-components/EventTabs";
import { Sponsors } from "./single-event-components/Sponsers";
import { useEvent } from "./Event";

//  ALl Interface
export interface PrizeDistribution {
  position: string;
  prize: string;
  color: string;
  icon: string;
}

export interface Prize {
  total: string;
  distribution: PrizeDistribution[];
}

export interface Stats {
  registeredTeams: number;
  totalPlayers: number;
  viewerCount: string;
  prizePool: string;
}

export interface Schedule {
  phase: string;
  date: string;
  completed: boolean;
}

export interface Event {
  id: string;
  title: string;
  game: string;
  organizer: string;
  mode: string;
  location: string;
  slots: string;
  description: string;
  coverImage: string;
  date: string;
  venue: string;
  prize: Prize;
  status: string;
  stats: Stats;
  schedule: Schedule[];
}

// Badge Component
const EventDisplay = () => {
  const { id } = useParams();

  const oneEvent = useEvent(id);

  // console.log(oneEvent);

  const event: Event[] = {
    id: "1",
    title: "Cyber Gaming Championship 2025",
    game: "Free Fire",
    organizer: "ProPlayz Esports",
    mode: "Esports",
    location: "India",
    slots: "100",
    description:
      "The ultimate gaming showdown featuring elite teams from across the globe",
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1957&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    date: "March 15-20, 2025",
    venue: "CyberArena, Silicon Valley",
    status: "registration-open",
    prize: {
      total: "250,000 INR",
      distribution: [
        {
          position: "1st Place",
          prize: "₹5,00,000",
          color: "from-yellow-400 to-yellow-600",
          icon: "🏆",
        },
        {
          position: "2nd Place",
          prize: "₹3,00,000",
          color: "from-gray-300 to-gray-500",
          icon: "🥈",
        },
        {
          position: "3rd Place",
          prize: "₹1,50,000",
          color: "from-amber-600 to-amber-800",
          icon: "🥉",
        },
      ],
    },

    // optional
    stats: {
      registeredTeams: 64,
      totalPlayers: 320,
      viewerCount: "4.2M",
      prizePool: "250K",
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="relative min-h-screen inset-0 bg-gradient-to-t from-black via-transparent to-transparent text-zinc-100">
      {/* Background Gradient */}
      <div className="absolute h-auto inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-transparent blur-3xl" />

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 py-20 space-y-8"
      >
        {/* Hero Section */}
        <SingleEventHeader event={oneEvent} />

        {/* Quick actions Buttons*/}
        <div className="flex items-center gap-4">
          {/* Event Status*/}
          <EventStatus status={oneEvent.status} />

          <QuickAction />
        </div>

        {/* Stats Grid */}
        {/* <EventStats event={event} /> */}

        {/* Event Details */}
        <EventDetails event={oneEvent} />
        {/* <GamingEventPortal eventStats={eventStats} /> */}

        {/* Prize Pool */}
        <PrizeTiers event={event.prize} />

        {/* Top winners  */}
        {/* <TopWinners /> */}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 space-y-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl relative font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 b border-b-4 border-gray-600 pb-2 bg-clip-text text-transparent mb-6 border-b-[rgba(58,109,191,0.77)] 
             shadow-b-[0_4px_10px_rgba(58,134,255,0.8)] "
        >
          Quick Overview
        </motion.h2>

        <Tabs defaultValue="Roadmap" className="mt-10">
          <TabsList>
            <TabsTrigger value="Roadmap" className="text-sm">
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="Leaderboard" className="text-sm">
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="Event Rules" className="text-sm">
              Event Rules
            </TabsTrigger>
            <TabsTrigger value="Sponsers" className="text-sm">
              Sponsers
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              Event History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Leaderboard">
            <LeaderBoard />
          </TabsContent>

          <TabsContent value="Roadmap">
            <EventTimeLine />
          </TabsContent>

          <TabsContent value="Event Rules">
            <EventRules />
          </TabsContent>

          <TabsContent value="Sponsers">
            <Sponsors />
          </TabsContent>

          <TabsContent value="history">
            <div>Event History gose here</div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default EventDisplay;
