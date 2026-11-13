"use client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  Share2,
  Tag,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccessAlert } from "@/lib/alerts";
import { ApiError, eventsApi, joinsApi } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { FALLBACK_EVENT_IMAGE, formatEventDateTime } from "@/lib/utils";
import { SocialEvent } from "@/types/event";

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const eventId = params?.id || "";

  const [event, setEvent] = useState<SocialEvent | null>(null);
  const [imgSrc, setImgSrc] = useState(FALLBACK_EVENT_IMAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getById(eventId);
      setEvent(res.event);
      setImgSrc(res.event.thumbnail || FALLBACK_EVENT_IMAGE);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load event details."
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent, session?.user?.id]);

  const handleJoinEvent = async () => {
    if (!event) return;

    if (!session?.user) {
      toast.info("Please log in to join this community event.");
      router.push(`/login?redirect=${encodeURIComponent(`/events/${event._id}`)}`);
      return;
    }

    if (event.hasJoined) return;

    setJoining(true);
    try {
      const res = await joinsApi.joinEvent(event._id);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              hasJoined: true,
              joinedCount: res.joinedCount,
            }
          : prev
      );
      await showSuccessAlert(
        "Joined Event!",
        `You are registered for "${event.title}".`
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEvent((prev) => (prev ? { ...prev, hasJoined: true } : prev));
        toast.info(err.message);
      } else {
        toast.error(
          err instanceof Error ? err.message : "Unable to join this event."
        );
      }
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!event || !session?.user) return;
    setJoining(true);
    try {
      const res = await joinsApi.leaveEvent(event._id);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              hasJoined: false,
              joinedCount: res.joinedCount,
            }
          : prev
      );
      toast.success("You have left this event.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to leave this event."
      );
    } finally {
      setJoining(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    } catch {
      toast.error("Could not copy event link.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="aspect-[16/8] w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-surface p-10 shadow-xs">
          <h1 className="text-2xl font-bold text-foreground">
            Event Unavailable
          </h1>
          <p className="mt-2 text-sm text-muted">
            {error || "This event may have been removed or the link is invalid."}
          </p>
          <Button asChild className="mt-6">
            <Link href="/upcoming-events">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Upcoming Events</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPastEvent = new Date(event.eventDate).getTime() <= Date.now();
  const isCreator = session?.user?.email === event.creatorEmail;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/upcoming-events">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Upcoming Events</span>
          </Link>
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          <span>Share Event</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="relative aspect-[16/8] w-full overflow-hidden bg-surface-muted">
          <img
            src={imgSrc}
            alt={event.title}
            onError={() => setImgSrc(FALLBACK_EVENT_IMAGE)}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge className="bg-surface/95 backdrop-blur-xs">
              <Tag className="h-3.5 w-3.5" />
              <span>{event.eventType}</span>
            </Badge>
            {isPastEvent && (
              <Badge variant="muted" className="bg-surface/95">
                Completed
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="space-y-3">
              <h1 className="font-heading text-2xl font-extrabold leading-tight text-foreground sm:text-3xl lg:text-4xl">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatEventDateTime(event.eventDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {event.location}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <h2 className="mb-2.5 text-lg font-bold text-foreground">
                About This Initiative
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">
                {event.description}
              </p>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface-muted/50 p-4">
              {event.creatorPhoto ? (
                <img
                  src={event.creatorPhoto}
                  alt={event.creatorName}
                  className="h-11 w-11 rounded-full border border-border object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {event.creatorName.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Organized By
                </p>
                <p className="truncate text-sm font-bold text-foreground">
                  {event.creatorName}
                </p>
                <p className="truncate text-xs text-muted">
                  {event.creatorEmail}
                </p>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-5 rounded-2xl border border-border bg-surface-muted/40 p-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Community Turnout
                  </p>
                  <p className="mt-0.5 text-2xl font-extrabold text-foreground">
                    {event.joinedCount}{" "}
                    <span className="text-sm font-medium text-muted">
                      {event.joinedCount === 1 ? "volunteer" : "volunteers"}
                    </span>
                  </p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Users className="h-5 w-5" />
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Date &amp; Time</p>
                    <p className="text-muted">
                      {formatEventDateTime(event.eventDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Venue</p>
                    <p className="text-muted">{event.location}</p>
                  </div>
                </div>
              </div>

              {isPastEvent ? (
                <Button type="button" disabled className="w-full">
                  Event Has Ended
                </Button>
              ) : event.hasJoined ? (
                <div className="space-y-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled
                    className="w-full border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 opacity-100"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Already Joined</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLeaveEvent}
                    disabled={joining}
                    className="w-full"
                  >
                    {joining ? "Updating..." : "Cancel Participation"}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  onClick={handleJoinEvent}
                  disabled={joining}
                  className="w-full"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>
                    {joining
                      ? "Joining..."
                      : session?.user
                        ? "Join Event"
                        : "Login to Join Event"}
                  </span>
                </Button>
              )}

              {isCreator && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/manage-events">Manage This Event</Link>
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
