import { useTeamStore } from "@/store/useTeamStore";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const { createTeam, isLoading } = useTeamStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
  };

  const handleCreateTeam = async () => {
    if (teamName.trim() === "") {
      console.log("Team Name is required");
      return;
    }

    try {
      await createTeam(teamName);

      setTeamName("");
      navigate("/team/team-profile");
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950/30 to-gray-900/40 text-white flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="max-w-full w-full sm:max-w-md md:max-w-lg lg:max-w-2xl bg-purple-900/30 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-purple-500/20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
          Create Your Team
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-200 mb-8">
          Start your gaming journey by creating a team. Connect with fellow
          gamers, participate in tournaments, and climb the ranks together.
        </p>
        <p className="text-xs sm:text-sm md:text-md lg:text-lg text-yellow-200 mb-4">
          Please ensure the team name is unique.
        </p>

        <input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={handleInputChange}
          className="w-full p-3 mb-4 bg-purple-950/40 rounded-lg border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />

        <button
          className="flex mt-2 items-center gap-2 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-300 hover:scale-105 shadow-lg"
          onClick={handleCreateTeam}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5 animate-spin" />
              <span>Creating...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span>Create Team</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateTeam;
