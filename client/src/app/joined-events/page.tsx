"use client";

import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  Compass,
  LogOut,
  MapPin,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EventGridSkeleton } from "@/components/events/event-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { confirmActionAlert } from "@/lib/alerts";
import { joinsApi } from "@/lib/api";
import { FALLBACK_EVENT_IMAGE, formatEventDateTime } from "@/lib/utils";
import { JoinedEventRecord } from "@/types/event";

function JoinedEventsContent() {
  const [joinedEvents, setJoinedEvents] = useState<JoinedEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const loadJoinedEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await joinsApi.getMyJoined();
      const sorted = [...(res.joinedEvents || [])].sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
      setJoinedEvents(sorted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load joined events."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJoinedEvents();
  }, [loadJoinedEvents]);

  const handleLeave = async (record: JoinedEventRecord) => {
    const confirmed = await confirmActionAlert({
      title: "Cancel Participation?",
      text: `Do you want to leave "${record.eventTitle}"?`,
      confirmText: "Yes, leave event",
    });

    if (!confirmed) return;

    setLeavingId(record.eventId);
    try {
      await joinsApi.leaveEvent(record.eventId);
      setJoinedEvents((prev) =>
        prev.filter((item) => item.eventId !== record.eventId)
      );
      toast.success("Removed from your joined events.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not cancel participation."
      );
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Volunteer Schedule</span>
          </span>
          <h1 className="section-heading">My Joined Events</h1>
          <p className="section-subtitle max-w-2xl">
            Your committed community service drives, sorted chronologically by
            event date so your upcoming shifts come first.
          </p>
        </div>

        <Button asChild variant="outline" className="self-start sm:self-auto">
          <Link href="/upcoming-events">
            <Compass className="h-4 w-4" />
            <span>Discover More Events</span>
          </Link>
        </Button>
      </div>

      {loading ? (
        <EventGridSkeleton count={3} />
      ) : error ? (
        <div className="rounded-3xl border border-border bg-surface p-10 text-center">
          <p className="text-base font-semibold text-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            onClick={loadJoinedEvents}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : joinedEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <h2 className="text-lg font-bold text-foreground">
            You haven&apos;t joined any events yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Explore upcoming cleanups, plantations, and winter distribution
            drives to join a community effort near you.
          </p>
          <Button asChild className="mt-6">
            <Link href="/upcoming-events">
              <Compass className="h-4 w-4" />
              <span>Browse Upcoming Events</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {joinedEvents.map((item) => {
            const isPast = new Date(item.eventDate).getTime() <= Date.now();
            return (
              <article
                key={item._id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
                  <img
                    src={item.eventThumbnail || FALLBACK_EVENT_IMAGE}
                    alt={item.eventTitle}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                    }}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-surface/95 backdrop-blur-xs">
                      {item.eventType}
                    </Badge>
                    <Badge
                      variant={isPast ? "muted" : "success"}
                      className="bg-surface/95"
                    >
                      {isPast ? "Completed" : "Joined"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatEventDateTime(item.eventDate)}</span>
                    </div>

                    <h2 className="line-clamp-2 min-h-[3.25rem] text-lg font-bold text-foreground">
                      {item.eventTitle}
                    </h2>

                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{item.eventLocation}</span>
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                    <Button asChild className="flex-1">
                      <Link href={`/events/${item.eventId}`}>
                        <span>View Event</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    {!isPast && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Leave event"
                        title="Cancel participation"
                        disabled={leavingId === item.eventId}
                        onClick={() => handleLeave(item)}
                      >
                        <LogOut className="h-4 w-4 text-danger" />
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function JoinedEventsPage() {
  return (
    <ProtectedRoute>
      <JoinedEventsContent />
    </ProtectedRoute>
  );
}
