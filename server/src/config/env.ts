import "dotenv/config";

const parseOrigins = (raw: string | undefined, fallback: string): string[] => {
  const value = raw?.trim() || fallback;
  return value
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
};

const frontendOrigins = parseOrigins(
  process.env.FRONTEND_URL,
  "http://localhost:3000"
);

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/civicroots",
  mongodbDbName: process.env.MONGODB_DB_NAME || "civicroots",
  mongodbTransactions: process.env.MONGODB_TRANSACTIONS === "true",
  betterAuthSecret:
    process.env.BETTER_AUTH_SECRET ||
    "civicroots-dev-secret-change-in-production-32chars",
  betterAuthUrl: (
    process.env.BETTER_AUTH_URL ||
    frontendOrigins[0] ||
    "http://localhost:3000"
  ).replace(/\/+$/, ""),
  frontendUrl: frontendOrigins[0] || "http://localhost:3000",
  trustedOrigins: Array.from(
    new Set([
      ...frontendOrigins,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ])
  ),
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
};

