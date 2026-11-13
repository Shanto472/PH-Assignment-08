import { CalendarCheck2, Compass, ShieldCheck, UsersRound } from "lucide-react";

const FEATURES = [
  {
    icon: Compass,
    title: "Create Local Initiatives",
    description:
      "Launch cleanups, tree plantations, winter clothing drives, or literacy camps with verified future scheduling and clear location details.",
  },
  {
    icon: UsersRound,
    title: "One-Click Volunteer Joining",
    description:
      "Inspect full drive details publicly and reserve your spot as a participant once signed in—with duplicate-join protection built in.",
  },
  {
    icon: CalendarCheck2,
    title: "Chronological Event Tracking",
    description:
      "Keep all your joined drives organized on a dedicated calendar-sorted dashboard so you never miss an upcoming neighborhood shift.",
  },
  {
    icon: ShieldCheck,
    title: "Creator-Only Event Control",
    description:
      "Update schedules, refine descriptions, or cancel drives with full ownership checks protected by cryptographic JWT authentication.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center space-y-3">
          <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
            Platform Capabilities
          </span>
          <h2 className="section-heading">
            Built for Reliable Grassroots Coordination
          </h2>
          <p className="section-subtitle">
            Every workflow is designed so community organizers and volunteers
            spend less time messaging across scattered groups and more time
            making a visible difference.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
