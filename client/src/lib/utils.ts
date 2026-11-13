import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Upcoming";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Upcoming";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const FALLBACK_EVENT_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0F6244"/><stop offset="100%" stop-color="#1E3A2F"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><circle cx="400" cy="215" r="56" fill="rgba(255,255,255,0.14)"/><path d="M380 218l14 14 28-30" stroke="#F59E0B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="400" y="315" text-anchor="middle" fill="#FAF9F5" font-family="system-ui, sans-serif" font-size="24" font-weight="600">CivicRoots Community Drive</text></svg>`
  );
