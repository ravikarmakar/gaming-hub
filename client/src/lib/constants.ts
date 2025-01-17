// Centralized routes
export const ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  EVENTS: "/events", // /events/:type
  EVENT: "/events/:id",
  FREE_TOURNAMENTS: "/free-tournaments",
  BLOG: "/blog",
  BLOG_POST: "/blog/:id",
  SCRIMSPAGE: "/scrims",
  TEAMS: "/teams",
  LOGIN: "/login",
  SIGNUP: "/signup",
};

// Nav Links
export const NAV_LINKS = [
  { name: "Events", href: "/events" },
  { name: "Scrims", href: "/scrims" },
  { name: "Free Tournaments", href: "/free-tournaments" },
  { name: "Find Teams", href: "/teams" },
  { name: "Community", href: "/blog" },
] as const;

// Tags
export const tags = [
  "Free Entry",
  "Cash Prize",
  "5v5",
  "Solo",
  "Today",
  "Find Team",
  "Free Tournaments",
  "CS Paid",
  "Esports Team",
  "Top-10 Players",
  "Create Team",
  "Drop Challeges",
];

export const ACTIVE_TOURNAMENTS = [
  {
    id: 1,
    title: "Cyber Legends Championship",
    status: "LIVE",
    participants: "128/128",
    prizePool: "50,000",
    endDate: "2024-04-01T00:00:00",
  },
  {
    id: 2,
    title: "Neon Warriors League",
    status: "REGISTERING",
    participants: "64/128",
    prizePool: "25,000",
    endDate: "2024-03-25T00:00:00",
  },
  {
    id: 3,
    title: "Space Odyssey Cup",
    status: "UPCOMING",
    participants: "32/64",
    prizePool: "10,000",
    endDate: "2025-02-21T00:00:00",
  },
] as const;

// Player-related constants
export const TOP_PLAYERS = [
  {
    id: 1,
    name: "Alex 'Striker' Chen",
    avatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80",
    rank: 1,
    globalRank: 3,
    winRate: 92.5,
    totalWins: 1458,
    country: "🇺🇸",
    game: "Cyber Legends",
    achievements: ["World Champion 2023", "MVP Season 8"],
  },
  {
    id: 2,
    name: "Sarah 'Phoenix' Kim",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80",
    rank: 2,
    globalRank: 5,
    winRate: 89.3,
    totalWins: 1287,
    country: "🇰🇷",
    game: "Neon Warriors",
    achievements: ["Regional Champion", "Perfect Season"],
  },
  {
    id: 3,
    name: "Marcus 'Legend' Smith",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80",
    rank: 3,
    globalRank: 8,
    winRate: 87.1,
    totalWins: 1156,
    country: "🇬🇧",
    game: "Space Odyssey",
    achievements: ["Rising Star 2023"],
  },
  {
    id: 4,
    name: "Alex 'Striker' Chen",
    avatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80",
    rank: 4,
    globalRank: 3,
    winRate: 92.5,
    totalWins: 1458,
    country: "🇺🇸",
    game: "Cyber Legends",
    achievements: ["World Champion 2023", "MVP Season 8"],
  },
  {
    id: 5,
    name: "Alex 'Striker' Chen",
    avatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80",
    rank: 5,
    globalRank: 3,
    winRate: 92.5,
    totalWins: 1458,
    country: "🇺🇸",
    game: "Cyber Legends",
    achievements: ["World Champion 2023", "MVP Season 8"],
  },
] as const;

export const PLAYER_DATA = [
  {
    id: "1",
    name: "Alex 'Striker' Chen",
    avatarLink:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80",
    rank: 1,
    role: "Leader",
    globalRank: 3,
    country: "India",
    device: "iPhone 16 Pro Max",
    playstyle: "Aggressive",
    //if team show data otherwise null
    team: {
      teamId: "team1", // Team the player belongs to
      teamName: "ProGamers", // Team name
      roleInTeam: "Admin", // Player's role in the team
    },
    fanFollowing: {
      followers: 50000,
      averageEngagement: "High",
    },
    teamAffiliation: {
      teamName: "Team Elite",
      role: "Assault",
    },
    contactDetails: {
      email: "gamerx@example.com",
      phone: "+91-1234567890",
    },
    achievements: [
      {
        title: "Top 10 in Asia Tournament",
        year: 2024,
        description: "Ranked in the top 10 in a regional esports tournament.",
      },
      {
        title: "Champion - Free Fire League",
        year: 2023,
        description:
          "Won the Free Fire League Season 4 with the best team strategy.",
      },
      {
        title: "Most Valuable Player",
        year: 2023,
        description:
          "Awarded MVP of the Season for exceptional gameplay and team contribution.",
      },
    ],
    game: {
      name: "Free Fire",
      rank: "Grandmaster",
      currentSeason: "Season 15",
      matchesPlayed: 1200,
      kills: 5000,
      wins: 300,
      winRate: 25,
      favoriteWeapons: ["AK47", "MP5", "AWM"],
    },
    tournamentHistory: [
      {
        title: "Top 10 in Asia Tournament",
        year: 2024,
        description: "Ranked in the top 10 in a regional esports tournament.",
        position: 8,
        prize: "$500",
      },
      {
        title: "Champion - Free Fire League",
        year: 2023,
        description:
          "Won the Free Fire League Season 4 with the best team strategy.",
        position: 1,
        prize: "$2000",
      },
      {
        title: "Most Valuable Player",
        year: 2023,
        description:
          "Awarded MVP of the Season for exceptional gameplay and team contribution.",
        position: "N/A",
        prize: "MVP Trophy",
      },
    ],
    socialLinks: {
      instagram: "https://www.instagram.com/gamerx_official",
      twitter: "https://twitter.com/gamerx",
    },
    badges: [
      {
        badgeName: "Top Player",
        criteria: "Achieved top 10 rank in multiple tournaments.",
        awarded: true,
      },
      {
        badgeName: "Sharpshooter",
        criteria: "Achieved 1000 kills with sniper rifles.",
        awarded: true,
      },
      {
        badgeName: "Team Leader",
        criteria: "Led the team to victory in Free Fire League Season 4.",
        awarded: true,
      },
      {
        badgeName: "Rising Star",
        criteria: "Started gaining popularity in esports tournaments.",
        awarded: true,
      },
      {
        badgeName: "Fan Favorite",
        criteria: "Has a large fanbase on social media.",
        awarded: false,
      },
    ],
  },
] as const;

export const eventData = [
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
    description: "A nostalgic journey through the golden era of retro gaming.",
    attendees: 1000,
    status: "registration open",
    registrationEnds: "2024-09-10",
  },
];
