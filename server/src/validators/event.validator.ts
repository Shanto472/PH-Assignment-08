import { ObjectId } from "mongodb";
import { EventCategory } from "../config/db.js";

export const ALLOWED_EVENT_TYPES: readonly EventCategory[] = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Education",
  "Healthcare",
  "Food Drive",
];

export interface EventPayloadInput {
  title: string;
  description: string;
  eventType: EventCategory;
  thumbnail: string;
  location: string;
  eventDate: Date;
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: Record<string, string>;
  data?: T;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export function validateEventInput(
  raw: Record<string, unknown>
): ValidationResult<EventPayloadInput> {
  const errors: Record<string, string> = {};

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  const eventType =
    typeof raw.eventType === "string" ? raw.eventType.trim() : "";
  const thumbnail =
    typeof raw.thumbnail === "string" ? raw.thumbnail.trim() : "";
  const location = typeof raw.location === "string" ? raw.location.trim() : "";
  const rawDate = raw.eventDate;

  if (!title) {
    errors.title = "Event title is required.";
  } else if (title.length < 3) {
    errors.title = "Event title must be at least 3 characters long.";
  } else if (title.length > 120) {
    errors.title = "Event title cannot exceed 120 characters.";
  }

  if (!description) {
    errors.description = "Event description is required.";
  } else if (description.length < 15) {
    errors.description =
      "Event description must be at least 15 characters long.";
  } else if (description.length > 3000) {
    errors.description = "Event description cannot exceed 3000 characters.";
  }

  if (!ALLOWED_EVENT_TYPES.includes(eventType as EventCategory)) {
    errors.eventType = `Event type must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}.`;
  }

  if (!thumbnail) {
    errors.thumbnail = "Thumbnail image URL is required.";
  } else if (!isValidHttpUrl(thumbnail)) {
    errors.thumbnail =
      "Thumbnail must be a valid URL starting with http:// or https://.";
  }

  if (!location) {
    errors.location = "Event location is required.";
  } else if (location.length < 3) {
    errors.location = "Event location must be at least 3 characters long.";
  } else if (location.length > 200) {
    errors.location = "Event location cannot exceed 200 characters.";
  }

  let parsedDate: Date | null = null;
  if (typeof rawDate === "string" || rawDate instanceof Date) {
    const candidate = new Date(rawDate);
    if (!Number.isNaN(candidate.getTime())) {
      parsedDate = candidate;
    }
  }

  if (!parsedDate) {
    errors.eventDate = "A valid event date is required.";
  } else if (parsedDate.getTime() <= Date.now()) {
    errors.eventDate = "Event date must be in the future.";
  }

  if (Object.keys(errors).length > 0 || !parsedDate) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    data: {
      title,
      description,
      eventType: eventType as EventCategory,
      thumbnail,
      location,
      eventDate: parsedDate,
    },
  };
}
