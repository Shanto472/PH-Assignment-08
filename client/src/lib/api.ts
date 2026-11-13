import { getJwtToken } from "./auth-client";
import {
  EventCategory,
  JoinedEventRecord,
  SocialEvent,
  UserProfile,
} from "@/types/event";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface ApiFetchOptions extends RequestInit {
  requireAuth?: boolean;
  optionalAuth?: boolean;
}

async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { requireAuth = false, optionalAuth = false, headers, ...rest } = options;

  const buildHeaders = async (forceRefresh = false): Promise<Headers> => {
    const reqHeaders = new Headers(headers);
    if (!reqHeaders.has("Content-Type") && rest.body) {
      reqHeaders.set("Content-Type", "application/json");
    }

    if (requireAuth || optionalAuth) {
      const token = await getJwtToken(forceRefresh);
      if (token) {
        reqHeaders.set("Authorization", `Bearer ${token}`);
      } else if (requireAuth) {
        throw new ApiError(
          401,
          "Authentication session expired. Please log in again."
        );
      }
    }

    return reqHeaders;
  };

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: await buildHeaders(false),
    credentials: "include",
  });

  if (response.status === 401 && requireAuth) {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: await buildHeaders(true),
      credentials: "include",
    });
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.message || "Something went wrong while contacting the server.",
      payload.errors
    );
  }

  return payload as T;
}

export interface EventFormPayload {
  title: string;
  description: string;
  eventType: EventCategory;
  thumbnail: string;
  location: string;
  eventDate: string;
}

export const eventsApi = {
  getRecentUpcoming: () =>
    apiFetch<{ success: boolean; events: SocialEvent[] }>(
      "/api/events/recent",
      { cache: "no-store" }
    ),

  getUpcoming: (params?: { search?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.set("search", params.search.trim());
    if (params?.type && params.type !== "All") query.set("type", params.type);
    const qs = query.toString();
    return apiFetch<{ success: boolean; count: number; events: SocialEvent[] }>(
      `/api/events${qs ? `?${qs}` : ""}`,
      { cache: "no-store" }
    );
  },

  getById: (id: string) =>
    apiFetch<{ success: boolean; event: SocialEvent }>(
      `/api/events/${encodeURIComponent(id)}`,
      { optionalAuth: true, cache: "no-store" }
    ),

  getMyEvents: () =>
    apiFetch<{ success: boolean; count: number; events: SocialEvent[] }>(
      "/api/events/my-events",
      { requireAuth: true, cache: "no-store" }
    ),

  create: (data: EventFormPayload) =>
    apiFetch<{ success: boolean; message: string; event: SocialEvent }>(
      "/api/events",
      {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify(data),
      }
    ),

  update: (id: string, data: EventFormPayload) =>
    apiFetch<{ success: boolean; message: string; event: SocialEvent }>(
      `/api/events/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        requireAuth: true,
        body: JSON.stringify(data),
      }
    ),

  remove: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(
      `/api/events/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        requireAuth: true,
      }
    ),
};

export const joinsApi = {
  joinEvent: (eventId: string) =>
    apiFetch<{
      success: boolean;
      message: string;
      joinedCount: number;
      joinedEvent: JoinedEventRecord;
    }>(`/api/joins/${encodeURIComponent(eventId)}`, {
      method: "POST",
      requireAuth: true,
    }),

  leaveEvent: (eventId: string) =>
    apiFetch<{ success: boolean; message: string; joinedCount: number }>(
      `/api/joins/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        requireAuth: true,
      }
    ),

  getMyJoined: () =>
    apiFetch<{
      success: boolean;
      count: number;
      joinedEvents: JoinedEventRecord[];
    }>("/api/joins/my-joined", {
      requireAuth: true,
      cache: "no-store",
    }),
};

export const profileApi = {
  get: () =>
    apiFetch<{ success: boolean; profile: UserProfile }>("/api/profile", {
      requireAuth: true,
      cache: "no-store",
    }),

  update: (data: { name: string; image: string }) =>
    apiFetch<{
      success: boolean;
      message: string;
      profile: { id: string; email: string; name: string; image: string };
    }>("/api/profile", {
      method: "PATCH",
      requireAuth: true,
      body: JSON.stringify(data),
    }),
};
