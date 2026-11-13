import Link from "next/link";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-foreground transition-opacity hover:opacity-90",
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sprout className="h-5 w-5" />
      </span>
      <span className="font-heading">
        Civic<span className="text-primary">Roots</span>
      </span>
    </Link>
  );
}
