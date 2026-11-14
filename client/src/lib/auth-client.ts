"use client";

import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const BEARER_STORAGE_KEY = "civicroots_bearer_token";
const JWT_STORAGE_KEY = "civicroots_api_jwt";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [jwtClient()],
  fetchOptions: {
    credentials: "include",
    auth: {
      type: "Bearer",
      token: () => {
        if (typeof window === "undefined") return undefined;
        return window.localStorage.getItem(BEARER_STORAGE_KEY) || undefined;
      },
    },
    onSuccess: async (ctx) => {
      if (typeof window === "undefined") return;
      const bearer = ctx.response.headers.get("set-auth-token");
      if (bearer) {
        window.localStorage.setItem(BEARER_STORAGE_KEY, bearer);
      }
    },
  },
});

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BEARER_STORAGE_KEY);
  window.sessionStorage.removeItem(JWT_STORAGE_KEY);
}

function isJwtValidSoon(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    if (!payload.exp) return true;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowSeconds + 60;
  } catch {
    return false;
  }
}

export async function getJwtToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (!forceRefresh) {
    const cached = window.sessionStorage.getItem(JWT_STORAGE_KEY);
    if (cached && isJwtValidSoon(cached)) {
      return cached;
    }
  }

  try {
    const { data, error } = await authClient.token();
    if (error || !data?.token) {
      return null;
    }
    window.sessionStorage.setItem(JWT_STORAGE_KEY, data.token);
    return data.token;
  } catch {
    return null;
  }
}

export async function continueWithGoogle(
  redirectTarget = "/"
): Promise<{ success: boolean; redirected?: boolean; error?: string }> {
  try {
    const callbackURL = `${window.location.origin}${redirectTarget}`;
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    if (result?.error) {
      return {
        success: false,
        error:
          result.error.message ||
          "Google sign-in is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on your backend server.",
      };
    }

    if (result?.data?.url) {
      window.location.href = result.data.url;
      return { success: true, redirected: true };
    }

    return { success: true, redirected: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Could not initiate Google sign-in.",
    };
  }
}

export const { useSession } = authClient;
