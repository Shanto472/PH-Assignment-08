import { Response } from "express";
import { ObjectId } from "mongodb";
import {
  db,
  getEventsCollection,
  getJoinedEventsCollection,
  JoinedEventDocument,
} from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { isValidObjectId } from "../validators/event.validator.js";

function serializeJoinedEvent(doc: JoinedEventDocument) {
  return {
    _id: doc._id?.toString() || "",
    eventId: doc.eventId.toString(),
    eventTitle: doc.eventTitle,
    eventThumbnail: doc.eventThumbnail,
    eventLocation: doc.eventLocation,
    eventType: doc.eventType,
    eventDate: doc.eventDate.toISOString(),
    userId: doc.userId,
    userEmail: doc.userEmail,
    userName: doc.userName,
    userPhoto: doc.userPhoto,
    joinedAt: doc.joinedAt.toISOString(),
  };
}

export async function joinEvent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const eventId = String(req.params.eventId || "");
  if (!isValidObjectId(eventId)) {
    res.status(400).json({
      success: false,
      message: "Invalid event ID format.",
    });
    return;
  }

  const objectId = new ObjectId(eventId);
  const eventsCol = getEventsCollection();
  const joinedCol = getJoinedEventsCollection();

  const eventDoc = await eventsCol.findOne({ _id: objectId });
  if (!eventDoc) {
    res.status(404).json({
      success: false,
      message: "Event not found.",
    });
    return;
  }

  if (eventDoc.eventDate.getTime() <= Date.now()) {
    res.status(400).json({
      success: false,
      message: "This event has already passed and can no longer be joined.",
    });
    return;
  }

  const existing = await joinedCol.findOne({
    eventId: objectId,
    userEmail: user.email,
  });

  if (existing) {
    res.status(409).json({
      success: false,
      message: "You have already joined this event.",
    });
    return;
  }

  const userDoc = await db
    .collection<{ email: string; name?: string; image?: string }>("user")
    .findOne({ email: user.email });

  const joinRecord: JoinedEventDocument = {
    eventId: objectId,
    eventTitle: eventDoc.title,
    eventThumbnail: eventDoc.thumbnail,
    eventLocation: eventDoc.location,
    eventType: eventDoc.eventType,
    eventDate: eventDoc.eventDate,
    userId: user.id,
    userEmail: user.email,
    userName: userDoc?.name || user.name || "Community Volunteer",
    userPhoto: userDoc?.image || user.image || "",
    joinedAt: new Date(),
  };

  const result = await joinedCol.insertOne(joinRecord);
  const joinedCount = await joinedCol.countDocuments({ eventId: objectId });

  res.status(201).json({
    success: true,
    message: "Successfully joined the event!",
    joinedCount,
    joinedEvent: serializeJoinedEvent({
      ...joinRecord,
      _id: result.insertedId,
    }),
  });
}

export async function getMyJoinedEvents(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const joinedCol = getJoinedEventsCollection();
  const docs = await joinedCol
    .find({ userEmail })
    .sort({ eventDate: 1 })
    .toArray();

  res.status(200).json({
    success: true,
    count: docs.length,
    joinedEvents: docs.map(serializeJoinedEvent),
  });
}

export async function leaveEvent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const eventId = String(req.params.eventId || "");
  if (!isValidObjectId(eventId)) {
    res.status(400).json({
      success: false,
      message: "Invalid event ID format.",
    });
    return;
  }

  const objectId = new ObjectId(eventId);
  const joinedCol = getJoinedEventsCollection();
  const deleteResult = await joinedCol.deleteOne({
    eventId: objectId,
    userEmail,
  });

  if (deleteResult.deletedCount === 0) {
    res.status(404).json({
      success: false,
      message: "You have not joined this event.",
    });
    return;
  }

  const joinedCount = await joinedCol.countDocuments({ eventId: objectId });

  res.status(200).json({
    success: true,
    message: "You have left the event.",
    joinedCount,
  });
}
