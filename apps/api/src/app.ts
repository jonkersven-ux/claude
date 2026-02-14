import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error-handler";
import { authRouter } from "./modules/auth/auth.router";
import { guestRouter } from "./modules/guests/guest.router";
import { matchRouter } from "./modules/matches/match.router";
import { invitationRouter } from "./modules/invitations/invitation.router";
import { seasonRouter } from "./modules/seasons/season.router";
import { dashboardRouter } from "./modules/dashboard/dashboard.router";
import { aiRouter } from "./modules/ai/ai.router";

const app = express();

// ── Global middleware ──────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("short"));

// ── Health check ──────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "hostiq-api", timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────
const api = express.Router();

api.use("/auth", authRouter);
api.use("/guests", guestRouter);
api.use("/matches", matchRouter);
api.use("/invitations", invitationRouter);
api.use("/seasons", seasonRouter);
api.use("/dashboard", dashboardRouter);
api.use("/ai", aiRouter);

app.use("/api/v1", api);

// ── Error handling ────────────────────────────────────
app.use(errorHandler);

export default app;
