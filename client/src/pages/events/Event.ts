import { eventData } from "@/lib/constants";

export function useEvent(id: string | undefined) {
  if (!id) return null;
  return eventData.find((event) => event.id === id);
}
