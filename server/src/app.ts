import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import eventsRouter from "./routes/events.routes.js";
import joinsRouter from "./routes/joins.routes.js";
import profileRouter from "./routes/profile.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.trustedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-auth-token"],
  })
);

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

const authHandler = toNodeHandler(auth);
app.all("/api/auth/*splat", (req, res) => {
  return authHandler(req, res);
});

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    name: "CivicRoots API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/events", eventsRouter);
app.use("/api/joins", joinsRouter);
app.use("/api/profile", profileRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

export default app;
