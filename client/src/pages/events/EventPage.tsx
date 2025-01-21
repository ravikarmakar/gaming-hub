import { useEventFilters } from "./hook/useEventFilters";
import PageLayout from "../PageLayout";
import EventGrid from "./components/EventGrid";
import { EventSearch } from "./components/EventSearch";
import { EventFilters } from "./components/EventFilters";

const EventsPage = () => {
  const { events, searchQuery, setSearchQuery, setFilters, filters } =
    useEventFilters();

  return (
    <PageLayout
      title="Best Event For You"
      description="Discover the most exciting gaming events"
    >
      {/* Event Search Component */}
      <EventSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Event Filters Component */}
      <EventFilters filters={filters} setFilters={setFilters} />

      {/* Events Grid Component */}
      <EventGrid events={events} />
    </PageLayout>
  );
};

export default EventsPage;
