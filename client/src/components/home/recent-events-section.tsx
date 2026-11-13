"use client";

import { ArrowRight, CalendarPlus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EventCard } from "@/components/events/event-card";
import { EventGridSkeleton } from "@/components/events/event-card-skeleton";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/lib/api";
import { SocialEvent } from "@/types/event";

export function RecentEventsSection() {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecentEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getRecentUpcoming();
      setEvents(res.events || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load recent upcoming events."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentEvents();
  }, [loadRecentEvents]);

  return (
    <section className="border-t border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
              Happening Next
            </span>
            <h2 className="section-heading">Recent Upcoming Events</h2>
            <p className="section-subtitle max-w-2xl">
              Discover the next six upcoming community-led service events near
              you and step in where extra hands matter most.
            </p>
          </div>

          <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
            <Link href="/upcoming-events">
              <span>See All Upcoming</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <EventGridSkeleton count={6} />
        ) : error ? (
          <div className="rounded-3xl border border-border bg-surface p-10 text-center shadow-xs">
            <p className="text-base font-semibold text-foreground">{error}</p>
            <p className="mt-1 text-sm text-muted">
              Make sure the Express API server and MongoDB database are running.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={loadRecentEvents}
              className="mt-5"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
            <h3 className="text-lg font-bold text-foreground">
              No upcoming events scheduled yet
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Be the first neighbor to organize a cleanup, tree plantation, or
              winter donation drive in your community.
            </p>
            <Button asChild className="mt-6">
              <Link href="/create-event">
                <CalendarPlus className="h-4 w-4" />
                <span>Create an Event</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
