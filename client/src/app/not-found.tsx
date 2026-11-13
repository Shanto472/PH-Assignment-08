import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="mb-4 inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase">
        404 &bull; Page Not Found
      </span>
      <h1 className="section-heading">We couldn&apos;t find that page</h1>
      <p className="section-subtitle mt-3 max-w-md">
        The community event or route you are looking for might have moved or is
        no longer available.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/upcoming-events">
            <Compass className="h-4 w-4" />
            <span>Browse Upcoming Events</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

