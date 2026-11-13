import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const { MongoMemoryServer } = require(
  path.join(__dirname, "server/node_modules/mongodb-memory-server")
);
const { MongoClient } = require(
  path.join(__dirname, "server/node_modules/mongodb")
);

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  return date;
}

const seedEvents = [
  {
    title: "Winter Clothes Distribution – Mirpur 10, Dhaka",
    description:
      "Join our neighborhood volunteers at Mirpur 10 Circle to sort and distribute warm jackets, sweaters, and woolens to daily wage workers and low-income families ahead of the peak winter cold wave.",
    eventType: "Donation",
    thumbnail:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    location: "Mirpur 10, Dhaka",
    eventDate: daysFromNow(5),
    creatorEmail: "coordinator@civicroots.org",
    creatorName: "Nusrat Jahan",
    creatorPhoto:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Blanket Distribution for the Needy – Mohammadpur, Dhaka",
    description:
      "An evening outreach initiative across Mohammadpur Bus Stand and Town Hall where community teams distribute 300 thermal blankets and hot tea packs to unhoused neighbors and elderly citizens.",
    eventType: "Donation",
    thumbnail:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    location: "Mohammadpur, Dhaka",
    eventDate: daysFromNow(9),
    creatorEmail: "coordinator@civicroots.org",
    creatorName: "Nusrat Jahan",
    creatorPhoto:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Dhanmondi Lake Shoreline Cleanup Drive",
    description:
      "Bring reusable gloves and help restore the walkways and lakeside embankments of Dhanmondi Lake. Recycled waste bins, biodegradable bags, and hydration stations will be provided on site.",
    eventType: "Cleanup",
    thumbnail:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80",
    location: "Dhanmondi 8/A, Dhaka",
    eventDate: daysFromNow(12),
    creatorEmail: "greenwatch@civicroots.org",
    creatorName: "Tanvir Rahman",
    creatorPhoto:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Urban Tree Plantation & Green Corridor – Uttara",
    description:
      "Help plant 500 native shade and fruit saplings along Sector 11 avenue and local schoolyards. Horticulture volunteers will demonstrate soil prep and long-term sapling care.",
    eventType: "Plantation",
    thumbnail:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    location: "Sector 11, Uttara, Dhaka",
    eventDate: daysFromNow(16),
    creatorEmail: "greenwatch@civicroots.org",
    creatorName: "Tanvir Rahman",
    creatorPhoto:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Neighborhood Food Share & Nutrition Camp – Banani",
    description:
      "Volunteers will prepare and pack 400 balanced meal boxes alongside basic pediatric nutrition guidance for families in the Korail community corridor.",
    eventType: "Food Drive",
    thumbnail:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1200&q=80",
    location: "Banani Road 11, Dhaka",
    eventDate: daysFromNow(20),
    creatorEmail: "care@civicroots.org",
    creatorName: "Farhana Karim",
    creatorPhoto:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Weekend Literacy & Book Kit Drive – Old Dhaka",
    description:
      "Support primary school learners in Lalbagh with illustrated storybooks, notebooks, and interactive reading workshops led by university volunteer mentors.",
    eventType: "Education",
    thumbnail:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    location: "Lalbagh, Old Dhaka",
    eventDate: daysFromNow(25),
    creatorEmail: "care@civicroots.org",
    creatorName: "Farhana Karim",
    creatorPhoto:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Free Eye Screening & Health Checkup – Savar",
    description:
      "Partnering with volunteer physicians and optometrists to provide complimentary vision screening, reading glasses, and blood pressure checks for senior residents in Savar.",
    eventType: "Healthcare",
    thumbnail:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    location: "Savar Bazar, Dhaka",
    eventDate: daysFromNow(30),
    creatorEmail: "care@civicroots.org",
    creatorName: "Farhana Karim",
    creatorPhoto:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function killTree(proc) {
  if (!proc?.pid) return;
  try {
    execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: "ignore" });
  } catch {}
}

async function main() {
  console.log("Starting in-memory MongoDB instance...");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  console.log("Seeding initial community events...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("civicroots");
  await db.collection("events").insertMany(seedEvents);
  await client.close();

  console.log("Starting CivicRoots Express API on port 5000...");
  const serverProc = spawn("node", ["dist/index.js"], {
    cwd: path.join(__dirname, "server"),
    env: {
      ...process.env,
      PORT: "5000",
      MONGODB_URI: uri,
      MONGODB_DB_NAME: "civicroots",
      MONGODB_TRANSACTIONS: "false",
      BETTER_AUTH_SECRET: "civicroots-local-demo-secret-at-least-32-chars",
      BETTER_AUTH_URL: "http://localhost:3000",
      FRONTEND_URL: "http://localhost:3000",
    },
    stdio: "inherit",
  });

  console.log("Starting CivicRoots Next.js Frontend on port 3000...");
  const nextProc = spawn(
    "node",
    ["node_modules/next/dist/bin/next", "start", "-p", "3000"],
    {
      cwd: path.join(__dirname, "client"),
      env: {
        ...process.env,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_API_URL: "http://localhost:5000",
        BACKEND_URL: "http://localhost:5000",
      },
      stdio: "inherit",
    }
  );

  console.log("\n==============================================");
  console.log(">> CivicRoots Platform is LIVE!");
  console.log(">> Frontend: http://localhost:3000");
  console.log(">> API:      http://localhost:5000");
  console.log("==============================================\n");

  const cleanup = async () => {
    console.log("\nShutting down CivicRoots...");
    killTree(serverProc);
    killTree(nextProc);
    await mongod.stop();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

main().catch((err) => {
  console.error("Failed to start CivicRoots:", err);
  process.exit(1);
});

