import EventGrid from "./components/EventGrid";
import { EventSearch } from "./components/EventSearch";
import { EventFilters } from "./components/EventFilters";
import { useEventFilters } from "./hook/useEventFilters";
import PageLayout from "../PageLayout";

const GamingEventsPage = () => {
  const { events, searchQuery, setSearchQuery, setFilters, filters } =
    useEventFilters();

  return (
    <PageLayout
      title="Best Event For You"
      description="Discover the most exciting gaming events"
    >
      {/* Event Search */}
      <EventSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Event filters */}
      <EventFilters filters={filters} setFilters={setFilters} />

      {/* Evnts Grid */}
      <EventGrid events={events} />
    </PageLayout>
  );
};

export default GamingEventsPage;
