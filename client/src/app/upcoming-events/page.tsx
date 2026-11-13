"use client";

import { CalendarPlus, Filter, RefreshCw, Search, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { EventCard } from "@/components/events/event-card";
import { EventGridSkeleton } from "@/components/events/event-card-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES, SocialEvent } from "@/types/event";

const FILTER_OPTIONS = ["All", ...EVENT_CATEGORIES] as const;

function UpcomingEventsContent() {
  const searchParams = useSearchParams();
  const initialTypeParam = searchParams.get("type");
  const initialType = FILTER_OPTIONS.includes(
    initialTypeParam as (typeof FILTER_OPTIONS)[number]
  )
    ? (initialTypeParam as string)
    : "All";

  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getUpcoming({
        search: appliedSearch,
        type: selectedType,
      });
      const upcomingOnly = (res.events || []).filter(
        (ev) => new Date(ev.eventDate).getTime() > Date.now()
      );
      setEvents(upcomingOnly);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load upcoming events."
      );
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, selectedType]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setSelectedType("All");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border pb-8 lg:flex-row lg:items-end">
        <div className="space-y-2.5">
          <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
            Live Community Calendar
          </span>
          <h1 className="section-heading">Upcoming Social Events</h1>
          <p className="section-subtitle max-w-2xl">
            Browse upcoming social service initiatives happening across local
            neighborhoods. Past events are automatically filtered out so every
            opportunity is open for action.
          </p>
        </div>

        <Button asChild className="self-start lg:self-auto">
          <Link href="/create-event">
            <CalendarPlus className="h-4 w-4" />
            <span>Create Event</span>
          </Link>
        </Button>
      </div>

      {/* Search and Category Filter Controls */}
      <div className="mb-8 space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-xs sm:p-5">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by event title, neighborhood, or keyword (e.g., Mirpur, Blanket)..."
              className="pl-10 pr-9"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchInput("");
                  setAppliedSearch("");
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="shrink-0">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Filter className="h-3.5 w-3.5" />
            <span>Category:</span>
          </span>
          {FILTER_OPTIONS.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedType(category)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                selectedType === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-muted/60 text-foreground hover:border-primary/40 hover:text-primary"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <EventGridSkeleton count={6} />
      ) : error ? (
        <div className="rounded-3xl border border-border bg-surface p-10 text-center">
          <p className="text-base font-semibold text-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            onClick={loadEvents}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <h2 className="text-lg font-bold text-foreground">
            No matching upcoming events found
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            {appliedSearch || selectedType !== "All"
              ? "Try clearing your search or switching event categories to explore more upcoming initiatives."
              : "No upcoming drives are currently scheduled. Start one for your neighborhood!"}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(appliedSearch || selectedType !== "All") && (
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            )}
            <Button asChild>
              <Link href="/create-event">
                <CalendarPlus className="h-4 w-4" />
                <span>Create Event</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm font-medium text-muted">
            Showing <span className="font-bold text-foreground">{events.length}</span>{" "}
            upcoming {events.length === 1 ? "event" : "events"}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function UpcomingEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-12 w-72" />
          <EventGridSkeleton count={6} />
        </div>
      }
    >
      <UpcomingEventsContent />
    </Suspense>
  );
}
