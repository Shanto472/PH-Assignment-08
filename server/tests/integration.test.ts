import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { Server } from "node:http";

async function runIntegrationTests() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.MONGODB_URI = uri;
  process.env.MONGODB_DB_NAME = "civicroots_test";
  process.env.MONGODB_TRANSACTIONS = "false";
  process.env.PORT = "5099";
  process.env.BETTER_AUTH_SECRET =
    "test-secret-key-with-at-least-32-characters-long";
  process.env.BETTER_AUTH_URL = "http://localhost:5099";
  process.env.FRONTEND_URL = "http://localhost:3000";

  const { connectDB, closeDB, getEventsCollection } = await import(
    "../src/config/db.js"
  );
  const { default: app } = await import("../src/app.js");

  await connectDB();

  let server: Server | null = null;
  const baseUrl = "http://127.0.0.1:5099";

  await new Promise<void>((resolve) => {
    server = app.listen(5099, "127.0.0.1", () => resolve());
  });

  try {
    console.log("1. Testing health endpoint...");
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = (await healthRes.json()) as { status: string };
    assert.equal(healthJson.status, "ok");

    console.log("2. Testing BetterAuth signup, login, and JWT issuance...");
    const signUpA = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Alice Organizer",
        email: "alice@example.com",
        password: "AlicePassword1",
        image: "https://example.com/alice.jpg",
      }),
    });
    assert.equal(signUpA.status, 200);
    const bearerA = signUpA.headers.get("set-auth-token");
    assert.ok(bearerA, "Expected set-auth-token header on signUp");

    const tokenResA = await fetch(`${baseUrl}/api/auth/token`, {
      headers: {
        Authorization: `Bearer ${bearerA}`,
        Origin: "http://localhost:3000",
      },
    });
    assert.equal(tokenResA.status, 200);
    const tokenJsonA = (await tokenResA.json()) as { token: string };
    const jwtA = tokenJsonA.token;
    assert.ok(jwtA && jwtA.split(".").length === 3, "Expected valid JWT");

    console.log("3. Testing JWT protection rejects missing/invalid tokens...");
    const unauthEvents = await fetch(`${baseUrl}/api/events/my-events`);
    assert.equal(unauthEvents.status, 401);

    const badJwtRes = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: "Bearer invalid.jwt.token" },
    });
    assert.equal(badJwtRes.status, 401);

    console.log("4. Testing Create Event validation & past-date rejection...");
    const pastEventRes = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtA}`,
      },
      body: JSON.stringify({
        title: "Old Past Event",
        description: "This event date is in the past and must be rejected.",
        eventType: "Cleanup",
        thumbnail: "https://example.com/thumb.jpg",
        location: "Mirpur 10, Dhaka",
        eventDate: "2020-01-01T10:00:00.000Z",
      }),
    });
    assert.equal(pastEventRes.status, 400);

    const badUrlRes = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtA}`,
      },
      body: JSON.stringify({
        title: "Invalid Thumbnail Drive",
        description: "Testing validation on invalid thumbnail URLs.",
        eventType: "Donation",
        thumbnail: "not-a-valid-url",
        location: "Mohammadpur, Dhaka",
        eventDate: new Date(Date.now() + 86400_000 * 3).toISOString(),
      }),
    });
    assert.equal(badUrlRes.status, 400);

    // Insert 1 past event directly in DB to verify public feeds exclude past dates
    const eventsCol = getEventsCollection();
    await eventsCol.insertOne({
      title: "Already Completed Past Event",
      description: "This past event must never appear on upcoming pages.",
      eventType: "Cleanup",
      thumbnail: "https://example.com/past.jpg",
      location: "Gulshan, Dhaka",
      eventDate: new Date(Date.now() - 86400_000 * 2),
      creatorEmail: "alice@example.com",
      creatorName: "Alice Organizer",
      creatorPhoto: "https://example.com/alice.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("5. Creating 7 future events via JWT-protected POST /api/events...");
    const createdIds: string[] = [];
    const daysOffsets = [15, 3, 10, 25, 7, 18, 12];
    for (let i = 0; i < daysOffsets.length; i++) {
      const days = daysOffsets[i];
      const isWinter = i === 1;
      const createRes = await fetch(`${baseUrl}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtA}`,
        },
        body: JSON.stringify({
          title: isWinter
            ? "Winter Clothes Distribution – Mirpur 10, Dhaka"
            : `Community Service Drive #${i + 1}`,
          description:
            "Organizing neighborhood volunteers for local social development impact.",
          eventType: isWinter ? "Donation" : "Cleanup",
          thumbnail: "https://example.com/event.jpg",
          location: isWinter ? "Mirpur 10, Dhaka" : "Mohammadpur, Dhaka",
          eventDate: new Date(Date.now() + 86400_000 * days).toISOString(),
        }),
      });
      assert.equal(createRes.status, 201);
      const createdJson = (await createRes.json()) as {
        event: { _id: string; creatorEmail: string };
      };
      assert.equal(createdJson.event.creatorEmail, "alice@example.com");
      createdIds.push(createdJson.event._id);
    }

    console.log("6. Testing /api/events/recent (.limit(6)) & /api/events filters...");
    const recentRes = await fetch(`${baseUrl}/api/events/recent`);
    assert.equal(recentRes.status, 200);
    const recentJson = (await recentRes.json()) as {
      events: Array<{ _id: string; title: string; eventDate: string }>;
    };
    assert.equal(recentJson.events.length, 6, "Recent endpoint must limit to 6");
    assert.equal(
      recentJson.events[0].title,
      "Winter Clothes Distribution – Mirpur 10, Dhaka",
      "Soonest upcoming event (+3 days) should appear first"
    );

    const allUpcomingRes = await fetch(`${baseUrl}/api/events`);
    assert.equal(allUpcomingRes.status, 200);
    const allUpcomingJson = (await allUpcomingRes.json()) as {
      events: Array<{ title: string }>;
    };
    assert.equal(
      allUpcomingJson.events.length,
      7,
      "Past event must be excluded from upcoming events"
    );

    const searchRes = await fetch(
      `${baseUrl}/api/events?type=Donation&search=Mirpur`
    );
    const searchJson = (await searchRes.json()) as {
      events: Array<{ title: string }>;
    };
    assert.equal(searchJson.events.length, 1);

    console.log("7. Testing public Event Details route without auth...");
    const soonestId = createdIds[1]; // +3 days
    const laterId = createdIds[3]; // +25 days
    const detailsRes = await fetch(`${baseUrl}/api/events/${soonestId}`);
    assert.equal(detailsRes.status, 200);

    console.log("8. Testing User B signup, joining events, duplicate block, and date sorting...");
    const signUpB = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Bob Volunteer",
        email: "bob@example.com",
        password: "BobPassword1",
        image: "https://example.com/bob.jpg",
      }),
    });
    assert.equal(signUpB.status, 200);
    const bearerB = signUpB.headers.get("set-auth-token");
    assert.ok(bearerB);

    const tokenResB = await fetch(`${baseUrl}/api/auth/token`, {
      headers: {
        Authorization: `Bearer ${bearerB}`,
        Origin: "http://localhost:3000",
      },
    });
    const jwtB = ((await tokenResB.json()) as { token: string }).token;

    // Join later event first (+25 days), then soonest event (+3 days)
    const joinLater = await fetch(`${baseUrl}/api/joins/${laterId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwtB}` },
    });
    assert.equal(joinLater.status, 201);

    const joinSoonest = await fetch(`${baseUrl}/api/joins/${soonestId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwtB}` },
    });
    assert.equal(joinSoonest.status, 201);

    // Duplicate join must fail with 409
    const duplicateJoin = await fetch(`${baseUrl}/api/joins/${soonestId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwtB}` },
    });
    assert.equal(duplicateJoin.status, 409);

    const myJoinedRes = await fetch(`${baseUrl}/api/joins/my-joined`, {
      headers: { Authorization: `Bearer ${jwtB}` },
    });
    assert.equal(myJoinedRes.status, 200);
    const myJoinedJson = (await myJoinedRes.json()) as {
      joinedEvents: Array<{ eventId: string; eventDate: string }>;
    };
    assert.equal(myJoinedJson.joinedEvents.length, 2);
    assert.equal(
      myJoinedJson.joinedEvents[0].eventId,
      soonestId,
      "Joined events must be sorted ascending by eventDate"
    );

    console.log("9. Testing creator-only update/delete ownership checks...");
    const forbiddenUpdate = await fetch(`${baseUrl}/api/events/${soonestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtB}`,
      },
      body: JSON.stringify({
        title: "Hijacked Title",
        description: "Attempting unauthorized update on another user event.",
        eventType: "Donation",
        thumbnail: "https://example.com/event.jpg",
        location: "Mirpur 10, Dhaka",
        eventDate: new Date(Date.now() + 86400_000 * 5).toISOString(),
      }),
    });
    assert.equal(forbiddenUpdate.status, 403);

    const forbiddenDelete = await fetch(`${baseUrl}/api/events/${soonestId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwtB}` },
    });
    assert.equal(forbiddenDelete.status, 403);

    const ownerUpdate = await fetch(`${baseUrl}/api/events/${soonestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtA}`,
      },
      body: JSON.stringify({
        title: "Updated Winter Clothes Drive – Mirpur 10",
        description: "Updated distribution logistics for volunteers at Mirpur 10.",
        eventType: "Donation",
        thumbnail: "https://example.com/updated.jpg",
        location: "Mirpur 10 Circle, Dhaka",
        eventDate: new Date(Date.now() + 86400_000 * 4).toISOString(),
      }),
    });
    assert.equal(ownerUpdate.status, 200);

    const ownerDelete = await fetch(`${baseUrl}/api/events/${laterId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwtA}` },
    });
    assert.equal(ownerDelete.status, 200);

    // Verify User B's joined list now has 1 item with updated title
    const myJoinedAfter = await fetch(`${baseUrl}/api/joins/my-joined`, {
      headers: { Authorization: `Bearer ${jwtB}` },
    });
    const myJoinedAfterJson = (await myJoinedAfter.json()) as {
      joinedEvents: Array<{ eventTitle: string }>;
    };
    assert.equal(myJoinedAfterJson.joinedEvents.length, 1);
    assert.equal(
      myJoinedAfterJson.joinedEvents[0].eventTitle,
      "Updated Winter Clothes Drive – Mirpur 10"
    );

    console.log("10. Testing Profile view and update endpoints...");
    const profileGet = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${jwtA}` },
    });
    assert.equal(profileGet.status, 200);

    const profilePatch = await fetch(`${baseUrl}/api/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtA}`,
      },
      body: JSON.stringify({
        name: "Alice Rahman",
        image: "https://example.com/alice-new.jpg",
      }),
    });
    assert.equal(profilePatch.status, 200);
    const profilePatchJson = (await profilePatch.json()) as {
      profile: { name: string };
    };
    assert.equal(profilePatchJson.profile.name, "Alice Rahman");

    console.log("ALL INTEGRATION TESTS PASSED!");
  } finally {
    await new Promise<void>((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
    await closeDB();
    await mongod.stop();
  }
}

runIntegrationTests().catch((err) => {
  console.error("Integration tests failed:", err);
  process.exit(1);
});

