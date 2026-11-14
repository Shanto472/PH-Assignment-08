import { ArrowRight, CalendarPlus, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface py-16 sm:py-20 lg:py-24">
      {/* Subtle organic background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-7 lg:col-span-7">
          <h1 className="font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            Turn Local Compassion Into{" "}
            <span className="text-primary">Organized Community Impact</span>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            CivicRoots brings neighbors together to create, join, and coordinate
            real-world social service initiatives—from winter clothes drives in
            Mirpur 10 and blanket outreach in Mohammadpur to lake cleanups and
            urban tree plantations.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Button asChild size="lg">
              <Link href="/upcoming-events">
                <span>Explore Upcoming Events</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/create-event">
                <CalendarPlus className="h-4 w-4 text-primary" />
                <span>Host an Event</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border pt-7 sm:max-w-lg">
            <div>
              <p className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                60+
              </p>
              <p className="text-xs font-medium text-muted">
                Local Drives Hosted
              </p>
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                1,400+
              </p>
              <p className="text-xs font-medium text-muted">
                Active Volunteers
              </p>
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                18
              </p>
              <p className="text-xs font-medium text-muted">
                City Wards Served
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative rounded-3xl border border-border bg-surface-muted/60 p-3 shadow-xl">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80"
                alt="Volunteers organizing community aid packages together"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-surface p-3.5">
                <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Mirpur 10 &amp; Mohammadpur</span>
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  Winter clothes &amp; blanket outreach drives ready for
                  volunteers.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-3.5">
                <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-accent">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Hosting</span>
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  Future-dated events with transparent organizer tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
