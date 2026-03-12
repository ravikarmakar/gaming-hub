import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import LoadingSpinner from "@/components/LoadingSpinner";
import { OrganizerProfileHeader } from "../components/profile/OrganizerProfileHeader";
import { OrganizerEventsTab } from "../components/profile/OrganizerEventsTab";
import { OrganizerAboutTab } from "../components/profile/OrganizerAboutTab";
import { ProfileBannerLayout } from "@/components/shared/ProfileBannerLayout";
import { useGetOrgByIdQuery } from "@/features/organizer/hooks/useOrganizerQueries";
import { useGetOrgTournamentsQuery } from "@/features/tournaments/hooks/useTournamentQueries";
import { skipToken } from "@tanstack/react-query";

// Extracted sub-components
import { ReviewsTab } from "../components/profile/ReviewsTab";

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

  const tabItems = useMemo(() => {
    if (!currentOrg) return [];

    return [
      {
        id: "events",
        label: "Events",
        content: <OrganizerEventsTab events={orgEvents || []} />,
      },
      {
        id: "about",
        label: "About",
        content: <OrganizerAboutTab organizer={currentOrg} stats={stats} />,
      },
      {
        id: "reviews",
        label: "Reviews",
        content: <ReviewsTab />,
      },
    ];
  }, [currentOrg, orgEvents, stats]);

  if (isOrgLoading || isEventsLoading || !currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProfileBannerLayout>
      <OrganizerProfileHeader organizer={currentOrg} stats={stats} />

      {/* Navigation Tabs */}
      <div className="relative z-10 mb-6 sm:mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-2 overflow-x-auto border-b border-white/10">
            <TabsList className="h-auto p-0 bg-transparent gap-6">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-0 py-3 text-base bg-transparent border-b-2 border-transparent rounded-none shadow-none text-gray-400 hover:text-gray-300 data-[state=active]:border-purple-500 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content */}
          <div className="py-8">
            {tabItems.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 focus-visible:ring-0">
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </ProfileBannerLayout>
  );
};

export default OrganizerProfile;
