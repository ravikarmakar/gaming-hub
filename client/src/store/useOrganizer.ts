import { create } from "zustand";

export interface Organizer {
  _id?: string;
  ownerId: string;
  name: string;
  imageUrl: string;
  description: string;
  email: string;
  isVerified: boolean;
  tag: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerStateType {
  organizers: Organizer | null;
  isLoading: boolean;
  error: string | null;
}

export const useOrganizerStore = create<OrganizerStateType>(() => ({
  organizers: null,
  isLoading: false,
  error: null,
}));
