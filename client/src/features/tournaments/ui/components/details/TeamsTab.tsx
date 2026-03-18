import { RegisteredTeamsList } from "../shared/RegisteredTeamsList";

interface TeamsTabProps {
    eventId: string;
    eventDetails: any;
}

export function TeamsTab({ eventId, eventDetails }: TeamsTabProps) {
    return (
        <RegisteredTeamsList
            eventId={eventId}
            eventDetails={eventDetails}
            showSearch={false}
            showStats={true}
        />
    );
}
