/* eslint-disable react-hooks/exhaustive-deps */
import useAuthStore from "@/store/useAuthStore";
import { useTeamStore } from "@/store/useTeamStore";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const { user } = useAuthStore();
  const { createTeam, isLoading } = useTeamStore();

  useEffect(() => {
    if (user?.activeTeam !== null) {
      navigate("/team-profile");
    }
  }, []);

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
      navigate("/team-profile");
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-white bg-gradient-to-br from-purple-950/30 to-gray-900/40 md:p-6 lg:p-8">
      <div className="w-full max-w-full p-4 border shadow-2xl sm:max-w-md md:max-w-lg lg:max-w-2xl bg-purple-900/30 backdrop-blur-sm sm:p-6 md:p-8 rounded-2xl border-purple-500/20">
        <h1 className="mb-6 text-2xl font-bold text-transparent sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text">
          Create Your Team
        </h1>
        <p className="mb-8 text-sm text-purple-200 sm:text-base md:text-lg lg:text-xl">
          Start your gaming journey by creating a team. Connect with fellow
          gamers, participate in tournaments, and climb the ranks together.
        </p>
        <p className="mb-4 text-xs text-yellow-200 sm:text-sm md:text-md lg:text-lg">
          Please ensure the team name is unique.
        </p>

        <input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={handleInputChange}
          className="w-full p-3 mb-4 border border-purple-500 rounded-lg bg-purple-950/40 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />

        <button
          className="flex items-center gap-2 px-8 py-3 mt-2 font-bold text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 hover:scale-105"
          onClick={handleCreateTeam}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Plus className="w-5 h-5 animate-spin" />
              <span>Creating...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Create Team</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateTeam;
