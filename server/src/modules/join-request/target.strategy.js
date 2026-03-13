import * as TeamService from "../team/team.service.js";
import * as OrganizerService from "../organizer/organizer.service.js";
import * as EventService from "../event/event.service.js";
import * as GroupService from "../event/group.service.js";
import { CustomError } from "../../shared/utils/CustomError.js";

const strategies = {
    Team: TeamService,
    Organizer: OrganizerService,
    Event: EventService,
    Group: GroupService
};

/**
 * Resolves the appropriate service strategy based on the target model.
 * 
 * @param {string} targetModel - 'Team', 'Organizer', or 'Event'
 * @returns {Object} The service strategy
 * @throws {CustomError} If strategy is not found
 */
export const getStrategy = (targetModel) => {
    const strategy = strategies[targetModel];
    if (!strategy) {
        throw new CustomError(`Module strategy not found for: ${targetModel}`, 400);
    }
    return strategy;
};
