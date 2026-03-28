import { ListOrdered } from "lucide-react";
import { TournamentEmpty } from "../shared/TournamentFeedback";

export function PointsTab() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <TournamentEmpty 
                message="Points Distribution"
                subMessage="Detailed scoring mechanics and point distribution for this tournament will be listed here."
                icon={ListOrdered}
            />
        </div>
    );
}
