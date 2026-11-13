"use client";

import {
  CalendarCheck,
  FolderKanban,
  Image as ImageIcon,
  Mail,
  Save,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccessAlert } from "@/lib/alerts";
import { profileApi } from "@/lib/api";
import { authClient, getJwtToken, useSession } from "@/lib/auth-client";
import { isValidHttpUrl } from "@/lib/utils";
import { UserProfile } from "@/types/event";

function ProfileContent() {
  const { data: session, refetch } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileApi.get();
      setProfile(res.profile);
      setName(res.profile.name || "");
      setImage(res.profile.image || "");
    } catch {
      if (session?.user) {
        setName(session.user.name || "");
        setImage(session.user.image || "");
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const validate = (): boolean => {
    const nextErrors: { name?: string; image?: string } = {};
    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = "Display name must be at least 2 characters long.";
    }
    if (image.trim() && !isValidHttpUrl(image.trim())) {
      nextErrors.image =
        "Profile photo URL must start with http:// or https://.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.values(nextErrors)[0];
      if (firstError) toast.error(firstError);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const trimmedName = name.trim();
    const trimmedImage = image.trim();

    setSaving(true);
    try {
      const { error: authError } = await authClient.updateUser({
        name: trimmedName,
        image: trimmedImage || undefined,
      });

      if (authError) {
        toast.error(authError.message || "Could not update profile.");
        return;
      }

      await profileApi.update({
        name: trimmedName,
        image: trimmedImage,
      });

      await Promise.all([getJwtToken(true), refetch()]);
      setProfile((prev) =>
        prev
          ? { ...prev, name: trimmedName, image: trimmedImage }
          : prev
      );

      await showSuccessAlert(
        "Profile Updated",
        "Your display name and photo have been saved."
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl md:col-span-2" />
        </div>
      </div>
    );
  }

  const displayEmail = profile?.email || session?.user?.email || "";
  const previewPhoto = isValidHttpUrl(image) ? image.trim() : "";
  const initials =
    (name || displayEmail || "CR")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CR";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
          <UserIcon className="h-3.5 w-3.5" />
          <span>Member Account</span>
        </span>
        <h1 className="section-heading">My Profile</h1>
        <p className="section-subtitle">
          View your community impact and keep your organizer display name and
          profile picture up to date.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <aside className="space-y-4 md:col-span-5">
          <div className="rounded-3xl border border-border bg-surface p-6 text-center shadow-xs">
            <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30 bg-surface-muted">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt={name || "User avatar"}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-extrabold text-primary-foreground">
                  {initials}
                </div>
              )}
            </div>
            <h2 className="truncate text-xl font-bold text-foreground">
              {name || "Community Member"}
            </h2>
            <p className="mt-1 flex items-center justify-center gap-1.5 truncate text-xs text-muted">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{displayEmail}</span>
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5">
              <Link
                href="/manage-events"
                className="rounded-2xl border border-border bg-surface-muted/50 p-3 transition-colors hover:border-primary/40"
              >
                <FolderKanban className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="text-xl font-extrabold text-foreground">
                  {profile?.stats.createdCount ?? 0}
                </p>
                <p className="text-xs text-muted">Hosted</p>
              </Link>
              <Link
                href="/joined-events"
                className="rounded-2xl border border-border bg-surface-muted/50 p-3 transition-colors hover:border-primary/40"
              >
                <CalendarCheck className="mx-auto mb-1 h-4 w-4 text-accent" />
                <p className="text-xl font-extrabold text-foreground">
                  {profile?.stats.joinedCount ?? 0}
                </p>
                <p className="text-xs text-muted">Joined</p>
              </Link>
            </div>
          </div>
        </aside>

        <section className="md:col-span-7">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs sm:p-8">
            <h2 className="mb-5 text-lg font-bold text-foreground">
              Update Profile Information
            </h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="profile-email"
                  className="block text-sm font-semibold text-foreground"
                >
                  Email Address
                </label>
                <Input
                  id="profile-email"
                  type="email"
                  value={displayEmail}
                  disabled
                  className="bg-surface-muted/60"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-name"
                  className="block text-sm font-semibold text-foreground"
                >
                  Display Name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    id="profile-name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    hasError={Boolean(errors.name)}
                    className="pl-10"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs font-medium text-danger">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-image"
                  className="block text-sm font-semibold text-foreground"
                >
                  Profile Picture URL
                </label>
                <div className="relative">
                  <ImageIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    id="profile-image"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      if (errors.image)
                        setErrors((prev) => ({ ...prev, image: undefined }));
                    }}
                    hasError={Boolean(errors.image)}
                    className="pl-10"
                  />
                </div>
                {errors.image && (
                  <p className="text-xs font-medium text-danger">
                    {errors.image}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving..." : "Save Profile"}</span>
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
