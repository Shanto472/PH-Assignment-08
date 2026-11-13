import { Response } from "express";
import { db, getEventsCollection, getJoinedEventsCollection } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { isValidHttpUrl } from "../validators/event.validator.js";

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const usersCol = db.collection<{
    email: string;
    name?: string;
    image?: string | null;
    createdAt?: Date;
  }>("user");

  const eventsCol = getEventsCollection();
  const joinedCol = getJoinedEventsCollection();

  const [userDoc, createdCount, joinedCount] = await Promise.all([
    usersCol.findOne({ email: user.email }),
    eventsCol.countDocuments({ creatorEmail: user.email }),
    joinedCol.countDocuments({ userEmail: user.email }),
  ]);

  res.status(200).json({
    success: true,
    profile: {
      id: user.id,
      email: user.email,
      name: userDoc?.name || user.name,
      image: userDoc?.image ?? user.image ?? "",
      createdAt: userDoc?.createdAt ? new Date(userDoc.createdAt).toISOString() : null,
      stats: {
        createdCount,
        joinedCount,
      },
    },
  });
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";

  const errors: Record<string, string> = {};
  if (!name || name.length < 2) {
    errors.name = "Display name must be at least 2 characters long.";
  } else if (name.length > 80) {
    errors.name = "Display name cannot exceed 80 characters.";
  }

  if (image && !isValidHttpUrl(image)) {
    errors.image = "Photo URL must start with http:// or https://.";
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({
      success: false,
      message: Object.values(errors)[0] || "Invalid profile input.",
      errors,
    });
    return;
  }

  const usersCol = db.collection("user");
  const eventsCol = getEventsCollection();
  const joinedCol = getJoinedEventsCollection();

  await Promise.all([
    usersCol.updateOne(
      { email: user.email },
      { $set: { name, image: image || null, updatedAt: new Date() } }
    ),
    eventsCol.updateMany(
      { creatorEmail: user.email },
      { $set: { creatorName: name, creatorPhoto: image } }
    ),
    joinedCol.updateMany(
      { userEmail: user.email },
      { $set: { userName: name, userPhoto: image } }
    ),
  ]);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    profile: {
      id: user.id,
      email: user.email,
      name,
      image,
    },
  });
}
