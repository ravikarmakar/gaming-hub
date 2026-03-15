import { RegisteredTeamsList } from "@/features/tournaments/ui/components";

interface TeamsTabProps {
    eventId: string;
    eventDetails: any;
}

export function TeamsTab({ eventId, eventDetails }: TeamsTabProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <RegisteredTeamsList
                eventId={eventId}
                eventDetails={eventDetails}
                showSearch={false}
                showStats={false}
            />
        </div>
    );
}
