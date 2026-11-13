import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getMyEvents,
  getRecentUpcomingEvents,
  getUpcomingEvents,
  updateEvent,
} from "../controllers/events.controller.js";
import {
  optionalJwtAuth,
  requireJwtAuth,
} from "../middleware/auth.middleware.js";

const eventsRouter = Router();

eventsRouter.get("/recent", getRecentUpcomingEvents);
eventsRouter.get("/my-events", requireJwtAuth, getMyEvents);
eventsRouter.get("/", getUpcomingEvents);
eventsRouter.get("/:id", optionalJwtAuth, getEventById);
eventsRouter.post("/", requireJwtAuth, createEvent);
eventsRouter.patch("/:id", requireJwtAuth, updateEvent);
eventsRouter.put("/:id", requireJwtAuth, updateEvent);
eventsRouter.delete("/:id", requireJwtAuth, deleteEvent);

export default eventsRouter;
