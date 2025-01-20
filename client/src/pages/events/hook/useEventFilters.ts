import { useState, useMemo } from "react";
import { eventData } from "@/lib/constants";

export function useEventFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    eventType: "all", // Options: 'all', 'new', 'last-month'
    startDate: "", // Filter by start date
    endDate: "", // Filter by end date
    minPrize: "", // Minimum prize pool filter (as string)
  });

  const filteredEvents = useMemo(() => {
    return eventData.filter((event) => {
      const matchesSearch =
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEventType = (() => {
        if (filters.eventType === "new") {
          const today = new Date();
          const eventDate = new Date(event.date);
          return eventDate >= today;
        }
        if (filters.eventType === "last-month") {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          const eventDate = new Date(event.date);
          return eventDate >= lastMonth && eventDate < new Date();
        }
        return true; // 'all' type matches all events
      })();

      const matchesDate = (() => {
        const eventDate = new Date(event.date);
        const startDate = filters.startDate
          ? new Date(filters.startDate)
          : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        return (
          (!startDate || eventDate >= startDate) &&
          (!endDate || eventDate <= endDate)
        );
      })();

      const matchesPrizePool = event.prize?.total
        ? parseInt(event.prize.total.replace(/[^0-9]/g, ""), 10) >=
          (filters.minPrize ? parseInt(filters.minPrize, 10) : 0)
        : true;

      return (
        matchesSearch && matchesEventType && matchesDate && matchesPrizePool
      );
    });
  }, [searchQuery, filters]);

  return {
    events: filteredEvents,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
  };
}
