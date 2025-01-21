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
  ADMIN: "/admin/dashboard",
  MAXADMIN: "/admin/super",
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
    id: "1",
    title: "World Gaming Expo 2024",
    game: "Free Fire",
    organizer: "ProPlayz Esports",
    mode: "Esports",
    location: "India",
    slots: "100",
    description:
      "Join the biggest virtual gaming expo featuring upcoming releases and exclusive previews.",
    image:
      "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80",
    date: "2024-04-15",
    status: "registration-open",
    registeredTeams: 0,
    maxTeams: 100,
    attendees: 15000,
    time: "10:00 AM PST",
    venue: "Virtual Event",
    category: "Conference",
    registrationEnds: "2024-04-14",
    prize: {
      total: "250,000 INR",
      distribution: [
        { position: "1st", prize: "₹1,00,000" },
        { position: "2nd", prize: "₹75,000" },
        { position: "3rd", prize: "₹25,000" },
      ],
    },
    coverImage: "https://example.com/cover-image.jpg",
    stats: {
      registeredTeams: 50,
      totalPlayers: 200,
      viewerCount: "1000",
      prizePool: "$5000",
    },
    schedule: [
      {
        phase: "Registration",
        date: "2024-03-01",
        completed: false,
      },
      {
        phase: "Main Event",
        date: "2024-04-15",
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Summer Clash 2024",
    game: "PUBG Mobile",
    organizer: "Viper Esports",
    mode: "Battle Royale",
    location: "Mumbai",
    slots: "80",
    description:
      "Experience the thrill of battle royale with elite teams competing for glory.",
    image:
      "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80",
    date: "2024-05-20",
    status: "registration-open",
    registeredTeams: 20,
    maxTeams: 80,
    attendees: 10000,
    time: "12:00 PM IST",
    venue: "Mumbai Exhibition Center",
    category: "Tournament",
    registrationEnds: "2024-05-15",
    prize: {
      total: "500,000 INR",
      distribution: [
        { position: "1st", prize: "₹2,50,000" },
        { position: "2nd", prize: "₹1,50,000" },
        { position: "3rd", prize: "₹50,000" },
      ],
    },
    coverImage: "https://example.com/cover-image.jpg",
    stats: {
      registeredTeams: 50,
      totalPlayers: 200,
      viewerCount: "1000",
      prizePool: "$5000",
    },
    schedule: [
      {
        phase: "Registration",
        date: "2024-03-01",
        completed: false,
      },
      {
        phase: "Main Event",
        date: "2024-04-15",
        completed: false,
      },
    ],
  },
  {
    id: "3",
    title: "Esports World Cup Qualifiers",
    game: "Valorant",
    organizer: "ProPlayz Esports",
    mode: "5v5",
    location: "Delhi",
    slots: "64",
    description:
      "Qualify for the Esports World Cup in this high-stakes Valorant tournament.",
    image:
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&q=80",
    date: "2024-06-10",
    status: "registration-closed",
    registeredTeams: 64,
    maxTeams: 64,
    attendees: 20000,
    time: "6:00 PM IST",
    venue: "Delhi Arena",
    category: "Qualifiers",
    registrationEnds: "2024-06-01",
    prize: {
      total: "1,000,000 INR",
      distribution: [
        { position: "1st", prize: "₹5,00,000" },
        { position: "2nd", prize: "₹3,00,000" },
        { position: "3rd", prize: "₹1,00,000" },
      ],
    },
    coverImage: "https://example.com/cover-image.jpg",
    stats: {
      registeredTeams: 50,
      totalPlayers: 200,
      viewerCount: "1000",
      prizePool: "$5000",
    },
    schedule: [
      {
        phase: "Registration",
        date: "2024-03-01",
        completed: false,
      },
      {
        phase: "Main Event",
        date: "2024-04-15",
        completed: false,
      },
    ],
  },
  {
    id: "4",
    title: "ProPlayz Invitational 2024",
    game: "Call of Duty: Mobile",
    organizer: "ProPlayz Esports",
    mode: "Search & Destroy",
    location: "Virtual",
    slots: "32",
    description:
      "Top teams battle it out in this invitation-only Call of Duty event.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
    date: "2024-07-25",
    status: "registration-open",
    registeredTeams: 15,
    maxTeams: 32,
    attendees: 5000,
    time: "4:00 PM PST",
    venue: "Online",
    category: "Invitational",
    registrationEnds: "2024-07-20",
    prize: {
      total: "300,000 INR",
      distribution: [
        { position: "1st", prize: "₹1,50,000" },
        { position: "2nd", prize: "₹1,00,000" },
        { position: "3rd", prize: "₹50,000" },
      ],
    },
    coverImage: "https://example.com/cover-image.jpg",
    stats: {
      registeredTeams: 50,
      totalPlayers: 200,
      viewerCount: "1000",
      prizePool: "$5000",
    },
    schedule: [
      {
        phase: "Registration",
        date: "2024-03-01",
        completed: false,
      },
      {
        phase: "Main Event",
        date: "2024-04-15",
        completed: false,
      },
    ],
  },
  {
    id: "5",
    title: "Free Fire Elite Series",
    game: "Free Fire",
    organizer: "ProPlayz Esports",
    mode: "Squad",
    location: "Kolkata",
    slots: "48",
    description:
      "Elite squads compete in a Free Fire showdown with big rewards.",
    image:
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&q=80",
    date: "2024-08-18",
    status: "registration-closed",
    registeredTeams: 48,
    maxTeams: 48,
    attendees: 12000,
    time: "3:00 PM IST",
    venue: "Kolkata Stadium",
    category: "League",
    registrationEnds: "2024-08-10",
    prize: {
      total: "600,000 INR",
      distribution: [
        { position: "1st", prize: "₹3,00,000" },
        { position: "2nd", prize: "₹2,00,000" },
        { position: "3rd", prize: "₹1,00,000" },
      ],
    },
    coverImage: "https://example.com/cover-image.jpg",
    stats: {
      registeredTeams: 50,
      totalPlayers: 200,
      viewerCount: "1000",
      prizePool: "$5000",
    },
    schedule: [
      {
        phase: "Registration",
        date: "2024-03-01",
        completed: false,
      },
      {
        phase: "Main Event",
        date: "2024-04-15",
        completed: false,
      },
    ],
  },
  {
    id: "6",
    title: "Battle Zone 2024",
    game: "Fortnite",
    organizer: "ProPlayz Esports",
    mode: "Solo",
    location: "Bangalore",
    slots: "120",
    description: "Enter the Fortnite Battle Zone and prove your mettle.",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80",
    date: "2024-09-05",
    status: "registration-open",
    registeredTeams: 80,
    maxTeams: 120,
    attendees: 18000,
    time: "11:00 AM IST",
    venue: "Bangalore Gaming Center",
    category: "Tournament",
    registrationEnds: "2024-09-01",
    prize: {
      total: "800,000 INR",
      distribution: [
        { position: "1st", prize: "₹4,00,000" },
        { position: "2nd", prize: "₹2,50,000" },
        { position: "3rd", prize: "₹1,50,000" },
      ],
    },
    coverImage: "https://example.com/cover-image.jpg",
    stats: {
      registeredTeams: 50,
      totalPlayers: 200,
      viewerCount: "1000",
      prizePool: "$5000",
    },
    schedule: [
      {
        phase: "Registration",
        date: "2024-03-01",
        completed: false,
      },
      {
        phase: "Main Event",
        date: "2024-04-15",
        completed: false,
      },
    ],
  },
];
