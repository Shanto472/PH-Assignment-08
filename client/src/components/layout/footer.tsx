import { HeartHandshake, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";

function XBrandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo />
            <p className="text-sm leading-relaxed text-muted">
              A civic-driven social development platform connecting local
              volunteers, neighborhood organizers, and grassroots initiatives
              across communities.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow CivicRoots on X"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-muted/70 text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <XBrandIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow CivicRoots on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-muted/70 text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.6v3h2.7v8h3.2z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow CivicRoots on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-muted/70 text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow CivicRoots on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-muted/70 text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M6.94 8.5H3.56V19.5H6.94V8.5ZM5.25 3.5C4.14 3.5 3.25 4.39 3.25 5.5C3.25 6.6 4.14 7.5 5.25 7.5C6.35 7.5 7.25 6.6 7.25 5.5C7.25 4.39 6.35 3.5 5.25 3.5ZM20.44 13.02C20.44 9.88 18.76 8.22 16.16 8.22C14.36 8.22 13.48 9.21 13.02 9.93V8.5H9.65C9.7 9.48 9.65 19.5 9.65 19.5H13.02V13.36C13.02 13.02 13.05 12.69 13.15 12.45C13.42 11.78 14.03 11.09 15.07 11.09C16.41 11.09 17.06 12.11 17.06 13.6V19.5H20.44V13.02Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">
              Explore Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link
                  href="/upcoming-events"
                  className="transition-colors hover:text-primary"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  href="/create-event"
                  className="transition-colors hover:text-primary"
                >
                  Host an Event
                </Link>
              </li>
              <li>
                <Link
                  href="/joined-events"
                  className="transition-colors hover:text-primary"
                >
                  My Joined Events
                </Link>
              </li>
              <li>
                <Link
                  href="/manage-events"
                  className="transition-colors hover:text-primary"
                >
                  Manage Created Events
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">
              Impact Pillars
            </h3>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link
                  href="/upcoming-events?type=Donation"
                  className="transition-colors hover:text-primary"
                >
                  Winter & Blanket Drives
                </Link>
              </li>
              <li>
                <Link
                  href="/upcoming-events?type=Cleanup"
                  className="transition-colors hover:text-primary"
                >
                  Neighborhood Cleanups
                </Link>
              </li>
              <li>
                <Link
                  href="/upcoming-events?type=Plantation"
                  className="transition-colors hover:text-primary"
                >
                  Urban Tree Plantation
                </Link>
              </li>
              <li>
                <Link
                  href="/upcoming-events?type=Education"
                  className="transition-colors hover:text-primary"
                >
                  Community Literacy & Care
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">
              Community Hub
            </h3>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Road 12, Dhanmondi, Dhaka 1209, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>hello@civicroots.org</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>+880 1700-000842</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} CivicRoots. Empowering local
            social development.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <HeartHandshake className="h-3.5 w-3.5 text-accent" />
            <span>Built for local changemakers and neighborhood volunteers</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
