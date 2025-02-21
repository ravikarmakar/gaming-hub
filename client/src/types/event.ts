export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
  participants: number;
  prizePool: string;
  trending?: boolean;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}