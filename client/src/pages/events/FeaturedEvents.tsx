import { motion } from "framer-motion";
import { EventCard } from "./components/EventCard";

export default function FeaturedEvents() {
  const eventData = [
    {
      id: 1,
      title: "World Gaming Expo 2024",
      game: "Gaming Expo",
      registeredTeams: 0,
      date: "2024-04-15",
      maxTeams: 100,
      time: "10:00 AM PST",
      location: "Virtual Event",
      category: "Conference",
      prizeTiers: [
        { position: "1st", prize: "$50,000" },
        { position: "2nd", prize: "$25,000" },
        { position: "3rd", prize: "$10,000" },
      ],
      image:
        "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80",
      description:
        "Join the biggest virtual gaming expo featuring upcoming releases and exclusive previews.",
      attendees: 15000,
      status: "registration-open",
      registrationEnds: "2024-04-14",
    },
    {
      id: 2,
      title: "Pro Gamers Tournament 2024",
      game: "Battle Royale",
      registeredTeams: 50,
      date: "2024-05-10",
      maxTeams: 200,
      time: "2:00 PM PST",
      location: "Los Angeles, USA",
      category: "Tournament",
      prizeTiers: [
        { position: "1st", prize: "$50,000" },
        { position: "2nd", prize: "$25,000" },
        { position: "3rd", prize: "$10,000" },
      ],
      image:
        "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&q=80",
      description:
        "A thrilling tournament for pro gamers featuring massive cash prizes.",
      attendees: 5000,
      status: "coming soon",
      registrationEnds: "2024-05-05",
    },
    {
      id: 3,
      title: "Indie Games Showcase 2024",
      game: "Indie Games",
      registeredTeams: 0,
      date: "2024-06-01",
      maxTeams: 50,
      time: "1:00 PM PST",
      location: "Online",
      category: "Showcase",
      prizeTiers: [
        { position: "1st", prize: "$50,000" },
        { position: "2nd", prize: "$25,000" },
        { position: "3rd", prize: "$10,000" },
      ],
      image:
        "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80",
      description:
        "Showcasing innovative indie games and connecting developers with players.",
      attendees: 3000,
      status: "live",
      registrationEnds: "2024-05-30",
    },
    {
      id: 5,
      title: "VR Gaming Challenge 2024",
      game: "Virtual Reality",
      registeredTeams: 5,
      date: "2024-08-05",
      maxTeams: 30,
      time: "12:00 PM PST",
      location: "Tokyo, Japan",
      category: "Challenge",
      prizeTiers: [
        { position: "1st", prize: "50,000" },
        { position: "2nd", prize: "25,000" },
        { position: "3rd", prize: "10,000" },
      ],
      image:
        "https://images.unsplash.com/photo-1581276879432-cafebdcdd8fa?auto=format&fit=crop&q=80",
      description:
        "Dive into virtual reality and compete with the best in this cutting-edge gaming challenge.",
      attendees: 8000,
      status: "registration closed",
      registrationEnds: "2024-08-01",
    },
    {
      id: 6,
      title: "Retro Games Meetup 2024",
      game: "Retro Games",
      registeredTeams: 0,
      date: "2024-09-12",
      maxTeams: 50,
      time: "3:00 PM PST",
      location: "Paris, France",
      category: "Meetup",
      prizeTiers: [
        { position: "1st", prize: "$50,000" },
        { position: "2nd", prize: "$25,000" },
        { position: "3rd", prize: "$10,000" },
      ],
      image:
        "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&q=80",
      description:
        "A nostalgic journey through the golden era of retro gaming.",
      attendees: 1000,
      status: "registration open",
      registrationEnds: "2024-09-10",
    },
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl" />

      {/* top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-b from-black to-transparent" />

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-black to-transparent" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold font-orbitron"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Latest Events
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Discover and Join the Best Esports Tournaments Across All
            Organizations!
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 lg:px-10">
          {eventData.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <button className="px-8 mt-10 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 hover:scale-105">
            View Events
          </button>
        </motion.div>
      </div>
    </section>
  );
}
