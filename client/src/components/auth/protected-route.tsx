"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

export function PageLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-2xl border border-border bg-surface p-4 space-y-4"
          >
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session?.user) {
      const target = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${target}`);
    }
  }, [isPending, session, router, pathname]);

  if (isPending || !session?.user) {
    return <PageLoadingSkeleton />;
  }

  return <>{children}</>;
}
