import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer, jwt } from "better-auth/plugins";
import { db, mongoClient } from "./db.js";
import { env } from "./env.js";

const socialProviders =
  env.googleClientId && env.googleClientSecret
    ? {
        google: {
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret,
          prompt: "select_account" as const,
        },
      }
    : undefined;

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: mongoClient,
    transaction: env.mongodbTransactions,
  }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  trustedOrigins: env.trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },
  ...(socialProviders ? { socialProviders } : {}),
  user: {
    changeEmail: {
      enabled: false,
    },
  },
  advanced: {
    trustedProxyHeaders: true,
    useSecureCookies: env.isProduction,
    defaultCookieAttributes: {
      sameSite: env.isProduction ? "none" : "lax",
      secure: env.isProduction,
    },
  },
  plugins: [
    bearer(),
    jwt({
      jwt: {
        expirationTime: "7d",
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? null,
        }),
      },
    }),
  ],
});

export type AuthInstance = typeof auth;
