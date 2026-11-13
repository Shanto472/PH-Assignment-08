import { Router } from "express";
import {
  getMyJoinedEvents,
  joinEvent,
  leaveEvent,
} from "../controllers/joins.controller.js";
import { requireJwtAuth } from "../middleware/auth.middleware.js";

const joinsRouter = Router();

joinsRouter.get("/my-joined", requireJwtAuth, getMyJoinedEvents);
joinsRouter.post("/:eventId", requireJwtAuth, joinEvent);
joinsRouter.delete("/:eventId", requireJwtAuth, leaveEvent);

export default joinsRouter;
