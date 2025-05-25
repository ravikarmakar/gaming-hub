import Team from "../models/team.model.js";
import { CustomError } from "../utils/CustomError.js";

export const checkTeamNameUnique = async (teamName) => {
  const existingTeam = await Team.findOne({ teamName });
  if (existingTeam) {
    throw new CustomError(
      "Team name already exists. Please choose a different name.",
      409
    );
  }
  return true;
};

export const createNewTeam = async (teamData) => {
  const newTeam = new Team(teamData);
  await newTeam.save();
  return newTeam;
};

export const findTeamById = async (id) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new CustomError("Team not found", 404);
  }
  return team;
};
