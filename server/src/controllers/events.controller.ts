import { Request, Response } from "express";
import { Filter, ObjectId } from "mongodb";
import {
  db,
  EventCategory,
  EventDocument,
  getEventsCollection,
  getJoinedEventsCollection,
} from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  ALLOWED_EVENT_TYPES,
  isValidObjectId,
  validateEventInput,
} from "../validators/event.validator.js";

export interface SerializedEvent {
  _id: string;
  title: string;
  description: string;
  eventType: EventCategory;
  thumbnail: string;
  location: string;
  eventDate: string;
  creatorEmail: string;
  creatorName: string;
  creatorPhoto: string;
  joinedCount: number;
  hasJoined?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function serializeEvent(
  doc: EventDocument,
  joinedCount = 0,
  hasJoined?: boolean
): SerializedEvent {
  return {
    _id: doc._id?.toString() || "",
    title: doc.title,
    description: doc.description,
    eventType: doc.eventType,
    thumbnail: doc.thumbnail,
    location: doc.location,
    eventDate: doc.eventDate.toISOString(),
    creatorEmail: doc.creatorEmail,
    creatorName: doc.creatorName,
    creatorPhoto: doc.creatorPhoto,
    joinedCount,
    ...(typeof hasJoined === "boolean" ? { hasJoined } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function attachJoinedCounts(
  events: EventDocument[]
): Promise<SerializedEvent[]> {
  if (events.length === 0) return [];

  const eventIds = events
    .map((event) => event._id)
    .filter((id): id is ObjectId => Boolean(id));

  const joinedCol = getJoinedEventsCollection();
  const countsAgg = await joinedCol
    .aggregate<{ _id: ObjectId; count: number }>([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ])
    .toArray();

  const countMap = new Map<string, number>();
  for (const row of countsAgg) {
    countMap.set(row._id.toString(), row.count);
  }

  return events.map((doc) =>
    serializeEvent(doc, countMap.get(doc._id?.toString() || "") || 0)
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getRecentUpcomingEvents(
  _req: Request,
  res: Response
): Promise<void> {
  const eventsCol = getEventsCollection();
  const now = new Date();

  const docs = await eventsCol
    .find({ eventDate: { $gt: now } })
    .sort({ eventDate: 1 })
    .limit(6)
    .toArray();

  const events = await attachJoinedCounts(docs);

  res.status(200).json({
    success: true,
    events,
  });
}

export async function getUpcomingEvents(
  req: Request,
  res: Response
): Promise<void> {
  const eventsCol = getEventsCollection();
  const now = new Date();

  const query: Filter<EventDocument> = {
    eventDate: { $gt: now },
  };

  const rawType = typeof req.query.type === "string" ? req.query.type.trim() : "";
  if (
    rawType &&
    rawType !== "All" &&
    ALLOWED_EVENT_TYPES.includes(rawType as EventCategory)
  ) {
    query.eventType = rawType as EventCategory;
  }

  const rawSearch =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (rawSearch) {
    const safePattern = new RegExp(escapeRegex(rawSearch), "i");
    query.$or = [
      { title: safePattern },
      { location: safePattern },
      { description: safePattern },
    ];
  }

  const docs = await eventsCol.find(query).sort({ eventDate: 1 }).toArray();
  const events = await attachJoinedCounts(docs);

  res.status(200).json({
    success: true,
    count: events.length,
    events,
  });
}

export async function getEventById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const id = String(req.params.id || "");
  if (!isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid event ID format.",
    });
    return;
  }

  const objectId = new ObjectId(id);
  const eventsCol = getEventsCollection();
  const doc = await eventsCol.findOne({ _id: objectId });

  if (!doc) {
    res.status(404).json({
      success: false,
      message: "Event not found.",
    });
    return;
  }

  const joinedCol = getJoinedEventsCollection();
  const [joinedCount, existingJoin] = await Promise.all([
    joinedCol.countDocuments({ eventId: objectId }),
    req.user?.email
      ? joinedCol.findOne({ eventId: objectId, userEmail: req.user.email })
      : Promise.resolve(null),
  ]);

  res.status(200).json({
    success: true,
    event: serializeEvent(doc, joinedCount, Boolean(existingJoin)),
  });
}

async function resolveOwnedEvent(
  id: string,
  userEmail: string,
  res: Response
): Promise<EventDocument | null> {
  if (!isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid event ID format.",
    });
    return null;
  }

  const eventsCol = getEventsCollection();
  const existing = await eventsCol.findOne({ _id: new ObjectId(id) });

  if (!existing) {
    res.status(404).json({
      success: false,
      message: "Event not found.",
    });
    return null;
  }

  if (existing.creatorEmail !== userEmail) {
    res.status(403).json({
      success: false,
      message: "Forbidden: You can only manage events that you created.",
    });
    return null;
  }

  return existing;
}

export async function getMyEvents(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const eventsCol = getEventsCollection();
  const docs = await eventsCol
    .find({ creatorEmail: userEmail })
    .sort({ eventDate: 1 })
    .toArray();

  const events = await attachJoinedCounts(docs);

  res.status(200).json({
    success: true,
    count: events.length,
    events,
  });
}

export async function createEvent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const validation = validateEventInput(
    (req.body || {}) as Record<string, unknown>
  );
  if (!validation.valid || !validation.data) {
    res.status(400).json({
      success: false,
      message: Object.values(validation.errors)[0] || "Invalid event input.",
      errors: validation.errors,
    });
    return;
  }

