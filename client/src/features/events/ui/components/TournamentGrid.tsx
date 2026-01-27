import React from "react";
import TournamentCard from "./TournamentCard";
import { Event } from "@/features/events/lib/types";

interface TournamentGridProps {
    events: Event[];
    onButtonClick?: (eventId: string) => void;
    onDeleteClick?: (eventId: string) => void;
    showEditButton?: boolean;
}

export const TournamentGrid: React.FC<TournamentGridProps> = ({
    events,
    onButtonClick,
    onDeleteClick,
    showEditButton = false,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
                <TournamentCard
                    key={event._id}
                    event={event}
                    onButtonClick={onButtonClick}
                    onDeleteClick={onDeleteClick}
                    showEditButton={showEditButton}
                    index={index}
                />
            ))}
        </div>
    );
};

export default TournamentGrid;
