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