  const userDoc = await db
    .collection<{ email: string; name?: string; image?: string }>("user")
    .findOne({ email: user.email });

  const now = new Date();
  const newEvent: EventDocument = {
    ...validation.data,
    creatorEmail: user.email,
    creatorName: userDoc?.name || user.name || "Community Organizer",
    creatorPhoto: userDoc?.image || user.image || "",
    createdAt: now,
    updatedAt: now,
  };

  const eventsCol = getEventsCollection();
  const result = await eventsCol.insertOne(newEvent);
  const createdDoc: EventDocument = { ...newEvent, _id: result.insertedId };

  res.status(201).json({
    success: true,
    message: "Event created successfully.",
    event: serializeEvent(createdDoc, 0, false),
  });
}

export async function updateEvent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const id = String(req.params.id || "");
  const existing = await resolveOwnedEvent(id, userEmail, res);
  if (!existing) return;

  const validation = validateEventInput(
    (req.body || {}) as Record<string, unknown>
  );
  if (!validation.valid || !validation.data) {
    res.status(400).json({
      success: false,
      message: Object.values(validation.errors)[0] || "Invalid event input.",
      errors: validation.errors,
    });
    return;
  }

  const now = new Date();
  const objectId = new ObjectId(id);
  const eventsCol = getEventsCollection();
  const joinedCol = getJoinedEventsCollection();

  await Promise.all([
    eventsCol.updateOne(
      { _id: objectId },
      {
        $set: {
          ...validation.data,
          updatedAt: now,
        },
      }
    ),
    joinedCol.updateMany(
      { eventId: objectId },
      {
        $set: {
          eventTitle: validation.data.title,
          eventThumbnail: validation.data.thumbnail,
          eventLocation: validation.data.location,
          eventType: validation.data.eventType,
          eventDate: validation.data.eventDate,
        },
      }
    ),
  ]);

  const [updatedDoc, joinedCount] = await Promise.all([
    eventsCol.findOne({ _id: objectId }),
    joinedCol.countDocuments({ eventId: objectId }),
  ]);

  if (!updatedDoc) {
    res.status(404).json({ success: false, message: "Event not found." });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Event updated successfully.",
    event: serializeEvent(updatedDoc, joinedCount),
  });
}

export async function deleteEvent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ success: false, message: "Unauthorized." });
    return;
  }

  const id = String(req.params.id || "");
  const existing = await resolveOwnedEvent(id, userEmail, res);
  if (!existing) return;

  const objectId = new ObjectId(id);
  const eventsCol = getEventsCollection();
  const joinedCol = getJoinedEventsCollection();

  await Promise.all([
    eventsCol.deleteOne({ _id: objectId }),
    joinedCol.deleteMany({ eventId: objectId }),
  ]);

  res.status(200).json({
    success: true,
    message: "Event deleted successfully.",
  });
}
