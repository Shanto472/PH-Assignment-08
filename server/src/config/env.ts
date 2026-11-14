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

function sanitizeMongoUri(raw: string | undefined): string {
  let uri = (raw || "").trim();
  if (!uri) return "mongodb://127.0.0.1:27017/civicroots";

  // Strip wrapping quotes
  uri = uri.replace(/^["']|["']$/g, "").trim();
  // Strip MONGODB_URI= prefix if accidentally included
  uri = uri.replace(/^MONGODB_URI\s*=\s*/i, "").trim();
  uri = uri.replace(/^["']|["']$/g, "").trim();

  // If credentials are present, sanitize password encoding and strip accidental < >
  const match = uri.match(
    /^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@\/]+)(\/.*)?$/
  );
  if (match) {
    const [, protocol, user, pass, host, rest] = match;
    let cleanPass = pass;
    if (cleanPass.startsWith("<") && cleanPass.endsWith(">")) {
      cleanPass = cleanPass.slice(1, -1);
    }
    const safePass = encodeURIComponent(decodeURIComponent(cleanPass));
    const safeUser = encodeURIComponent(decodeURIComponent(user));
    uri = `${protocol}${safeUser}:${safePass}@${host}${
      rest || "/civicroots?retryWrites=true&w=majority"
    }`;
  }

  return uri;
}

const rawSecret = process.env.BETTER_AUTH_SECRET?.trim() || "";
const safeBetterAuthSecret =
  rawSecret.length >= 32
    ? rawSecret
    : (rawSecret + "-civicroots-production-secret-min-32-chars").slice(0, 64);

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  mongodbUri: sanitizeMongoUri(process.env.MONGODB_URI),
  mongodbDbName: (process.env.MONGODB_DB_NAME || "civicroots").trim(),
  mongodbTransactions: process.env.MONGODB_TRANSACTIONS === "true",
  betterAuthSecret: safeBetterAuthSecret,
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

