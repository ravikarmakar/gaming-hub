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
    ],
  },
] as const;

export const eventData = [
  {
    id: "1",
    title: "World Gaming Expo 2024", //
    game: "Free Fire", //
    organizer: "ProPlayz Esports", //
    mode: "Esports", //
    location: "Online", //
    countrt: "India", //
    slots: "100", //
    description:
      "Join the biggest virtual gaming expo featuring upcoming releases and exclusive previews.", //
    image:
      "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80", //
    date: "2024-04-15",
    status: "registration-open", //
    registeredTeams: 0,
    maxTeams: 100,
    attendees: 15000, //
    time: "10:00 AM PST", // not required
    venue: "Virtual Event", //
    category: "Conference", //
    registrationEnds: "2024-04-14", //
    prize: {
      total: "250,000 INR",
      distribution: [
        { position: "1st", prize: "₹1,00,000" },
        { position: "2nd", prize: "₹75,000" },
        { position: "3rd", prize: "₹25,000" },
      ],
    }, //
    stats: {
      registeredTeams: 50,
      totalPlayers: 200,
      viewerCount: "1000",
      prizePool: "$5000",
    }, // ignore
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

export const FIND_PLAYER_DATA = [
  {
    id: "P001",
    name: "RyzeX",
    role: "Assaulter",
    subRole: "Entry Fragger",
    tier: "Tier-I",
    experience: "5 Years",
    avatar: "https://i.imgur.com/1N6XKkh.png",
    team: "Godlike Esports",
    country: "India",
    achievements: "FF Pro League Winner 2023",
    mainGame: "Free Fire",
    deviceType: "Android",
    headShotRate: "78%",
    isPremium: true,
    viewCount: "1.2M",
    rating: "4.9",
  },
];

export const EVENT_DATA = [
  {
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
          icon: "",
        },
        {
          position: "2nd Place",
          prize: "₹3,00,000",
          color: "from-gray-300 to-gray-500",
          icon: "",
        },
        {
          position: "3rd Place",
          prize: "₹1,50,000",
          color: "from-amber-600 to-amber-800",
          icon: "",
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
  },
];
