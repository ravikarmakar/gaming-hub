import {
  Gamepad2,
  Trophy,
  LineChart,
  UserCircle,
  Megaphone,
  Users,
} from "lucide-react";

import { ServiceType } from "./types";

export const services: ServiceType[] = [
  {
    id: "gaming-events",
    title: "Event Management",
    description:
      "Professional gaming event management services for tournaments, leagues, and championships across multiple games.",
    icon: <Trophy />,
    link: "/services/gaming-events",
    features: [
      "Tournament Organization",
      "League Management",
      "Event Broadcasting",
      "Player Support",
    ],
  },
  {
    id: "organization-management",
    title: "Organization Management",
    description:
      "Comprehensive tools and services to manage your gaming organization effectively and professionally.",
    icon: <LineChart />,
    link: "/services/organization",
    features: [
      "Team Management",
      "Resource Planning",
      "Performance Tracking",
      "Revenue Management",
    ],
  },
  {
    id: "analytics",
    title: "Gaming Analytics",
    description:
      "Advanced analytics and insights to track performance, improve gameplay, and optimize team strategies.",
    icon: <UserCircle />,
    link: "/services/analytics",
    features: [
      "Performance Metrics",
      "Team Statistics",
      "Tournament Analysis",
      "Growth Tracking",
    ],
  },

  {
    id: "esports-marketing",
    title: "Esports Marketing Solutions",
    description:
      "Comprehensive marketing solutions to promote your gaming brand, events, and reach your target audience.",
    icon: <Users />,
    link: "/services/marketing",
    features: [
      "Brand Development",
      "Social Media Management",
      "Sponsorship Opportunities",
      "Content Creation",
    ],
  },

  {
    id: "support",
    title: "24/7 Support",
    description:
      "Get round-the-clock technical support and assistance for all your gaming needs.",
    icon: <Megaphone />,
    link: "/support",
    features: ["Live Chat", "Technical Support", "Account Help"],
  },
];
