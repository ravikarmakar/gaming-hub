/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  UserPlus,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  User2,
  X,
  Plus,
  Check,
  Loader2,
  Trash2,
  Pen,
} from "lucide-react";
import { useOrganizerStore, Member as StoreMember } from "@/store/useOrganizer";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import { hasOrgRole } from "@/lib/permissions";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import usePlayerStore from "@/features/player/store/usePlayerStore";

type Member = StoreMember & {
  status: "Active" | "Inactive" | "Pending";
  joinedDate: string;
  lastActivity: string;
};

interface MemberCardProps {
  member: Member;
  onRemove?: (id: string) => void;
  isOwner?: boolean;
  currentUserId: string;
}

// Reusable MemberCard Component
const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onRemove,
  isOwner,
  currentUserId,
}) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const onProfileView = (id: string) => {
    if (id === currentUserId) {
      navigate("/profile");
    } else {
      navigate(`/profile/${id}`);
    }
  };

  const { getOrgById, orgData, updateStaffRole, isLoading, error } =
    useOrganizerStore();

  const handleRoleUpdate = async (id: string, newRole: string) => {
    console.log("Selected Role:", id, newRole);
    const success = await updateStaffRole(id, newRole);
    if (success) {
      toast.success("Role updated successfully");
      await getOrgById(orgData?._id ?? "");
      setIsModalOpen(false);
      setSelectedRole("");
    } else {
      toast.error(error || "Failed to update role");
    }
  };

  const getStatusClasses = (status: Member["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Inactive":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRoleColor = (role: Member["role"]) => {
    switch (role) {
      case "Admin":
        return "text-purple-400";
      case "Editor":
        return "text-blue-400";
      case "Moderator":
        return "text-cyan-400";
      case "Member":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="relative flex flex-col items-center p-5 text-center transition-all duration-300 bg-gray-900 border border-gray-800 shadow-lg rounded-xl group hover:border-purple-700">
      <div className="absolute top-3 right-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(
            member.status
          )}`}
        >
          {member.status === "Active" && (
            <CheckCircle size={12} className="inline-block mr-1" />
          )}
          {member.status === "Inactive" && (
            <XCircle size={12} className="inline-block mr-1" />
          )}
          {member.status === "Pending" && (
            <ClockIcon size={12} className="inline-block mr-1" />
          )}
          {member.status}
        </span>
      </div>

      <img
        src={member.avatar}
        alt={member.username}
        className="object-cover w-24 h-24 mb-4 transition-colors duration-200 border-4 border-gray-700 rounded-full group-hover:border-purple-500/60"
        onError={(e) =>
          (e.currentTarget.src =
            "https://placehold.co/100x100/374151/9CA3AF?text=User")
        }
      />
      <h3 className="mb-1 text-xl font-bold text-white">{member.username}</h3>
      <p className={`text-sm font-medium ${getRoleColor(member.role)} mb-3`}>
        {member.role}
      </p>

      <div className="w-full space-y-2 text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <Mail size={16} />
          <span className="truncate max-w-[calc(100%-30px)]">
            {member.email}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Calendar size={16} />
          <span>
            Joined: {new Date(member.joinedDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Clock size={16} />
          <span>Last Active: {member.lastActivity}</span>
        </div>
      </div>

      <div className="flex justify-center w-full gap-3 mt-5">
        <button
          onClick={() => onProfileView?.(member._id)}
          className={`flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium  ${
            currentUserId === member._id ? "text-yellow-600" : "text-purple-300"
          } transition-colors rounded-lg bg-purple-600/50 hover:bg-purple-900/50`}
        >
          <User2 size={16} />
          {currentUserId === member._id ? "My Profile" : "View Profile"}
        </button>

        {isOwner && currentUserId !== member._id && (
          <div className="relative flex gap-2">
            <button
              className="p-2 text-gray-300 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click if any
                setIsModalOpen(!isModalOpen);
              }}
            >
              <Pen size={18} className="hover:text-blue-500" />
            </button>
            <button
              className="p-2 text-gray-300 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click if any
                onRemove?.(member._id);
              }}
            >
              <Trash2 size={18} className="hover:text-red-400" />
            </button>
          </div>
        )}
      </div>

      {/* Update Role Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-60"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md p-6 bg-[#1f1f1f] text-white shadow-lg rounded-xl"
            >
              <h2 className="mb-4 text-lg font-semibold">Update Role</h2>

              <label className="block mb-2 text-sm font-medium text-gray-300">
                Select Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-[#2a2a2a] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a role</option>
                <option value="org:manager">Org Manager</option>
                <option value="org:staff">Org Staff</option>
              </select>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedRole("");
                  }}
                  className="px-4 py-2 text-sm text-white bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRoleUpdate?.(member?._id, selectedRole)}
                  disabled={!selectedRole || isLoading}
                  className={`px-4 py-2 text-sm rounded text-white flex items-center justify-center gap-2 ${
                    selectedRole && !isLoading
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Role"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Members = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { orgData, addStaffs, isLoading, error, getOrgById, removeStaff } =
    useOrganizerStore();
  const { players, searchByUsername } = usePlayerStore();
  const { user } = useAuthStore();
  const debouncedUserQuery = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Fetch organization data on mount
    if (user?.orgId) {
      getOrgById(user.orgId);
    }
  }, []);

  useEffect(() => {
    if (orgData?.members) {
      const orgMemberIds = orgData.members.map((member) => member._id);
      setSelectedIds(orgMemberIds);
    }
  }, [orgData]);

  // On search term change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    usePlayerStore.setState({ players: [] });
    searchByUsername(debouncedUserQuery, 1, 20);
  }, [debouncedUserQuery]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || debouncedUserQuery.trim() === "")
      return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = page + 1;
        searchByUsername(debouncedUserQuery, nextPage, 20).then((res) => {
          if (res && res.length) {
            usePlayerStore.setState((state) => ({
              players: [...(state.players ?? []), ...(res ?? [])],
            }));
            setPage(nextPage);
            setHasMore(res.length > 0);
          } else {
            setHasMore(false);
          }
        });
      }
    });

    observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [debouncedUserQuery, page, hasMore]);

  // Check if the user is already a member
  const isAlreadyMember = (id: string) =>
    orgData?.members?.some((member) => member._id === id);

  // Org Owner can see button
  const isOwner = hasOrgRole(user, ["org:owner"], orgData?._id);

  const toggleSelection = (id: string) => {
    if (isAlreadyMember(id)) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // handleAddSelectedMembers function
  const handleAddSelectedMembers = async () => {
    const ids = selectedIds.filter((id) => !isAlreadyMember(id));

    if (ids.length === 0) {
      toast("No new members selected to add.", {
        icon: "ℹ️",
        style: { background: "#1f2937", color: "#fff" },
      });
      return;
    }

    const result = await addStaffs?.({ staff: ids });
    if (result) {
      if (orgData?._id) {
        await getOrgById(orgData._id);
      }
      toast("Members added successfully!", {
        icon: "✅",
        style: {
          background: "#1f2937",
          color: "#fff",
        },
      });
    } else {
      toast.error(error, {
        icon: "❌",
        style: {
          background: "#1f2937",
          color: "#fff",
        },
      });
    }
    // Reset modal state
    usePlayerStore.setState({ players: [] });
    setPage(1);
    setHasMore(true);

    setIsModalOpen(false);
    setSearchTerm("");
  };

  const handleStaffRemove = async (id: string) => {
    const success = await removeStaff(id);
    if (success) {
      await getOrgById(orgData?._id ?? "");
      toast.success("Staff removed successfully");
    } else {
      toast.error(error || "Failed to remove staff");
    }
  };

  return (
    <div className="p-4 space-y-8 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-white">Organization Members</h1>
        {hasOrgRole(user, ["org:owner", "org:manager"], orgData?._id) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <UserPlus size={20} />
            Add New Member
          </button>
        )}
      </div>

      {/* Members Grid */}
      {orgData?.members?.length === 0 ? (
        <div className="py-10 text-center text-gray-400">
          <p className="text-lg">No members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orgData?.members?.map((member) => (
            <MemberCard
              key={member._id}
              onRemove={handleStaffRemove}
              isOwner={isOwner}
              currentUserId={user?._id ?? ""}
              member={{
                ...member,
                status: "Active",
                joinedDate: new Date().toISOString(),
                lastActivity: "Just Now",
              }}
            />
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg p-6 bg-gray-900 shadow-xl rounded-xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Add Members
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                  className="text-gray-400 hover:text-white"
                >
                  <X />
                </button>
              </div>

              {/* Search Input */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username..."
                className="w-full px-4 py-2 mb-4 text-white placeholder-gray-400 bg-gray-800 rounded-lg outline-none"
              />

              {/* Players List */}
              <div className="space-y-3 overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-700">
                {players && players.length > 0 ? (
                  <>
                    {players.map((user) => {
                      const isSelected = selectedIds.includes(user._id);
                      const alreadyMember = isAlreadyMember(user._id);
                      return (
                        <div
                          key={user._id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            alreadyMember
                              ? "bg-gray-700 cursor-not-allowed"
                              : isSelected
                              ? "bg-purple-700 cursor-pointer"
                              : "bg-gray-800 hover:bg-gray-700 cursor-pointer"
                          }`}
                          onClick={() => toggleSelection(user._id)}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="object-cover w-10 h-10 rounded-full"
                            />
                            <span className="text-white">{user.username}</span>
                          </div>
                          {alreadyMember ? (
                            <span className="text-xs text-gray-300">
                              Already Added
                            </span>
                          ) : (
                            <div
                              className={`w-7 h-7 flex items-center justify-center rounded-full border-2 transition-all ${
                                isSelected
                                  ? "bg-purple-600 border-purple-500"
                                  : "border-blue-500"
                              }`}
                            >
                              {isSelected ? (
                                <Check size={16} className="text-white" />
                              ) : (
                                <Plus size={16} className="text-blue-500" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* This div is observed to trigger loading more users */}
                    <div ref={loadMoreRef} className="h-8" />
                  </>
                ) : (
                  <p className="text-gray-400">No users found.</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddSelectedMembers}
                disabled={selectedIds.length === 0 || isLoading}
                className={`w-full mt-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 ${
                  selectedIds.length
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Selected Members"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Members;
