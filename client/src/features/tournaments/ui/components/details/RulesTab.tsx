import { Gavel } from "lucide-react";
import { TournamentEmpty } from "../shared/TournamentFeedback";

export function RulesTab(_props: { eventId?: string; eventDetails?: any }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <TournamentEmpty 
                message="Tournament Rules"
                subMessage="The official ruleset for this tournament is currently being finalized. Please check back soon for the full documentation."
                icon={Gavel}
            />
        </div>
    );
}
