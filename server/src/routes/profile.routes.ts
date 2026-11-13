import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";
import { requireJwtAuth } from "../middleware/auth.middleware.js";

const profileRouter = Router();

profileRouter.get("/", requireJwtAuth, getProfile);
profileRouter.patch("/", requireJwtAuth, updateProfile);

export default profileRouter;
