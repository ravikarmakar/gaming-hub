export interface RankingItem {
  rank: number;
  name: string;
  score: number;
  image: string;
  category: string;
  region?: string;
  achievements?: string[];
}

export const mockRankings: RankingItem[] = [
  {
    rank: 1,
    name: "Ninja",
    score: 9800,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVufGVufDB8fDB8fHww",
    category: "YouTuber",
    region: "NA",
    achievements: [
      "Most followed Twitch streamer",
      "Fortnite World Cup Winner",
    ],
  },
  {
    rank: 2,
    name: "Shroud",
    score: 9600,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVufGVufDB8fDB8fHww",
    category: "Player",
    region: "NA",
    achievements: ["PUBG Champion", "CS:GO Pro Player"],
  },
  {
    rank: 3,
    name: "FaZe Clan",
    score: 9500,
    image: "https://placehold.co/100x100",
    category: "Organization",
    region: "Global",
    achievements: [
      "Multiple Championship Titles",
      "Forbes Valued Organization",
    ],
  },
  {
    rank: 4,
    name: "PewDiePie",
    score: 9400,
    image: "https://placehold.co/100x100",
    category: "YouTuber",
    region: "EU",
    achievements: ["100M+ Subscribers", "Most Subscribed Individual Creator"],
  },
  {
    rank: 5,
    name: "Team SoloMid",
    score: 9300,
    image: "https://placehold.co/100x100",
    category: "Organization",
    region: "NA",
    achievements: ["Multiple LCS Titles", "Major Tournament Winners"],
  },
];
