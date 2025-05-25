export interface Event {
  _id: string;
  title: string;
  game: string;
  startDate: string;
  mode: string;
  slots: string;
  time: string;
  location: string;
  category: string;
  venue: string;
  prize: string | null;
  image: string;
  description: string;
  attendees: number;
  status: string;
  registrationEnds: string;
  teams: [];
  rounds: [];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Notification {
  _id: string;
  user: string;
  type: "invite" | "join_request" | "team_update" | "accept" | "reject";
  message: string;
  relatedId: string;
  status: "unread" | "read";
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
