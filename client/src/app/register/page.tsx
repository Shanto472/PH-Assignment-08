"use client";

import {
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccessAlert } from "@/lib/alerts";
import { authClient, continueWithGoogle, getJwtToken, useSession } from "@/lib/auth-client";
import { isValidHttpUrl } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"
      />
      <path
        fill="#34A853"
        d="M3.5 7.3l3.2 2.3C7.6 7.8 9.6 6.4 12 6.4c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 8.3 2.4 5.1 4.5 3.5 7.3z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.6c2.5 0 4.6-.8 6.2-2.2l-2.9-2.4c-.8.6-1.9 1-3.3 1-3.8 0-5.1-2.5-5.4-3.8l-3.2 2.5C5 19.6 8.3 21.6 12 21.6z"
      />
      <path
        fill="#4285F4"
        d="M21.2 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.4-1.1 2.4-2.1 3l2.9 2.4c1.7-1.6 3-4 3-7.7z"
      />
    </svg>
  );
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const redirectParam = searchParams.get("redirect");
  const redirectTarget =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    photoURL?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (session?.user) {
      router.replace(redirectTarget);
    }
  }, [session, router, redirectTarget]);

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasMinLength = password.length >= 6;

  const validate = (): boolean => {
    const nextErrors: {
      name?: string;
      email?: string;
      photoURL?: string;
      password?: string;
    } = {};

    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = "Full name must be at least 2 characters long.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!photoURL.trim()) {
      nextErrors.photoURL = "Profile photo URL is required.";
    } else if (!isValidHttpUrl(photoURL.trim())) {
      nextErrors.photoURL =
        "Photo URL must be a valid link starting with http:// or https://.";
    }

    if (!hasMinLength) {
      nextErrors.password = "Password must be at least 6 characters long.";
    } else if (!hasUppercase) {
      nextErrors.password =
        "Password must include at least one uppercase letter (A-Z).";
    } else if (!hasLowercase) {
      nextErrors.password =
        "Password must include at least one lowercase letter (a-z).";
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

    setSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photoURL.trim(),
      });

      if (error) {
        toast.error(
          error.message || "Could not create account. Please try again."
        );
        return;
      }

      await getJwtToken(true);
      await showSuccessAlert(
        "Account created!",
        "Welcome to CivicRoots. You are now signed in."
      );
      router.push(redirectTarget);
      router.refresh();
    } catch {
      toast.error("Unable to reach authentication server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await continueWithGoogle(redirectTarget);
      if (res.redirected) {
        return;
      }
      if (!res.success) {
        toast.error(res.error || "Could not complete Google sign-in.");
        setGoogleLoading(false);
        return;
      }

      await showSuccessAlert(
        "Welcome!",
        "You have signed in with Google successfully."
      );
      router.push(redirectTarget);
      router.refresh();
    } catch {
      toast.error("Could not initiate Google sign-in.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-7 shadow-xl sm:p-9">
        <div className="mb-7 space-y-2 text-center">
          <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Join the Movement
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Create your CivicRoots account
          </h1>
          <p className="text-sm text-muted">
            Organize neighborhood service events and join causes happening near
            you.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="register-name"
              className="block text-sm font-semibold text-foreground"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="e.g., Ayesha Siddiqua"
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
              <p className="text-xs font-medium text-danger">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="register-email"
              className="block text-sm font-semibold text-foreground"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                hasError={Boolean(errors.email)}
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-danger">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="register-photo"
              className="block text-sm font-semibold text-foreground"
            >
              Photo URL
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <ImageIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="register-photo"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={photoURL}
                  onChange={(e) => {
                    setPhotoURL(e.target.value);
                    if (errors.photoURL)
                      setErrors((prev) => ({ ...prev, photoURL: undefined }));
                  }}
                  hasError={Boolean(errors.photoURL)}
                  className="pl-10"
                />
              </div>
              {isValidHttpUrl(photoURL) && (
                <img
                  src={photoURL.trim()}
                  alt="Profile preview"
                  className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            {errors.photoURL && (
              <p className="text-xs font-medium text-danger">
                {errors.photoURL}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="register-password"
              className="block text-sm font-semibold text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                hasError={Boolean(errors.password)}
                className="pr-10 pl-10"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-danger">
                {errors.password}
              </p>
            )}

            <ul className="grid grid-cols-1 gap-1.5 rounded-xl border border-border bg-surface-muted/50 p-3 text-xs sm:grid-cols-3">
              <li
                className={
                  hasUppercase
                    ? "flex items-center gap-1.5 font-medium text-primary"
                    : "flex items-center gap-1.5 text-muted"
                }
              >
                {hasUppercase ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>1 uppercase</span>
              </li>
              <li
                className={
                  hasLowercase
                    ? "flex items-center gap-1.5 font-medium text-primary"
                    : "flex items-center gap-1.5 text-muted"
                }
              >
                {hasLowercase ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>1 lowercase</span>
              </li>
              <li
                className={
                  hasMinLength
                    ? "flex items-center gap-1.5 font-medium text-primary"
                    : "flex items-center gap-1.5 text-muted"
                }
              >
                {hasMinLength ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>6+ characters</span>
              </li>
            </ul>
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={submitting}>
            <UserPlus className="h-4 w-4" />
            <span>{submitting ? "Creating account..." : "Register"}</span>
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <GoogleIcon />
          <span>
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </span>
        </Button>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href={
              redirectParam
                ? `/login?redirect=${encodeURIComponent(redirectParam)}`
                : "/login"
            }
            className="font-semibold text-primary hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center px-4 py-12">
          <Skeleton className="h-[540px] w-full rounded-3xl" />
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
