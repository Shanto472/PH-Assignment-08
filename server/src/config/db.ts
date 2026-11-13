import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { env } from "./env.js";

export type EventCategory =
  | "Cleanup"
  | "Plantation"
  | "Donation"
  | "Education"
  | "Healthcare"
  | "Food Drive";

export interface EventDocument {
  _id?: ObjectId;
  title: string;
  description: string;
  eventType: EventCategory;
  thumbnail: string;
  location: string;
  eventDate: Date;
  creatorEmail: string;
  creatorName: string;
  creatorPhoto: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JoinedEventDocument {
  _id?: ObjectId;
  eventId: ObjectId;
  eventTitle: string;
  eventThumbnail: string;
  eventLocation: string;
  eventType: EventCategory;
  eventDate: Date;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto: string;
  joinedAt: Date;
}

export const mongoClient = new MongoClient(env.mongodbUri);
export const db: Db = mongoClient.db(env.mongodbDbName);

let connected = false;
let connectPromise: Promise<void> | null = null;

export async function connectDB(): Promise<Db> {
  if (connected) return db;
  if (!connectPromise) {
    connectPromise = (async () => {
      await mongoClient.connect();
      await ensureIndexes();
      connected = true;
    })().catch((err) => {
      connectPromise = null;
      throw err;
    });
  }
  await connectPromise;
  return db;
}

async function ensureIndexes(): Promise<void> {
  const eventsCol = getEventsCollection();
  const joinedCol = getJoinedEventsCollection();

  await Promise.all([
    eventsCol.createIndex({ eventDate: 1 }),
    eventsCol.createIndex({ creatorEmail: 1, eventDate: 1 }),
    eventsCol.createIndex({ eventType: 1, eventDate: 1 }),
    joinedCol.createIndex({ eventId: 1, userEmail: 1 }, { unique: true }),
    joinedCol.createIndex({ userEmail: 1, eventDate: 1 }),
  ]);
}

export function getEventsCollection(): Collection<EventDocument> {
  return db.collection<EventDocument>("events");
}

export function getJoinedEventsCollection(): Collection<JoinedEventDocument> {
  return db.collection<JoinedEventDocument>("joinedEvents");
}

export async function closeDB(): Promise<void> {
  if (connected) {
    await mongoClient.close();
    connected = false;
    connectPromise = null;
  }
}

