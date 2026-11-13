"use client";

import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FALLBACK_EVENT_IMAGE, formatEventDate } from "@/lib/utils";
import { SocialEvent } from "@/types/event";

export function EventCard({ event }: { event: SocialEvent }) {
  const [imgSrc, setImgSrc] = useState(event.thumbnail || FALLBACK_EVENT_IMAGE);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
        <img
          src={imgSrc}
          alt={event.title}
          onError={() => setImgSrc(FALLBACK_EVENT_IMAGE)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-surface/95 backdrop-blur-xs shadow-xs">
            {event.eventType}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {formatEventDate(event.eventDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-accent" />
              {event.joinedCount} joined
            </span>
          </div>

          <h3 className="line-clamp-2 min-h-[3.25rem] text-lg font-bold leading-snug text-foreground">
            {event.title}
          </h3>

          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{event.location}</span>
          </p>
        </div>

        <div className="pt-5">
          <Button asChild className="w-full">
            <Link href={`/events/${event._id}`}>
              <span>View Event</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
