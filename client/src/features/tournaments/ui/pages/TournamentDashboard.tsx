import { useParams } from 'react-router-dom';

import { TournamentDialogOrchestrator } from "@/features/tournaments/ui/components";

// Context
import { TournamentDashboardProvider } from "@/features/tournaments/context/TournamentDashboardContext";
import { TournamentDialogProvider } from "@/features/tournaments/context/TournamentDialogContext";
import { TournamentGroupsProvider } from "@/features/tournaments/context/TournamentGroupsContext";
import { TournamentRoundsProvider } from "@/features/tournaments/context/TournamentRoundsContext";

// Extracted sub-components
import { TournamentDashboardContent } from "./TournamentDashboardContent";

/**
 * TournamentDashboard acts as the main container for tournament management.
 * It uses TournamentDashboardProvider to share common state across all tabs and sub-components.
 */
export default function TournamentDashboard() {
    const { id } = useParams<{ id: string }>();

    // Reset tab if current tab becomes hidden (e.g. event becomes pending)
    useEffect(() => {
        const canShowRounds = eventDetails?.eventProgress !== "pending";
        if (canShowRounds === false && (activeTab === 'rounds' || activeTab === 'scrims')) {
            setActiveTab('overview');
        }
    }, [eventDetails?.eventProgress, activeTab]);

    if (!id) {
        return <div className="p-6 text-white">Invalid Tournament ID</div>;
    }

    return (
        <TournamentDialogProvider>
            <TournamentDashboardProvider eventId={id}>
                <TournamentRoundsProvider>
                    <TournamentGroupsProvider>
                        <TournamentDashboardContent />
                        <TournamentDialogOrchestrator />
                    </TournamentGroupsProvider>
                </TournamentRoundsProvider>
            </TournamentDashboardProvider>
        </TournamentDialogProvider>
    );
}
