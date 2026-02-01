import { useEffect, useState, useMemo } from "react";
import { Loader2, Trophy, Search, Plus, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { TournamentGrid } from "@/features/events/ui/components/TournamentGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

import { useEventStore } from "@/features/events/store/useEventStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { ORG_ACCESS } from "@/features/organizer/lib/access";

const OrganizerTournaments: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { fetchEventsByOrgId, isLoading, orgEvents, deleteEvent } = useEventStore();

  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { can } = useAccess();

  const canCreate = can(ORG_ACCESS.createTournament);


  useEffect(() => {
    if (user?.orgId) {
      fetchEventsByOrgId(user.orgId);
    }
  }, [user?.orgId, fetchEventsByOrgId]);

  const filteredEvents = useMemo(() => {
    return orgEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.game.toLowerCase().includes(search.toLowerCase());
      const matchesGame = gameFilter === "all" || event.game.toLowerCase() === gameFilter.toLowerCase();
      const matchesCategory =
        categoryFilter === "all" || event.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" ||
        event.registrationStatus === statusFilter ||
        event.eventProgress === statusFilter;

      return matchesSearch && matchesGame && matchesCategory && matchesStatus;
    });
  }, [orgEvents, search, gameFilter, categoryFilter, statusFilter]);

  const uniqueGames = useMemo(() => {
    const games = new Set(orgEvents.map((e) => e.game));
    return Array.from(games);
  }, [orgEvents]);

  const onButtonClick = (eventId: string) => {
    navigate(`${ORGANIZER_ROUTES.TOURNAMENTS}/${eventId}`);
  };

  const handleDeleteTournament = async (eventId: string) => {
    if (window.confirm("Confirm deletion of this arena? This operation is irreversible.")) {
      const success = await deleteEvent(eventId);
      if (success) {
        // No need to fetch again as the store already filters out the deleted event
      }
    }
  };

  if (isLoading && orgEvents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-purple-500 animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Synchronizing Tournament Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-row items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
            All Tournaments
          </h1>
        </div>
        {canCreate && (
          <Button
            onClick={() => navigate(ORGANIZER_ROUTES.ADD_TOURNAMENTS)}
            className="h-12 w-12 md:w-auto p-0 md:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            <Plus className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">New Tournament</span>
          </Button>
        )}
      </div>

      {/* Control Bar */}
      <Card className="p-4 bg-gray-900/40 border-gray-800 backdrop-blur-xl ring-1 ring-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-purple-400" />
            <Input
              placeholder="Search tournaments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500/40 transition-all rounded-lg"
            />
          </div>

          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-purple-500/40 rounded-lg">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 text-white">
              <SelectItem value="all">All Games</SelectItem>
              {uniqueGames.map((game) => (
                <SelectItem key={game} value={game}>{game}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-purple-500/40 rounded-lg">
              <SelectValue placeholder="All Formats" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 text-white">
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="solo">Solo</SelectItem>
              <SelectItem value="duo">Duo</SelectItem>
              <SelectItem value="squad">Squad</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-purple-500/40 rounded-lg">
              <SelectValue placeholder="All Phases" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 text-white">
              <SelectItem value="all">All Phases</SelectItem>
              <SelectItem value="registration-open">Registration Open</SelectItem>
              <SelectItem value="registration-closed">Registration Closed</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl bg-gray-900/20 border-2 border-dashed border-white/5 mt-8"
          >
            <div className="p-6 rounded-full bg-gray-800/50 mb-6">
              <Trophy className="w-16 h-16 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Tournaments Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {orgEvents.length === 0
                ? "Experience has no limits. Start your legacy by creating your first tournament today!"
                : "No tournaments match your current tactical filters. Try adjusting your search."}
            </p>
            {orgEvents.length === 0 && canCreate && (
              <Button
                onClick={() => navigate(ORGANIZER_ROUTES.ADD_TOURNAMENTS)}
                variant="outline"
                className="mt-6 border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              >
                Launch First Tournament
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <LayoutGrid className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-bold tracking-widest text-gray-500 uppercase">
                Active Operations ({filteredEvents.length})
              </span>
              <div className="h-px flex-1 bg-white/5 ml-4" />
            </div>
            <TournamentGrid
              events={filteredEvents}
              onButtonClick={onButtonClick}
              onDeleteClick={handleDeleteTournament}
              showEditButton={true}
              hideViewDetails={true}
              hideActions={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerTournaments;
