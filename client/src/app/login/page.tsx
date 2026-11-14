"use client";

import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccessAlert } from "@/lib/alerts";
import { authClient, continueWithGoogle, getJwtToken, useSession } from "@/lib/auth-client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"
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

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const redirectParam = searchParams.get("redirect");
  const redirectTarget =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      router.replace(redirectTarget);
    }
  }, [session, router, redirectTarget]);

  const validate = (): boolean => {
    const nextErrors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted login fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      await getJwtToken(true);
      await showSuccessAlert(
        "Welcome back!",
        "You have signed in to CivicRoots successfully."
      );
      router.push(redirectTarget);
      router.refresh();
    } catch {
      toast.error("Unable to connect to authentication server.");
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
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-7 shadow-xl sm:p-9">
        <div className="mb-7 space-y-2 text-center">
          <span className="inline-flex rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Community Access
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Sign in to CivicRoots
          </h1>
          <p className="text-sm text-muted">
            Log in to host local drives, join upcoming events, and track your
            neighborhood impact.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-sm font-semibold text-foreground"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
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
              htmlFor="login-password"
              className="block text-sm font-semibold text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
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
              <p className="text-xs font-medium text-danger">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            <LogIn className="h-4 w-4" />
            <span>{submitting ? "Signing in..." : "Login"}</span>
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
          <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </Button>

        <p className="mt-6 text-center text-sm text-muted">
          New to CivicRoots?{" "}
          <Link
            href={
              redirectParam
                ? `/register?redirect=${encodeURIComponent(redirectParam)}`
                : "/register"
            }
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center px-4 py-12">
          <Skeleton className="h-[460px] w-full rounded-3xl" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
