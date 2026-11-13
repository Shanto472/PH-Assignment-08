"use client";

import { CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EventForm } from "@/components/events/event-form";
import { showSuccessAlert } from "@/lib/alerts";
import { EventFormPayload, eventsApi } from "@/lib/api";

function CreateEventContent() {
  const router = useRouter();

  const handleCreateEvent = async (payload: EventFormPayload) => {
    try {
      await eventsApi.create(payload);
      await showSuccessAlert(
        "Event Published!",
        "Your community event is now live on Upcoming Events."
      );
      router.push("/upcoming-events");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create event."
      );
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
          <CalendarPlus className="h-3.5 w-3.5" />
          <span>Organizer Studio</span>
        </span>
        <h1 className="section-heading">Create a Social Service Event</h1>
        <p className="section-subtitle">
          Share clear logistics, venue details, and a future date so local
          volunteers can discover and join your initiative.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <EventForm
          submitLabel="Publish Event"
          submittingLabel="Publishing..."
          onSubmit={handleCreateEvent}
        />
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <CreateEventContent />
    </ProtectedRoute>
  );
}
