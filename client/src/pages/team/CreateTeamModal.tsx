import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Users } from "lucide-react";

import { useUserStore } from "@/store/useUserStore";
import { useTeamStore } from "@/store/useTeamStore";
import FileUpload from "@/components/ui/FileUpload";
import Input from "@/components/ui/input";
import toast from "react-hot-toast";

interface CreateTeamModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const { user } = useUserStore();
  const { createTeam, isLoading, error } = useTeamStore();

  const [formData, setFormData] = useState({
    teamName: "",
    image: null as File | null,
  });

  const [errors, setErrors] = useState({
    teamName: "",
    image: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleCreateTeam = async () => {
    if (!formData.teamName.trim()) {
      setErrors((prev) => ({ ...prev, teamName: "Team name is required" }));
      return;
    }

    const entries = Object.entries(formData).map(([key, value]) => [
      key,
      value ?? "",
    ]);
    const dataObject = Object.fromEntries(entries);

    const result = await createTeam(dataObject);
    if (result) {
      setFormData({ teamName: "", image: null });
      setErrors({ teamName: "", image: "" });
      setIsOpen(false);
      toast.success("Team created successfully");
    }
  };

  if (!isOpen || user?.teamId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl">
        <button
          className="absolute text-white top-4 right-4 hover:text-purple-200"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <h1 className="mb-4 text-3xl font-bold text-transparent bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text">
          Create Your Team
        </h1>

        <p className="mb-2 text-sm text-purple-200">
          Build your squad and get ready to dominate tournaments.
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 border rounded-lg bg-red-500/10 border-red-500/20 backdrop-blur-sm"
            >
              <p className="text-sm text-center text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team Name Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Input
            name="teamName"
            label="Team Name"
            type="text"
            value={formData.teamName}
            onChange={handleInputChange}
            icon={<Users size={18} />}
            placeholder="Enter a unique team name"
            error={errors.teamName ? [errors.teamName] : null}
            required
          />
        </motion.div>

        {/* Logo Upload */}
        <motion.div
          className="mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FileUpload
            label="Team Logo"
            name="image"
            accept="image/*"
            maxSize={5 * 1024 * 1024}
            error={errors.image ? [errors.image] : null}
            onChange={handleFileUpload}
            hint="SVG, PNG, JPG or GIF (max 5MB)"
          />
        </motion.div>

        {/* Submit Button */}
        <button
          className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-6 font-bold text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-purple-700 to-purple-700 hover:from-purple-600 hover:to-purple-600"
          onClick={handleCreateTeam}
        >
          {isLoading ? (
            <>
              <Plus className="w-5 h-5 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Create Team</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateTeamModal;
