"use client";

import {
  Calendar,
  CalendarPlus,
  ExternalLink,
  FolderKanban,
  MapPin,
  Pencil,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EventGridSkeleton } from "@/components/events/event-card-skeleton";
import { EventForm } from "@/components/events/event-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { confirmActionAlert } from "@/lib/alerts";
import { EventFormPayload, eventsApi } from "@/lib/api";
import { FALLBACK_EVENT_IMAGE, formatEventDateTime } from "@/lib/utils";
import { SocialEvent } from "@/types/event";

function ManageEventsContent() {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<SocialEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMyEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getMyEvents();
      setEvents(res.events || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your events."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyEvents();
  }, [loadMyEvents]);

  const handleUpdateEvent = async (payload: EventFormPayload) => {
    if (!editingEvent) return;
    try {
      const res = await eventsApi.update(editingEvent._id, payload);
      setEvents((prev) =>
        prev.map((item) => (item._id === editingEvent._id ? res.event : item))
      );
      setEditingEvent(null);
      toast.success("Event updated successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update event."
      );
    }
  };

  const handleDeleteEvent = async (event: SocialEvent) => {
    const confirmed = await confirmActionAlert({
      title: "Delete Event?",
      text: `Are you sure you want to permanently remove "${event.title}"?`,
      confirmText: "Yes, delete event",
    });

    if (!confirmed) return;

    setDeletingId(event._id);
    try {
      await eventsApi.remove(event._id);
      setEvents((prev) => prev.filter((item) => item._id !== event._id));
      toast.success("Event deleted successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to delete event."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
            <FolderKanban className="h-3.5 w-3.5" />
            <span>Organizer Dashboard</span>
          </span>
          <h1 className="section-heading">Manage My Events</h1>
          <p className="section-subtitle max-w-2xl">
            Update event schedules, refine community guidelines, or remove
            drives that you created.
          </p>
        </div>

        <Button asChild className="self-start sm:self-auto">
          <Link href="/create-event">
            <CalendarPlus className="h-4 w-4" />
            <span>Create New Event</span>
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
            onClick={loadMyEvents}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <h2 className="text-lg font-bold text-foreground">
            You haven&apos;t created any events yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Host your first neighborhood cleanup, winter clothing drive, or
            plantation day and invite volunteers.
          </p>
          <Button asChild className="mt-6">
            <Link href="/create-event">
              <CalendarPlus className="h-4 w-4" />
              <span>Create First Event</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const isPast = new Date(event.eventDate).getTime() <= Date.now();
            return (
              <article
                key={event._id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
                  <img
                    src={event.thumbnail || FALLBACK_EVENT_IMAGE}
                    alt={event.title}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                    }}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-surface/95 backdrop-blur-xs">
                      {event.eventType}
                    </Badge>
                    {isPast && (
                      <Badge variant="muted" className="bg-surface/95">
                        Past
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {formatEventDateTime(event.eventDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-accent" />
                        {event.joinedCount}
                      </span>
                    </div>

                    <h2 className="line-clamp-2 min-h-[3.25rem] text-lg font-bold text-foreground">
                      {event.title}
                    </h2>

                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{event.location}</span>
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/events/${event._id}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingEvent(event)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === event._id}
                      onClick={() => handleDeleteEvent(event)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>
                        {deletingId === event._id ? "..." : "Delete"}
                      </span>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(editingEvent)}
        onOpenChange={(open) => {
          if (!open) setEditingEvent(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Event Details</DialogTitle>
            <DialogDescription>
              Edit your event information below. All updates must keep a valid
              future event date.
            </DialogDescription>
          </DialogHeader>

          {editingEvent && (
            <EventForm
              key={editingEvent._id}
              initialValues={{
                title: editingEvent.title,
                description: editingEvent.description,
                eventType: editingEvent.eventType,
                thumbnail: editingEvent.thumbnail,
                location: editingEvent.location,
                eventDate: new Date(editingEvent.eventDate),
              }}
              submitLabel="Save Changes"
              submittingLabel="Saving..."
              onSubmit={handleUpdateEvent}
              onCancel={() => setEditingEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ManageEventsPage() {
  return (
    <ProtectedRoute>
      <ManageEventsContent />
    </ProtectedRoute>
  );
}
