import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Info, MessageSquare, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OrganizerProfileHeader } from "../components/profile/OrganizerProfileHeader";
import { OrganizerEventsTab } from "../components/profile/OrganizerEventsTab";
import { OrganizerAboutTab } from "../components/profile/OrganizerAboutTab";
import { ProfileBannerLayout } from "@/components/shared/ProfileBannerLayout";
import { useGetOrgByIdQuery } from "@/features/organizer/hooks/useOrganizerQueries";
import { useGetOrgTournamentsQuery } from "@/features/tournaments/hooks/useTournamentQueries";
import { skipToken } from "@tanstack/react-query";

// Extracted sub-components
import { ReviewsTab } from "../components/profile/ReviewsTab";
import { ArenaLoading } from "@/components/shared/ArenaLoading";

export const OrganizerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("events");
  const { data: orgData, isLoading: isOrgLoading } = useGetOrgByIdQuery(id as string, 1, 20, "", {
    enabled: !!id,
  });
  const currentOrg = orgData?.data;

  const { data: orgEvents = [], isLoading: isEventsLoading } = useGetOrgTournamentsQuery(id ? id : (skipToken as unknown as string));

  // Mock stats - in a real app these would come from the backend or be calculated
  const stats = useMemo(() => ({
    totalEvents: orgEvents?.length || 0,
    totalParticipants: orgEvents?.reduce((acc: number, event: any) => acc + (event.slots || 0), 0) || 0, // Using slots as proxy for participants for now
    rating: 4.9,
    reviewsCount: 234,
    joinedDate: currentOrg?.createdAt ? new Date(currentOrg.createdAt).toLocaleDateString() : "Recently",
    followers: 12500,
    following: 890,
  }), [orgEvents, currentOrg]);

  interface TabItem {
    id: string;
    label: string;
    icon: LucideIcon;
    content: React.ReactNode;
  }

  const tabItems = useMemo<TabItem[]>(() => {
    if (!currentOrg) return [];

    return [
      {
        id: "events",
        label: "Events",
        icon: Calendar,
        content: <OrganizerEventsTab events={orgEvents || []} />,
      },
      {
        id: "about",
        label: "About",
        icon: Info,
        content: <OrganizerAboutTab organizer={currentOrg} stats={stats} />,
      },
      {
        id: "reviews",
        label: "Reviews",
        icon: MessageSquare,
        content: <ReviewsTab />,
      },
    ];
  }, [currentOrg, orgEvents, stats]);

  if (isOrgLoading || isEventsLoading || !currentOrg) {
    return <ArenaLoading message="Synchronizing Organization Data..." />;
  }

  return (
    <ProfileBannerLayout bannerImage={currentOrg?.bannerUrl}>
      <OrganizerProfileHeader organizer={currentOrg} stats={stats} />

      {/* Navigation Tabs */}
      <div className="pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
          <div className="flex items-center border-b border-white/5">
            <TabsList className="bg-transparent h-auto p-0 flex space-x-4 sm:space-x-8 md:space-x-10">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-0 py-3 sm:py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none text-zinc-400 data-[state=active]:text-white font-black uppercase text-[9px] sm:text-[11px] tracking-[1px] sm:tracking-[2px] transition-all"
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    {tab.icon && <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    <span>{tab.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="py-0">
                {tabItems.find(tab => tab.id === activeTab)?.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </ProfileBannerLayout>
  );
};

export default OrganizerProfile;
