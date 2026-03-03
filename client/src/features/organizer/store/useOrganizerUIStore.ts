import { create } from "zustand";

export interface JoinRequest {
  _id: string;
  requester: {
    _id: string;
    username: string;
    avatar: string;
    email: string;
  };
  target: string;
  targetModel: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  createdAt: string;
}

export interface OrganizerStateType {
  isCreateOrgOpen: boolean;
  setIsCreateOrgOpen: (open: boolean) => void;
}

export const useOrganizerUIStore = create<OrganizerStateType>((set) => ({
  isCreateOrgOpen: false,
  setIsCreateOrgOpen: (open) => set({ isCreateOrgOpen: open }),
}));
