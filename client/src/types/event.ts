export const EVENT_CATEGORIES = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Education",
  "Healthcare",
  "Food Drive",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface SocialEvent {
  _id: string;
  title: string;
  description: string;
  eventType: EventCategory;
  thumbnail: string;
  location: string;
  eventDate: string;
  creatorEmail: string;
  creatorName: string;
  creatorPhoto: string;
  joinedCount: number;
  hasJoined?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JoinedEventRecord {
  _id: string;
  eventId: string;
  eventTitle: string;
  eventThumbnail: string;
  eventLocation: string;
  eventType: EventCategory;
  eventDate: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto: string;
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image: string;
  createdAt: string | null;
  stats: {
    createdCount: number;
    joinedCount: number;
  };
}
