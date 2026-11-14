"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  CalendarCheck,
  CalendarPlus,
  ChevronDown,
  FolderKanban,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, clearStoredTokens, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const PRIVATE_DROPDOWN_LINKS = [
  {
    href: "/create-event",
    label: "Create Event",
    icon: CalendarPlus,
  },
  {
    href: "/manage-events",
    label: "Manage Events",
    icon: FolderKanban,
  },
  {
    href: "/joined-events",
    label: "Joined Events",
    icon: CalendarCheck,
  },
  {
    href: "/profile",
    label: "My Profile",
    icon: UserIcon,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = session?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CR";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            clearStoredTokens();
          },
        },
      });
      clearStoredTokens();
      toast.success("Logged out successfully.");
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      clearStoredTokens();
      toast.error("Unable to complete logout cleanly. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className={cn(
              "text-sm font-semibold transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted"
            )}
          >
            Home
          </Link>
          <Link
            href="/upcoming-events"
            className={cn(
              "text-sm font-semibold transition-colors hover:text-primary",
              pathname.startsWith("/upcoming-events")
                ? "text-primary"
                : "text-muted"
            )}
          >
            Upcoming Events
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {isPending ? (
            <Skeleton className="h-10 w-32 rounded-xl" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <DropdownMenu.Root>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <DropdownMenu.Trigger asChild>
                      <button
                        type="button"
                        aria-label={`Open account menu for ${user.name}`}
                        className="flex items-center gap-2 rounded-full border border-border bg-surface-muted/70 p-1 pr-2.5 transition-colors hover:border-primary/40 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {initials}
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 text-muted" />
                      </button>
                    </DropdownMenu.Trigger>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      sideOffset={8}
                      className="z-50 rounded-lg border border-border bg-foreground px-3 py-1.5 text-xs font-semibold text-background shadow-lg"
                    >
                      {user.name}
                      <Tooltip.Arrow className="fill-foreground" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={10}
                    collisionPadding={16}
                    className="z-50 max-h-[80vh] w-60 overflow-y-auto overflow-x-hidden rounded-2xl border border-border bg-surface p-2 text-foreground shadow-xl overscroll-contain"
                  >
                    <div className="mb-1.5 border-b border-border px-3 py-2">
                      <p className="truncate text-sm font-bold text-foreground">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>

                    {PRIVATE_DROPDOWN_LINKS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenu.Item key={item.href} asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-surface-muted hover:text-primary cursor-pointer",
                              pathname === item.href &&
                                "bg-primary/10 text-primary font-semibold"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenu.Item>
                      );
                    })}

                    <DropdownMenu.Separator className="my-1.5 h-px bg-border" />

                    <DropdownMenu.Item
                      onSelect={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-danger outline-none transition-colors hover:bg-danger/10 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <LogOut className="h-4 w-4" />
                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </Button>
            </div>
          ) : (
            <Button
              asChild
              className="bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-border bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-muted",
                pathname === "/" ? "bg-primary/10 text-primary" : "text-foreground"
              )}
            >
              Home
            </Link>
            <Link
              href="/upcoming-events"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-muted",
                pathname.startsWith("/upcoming-events")
                  ? "bg-primary/10 text-primary"
                  : "text-foreground"
              )}
            >
              Upcoming Events
            </Link>

            {isPending ? (
              <Skeleton className="mt-2 h-11 w-full rounded-xl" />
            ) : user ? (
              <>
                <div className="my-2 flex items-center gap-3 rounded-xl border border-border bg-surface-muted/50 px-3 py-2.5">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {initials}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>

                {PRIVATE_DROPDOWN_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface-muted",
                        pathname === item.href
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <Button
                  type="button"
                  variant="default"
                  className="mt-2 w-full bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="mt-2 w-full bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
