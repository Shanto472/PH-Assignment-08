import { NextFunction, Request, Response } from "express";
import { createLocalJWKSet, JSONWebKeySet, jwtVerify } from "jose";
import { auth } from "../config/auth.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

let cachedJwks: JSONWebKeySet | null = null;
let cachedAt = 0;
const JWKS_TTL_MS = 5 * 60 * 1000;

async function getLocalJwks(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedJwks && now - cachedAt < JWKS_TTL_MS) {
    return createLocalJWKSet(cachedJwks);
  }

  const jwks = (await auth.api.getJwks()) as JSONWebKeySet;
  cachedJwks = jwks;
  cachedAt = now;
  return createLocalJWKSet(jwks);
}

export async function verifyBearerJwt(
  token: string
): Promise<AuthenticatedUser> {
  const verifyWithJwks = async (forceRefresh: boolean) => {
    const jwks = await getLocalJwks(forceRefresh);
    return jwtVerify(token, jwks);
  };

  let result;
  try {
    result = await verifyWithJwks(false);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "ERR_JWKS_NO_MATCHING_KEY") {
      result = await verifyWithJwks(true);
    } else {
      throw err;
    }
  }

  const payload = result.payload as Record<string, unknown>;
  const id = String(payload.id ?? payload.sub ?? "");
  const email = typeof payload.email === "string" ? payload.email : "";
  const name = typeof payload.name === "string" ? payload.name : "Community Member";
  const image = typeof payload.image === "string" ? payload.image : null;

  if (!id || !email) {
    throw new Error("JWT payload missing required user claims.");
  }

  return { id, email, name, image };
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice(7).trim();
  return token || null;
}

export async function requireJwtAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Missing Bearer JWT.",
    });
    return;
  }

  try {
    req.user = await verifyBearerJwt(token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired JWT token. Please log in again.",
    });
  }
}

export async function optionalJwtAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);
  if (token) {
    try {
      req.user = await verifyBearerJwt(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
}
