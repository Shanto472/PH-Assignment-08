# CivicRoots Server

Backend API server for **CivicRoots**, a community-driven Social Development Events Platform built with Express.js 5, TypeScript, MongoDB, BetterAuth, and `jose` JWT validation.

## Features

- **Authentication & Authorization**: Powered by BetterAuth (`mongodbAdapter`, `bearer`, and `jwt` plugins) supporting email/password and Google OAuth without forced email verification.
- **Cryptographic JWT Validation**: Protected API endpoints verify `Authorization: Bearer <token>` tokens against BetterAuth's JWKS using `jose` (`jwtVerify`).
- **Upcoming Events Filtering**: Queries enforce `eventDate > now` so expired events never appear on public upcoming event feeds, plus `.limit(6)` for recent upcoming events on the home page.
- **Future Date & Input Validation**: Strict server-side validation for creating and updating events, including rejecting past dates.
- **Creator Ownership Enforcement**: Update and delete operations validate that the verified JWT user's email matches `creatorEmail`.
- **Event Participation Tracking**: Unique compound indexing prevents duplicate joins, stores join records with event & user data, and sorts joined events by `eventDate`.

## Tech Stack

- Express.js 5 + TypeScript
- MongoDB Native Driver
- BetterAuth (`better-auth/adapters/mongodb`, `better-auth/plugins` `jwt` & `bearer`)
- `jose` for JWKS/JWT cryptographic verification

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=civicroots
BETTER_AUTH_SECRET=your_secure_32_plus_char_secret
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=optional_google_client_id
GOOGLE_CLIENT_SECRET=optional_google_client_secret
```

## Scripts

- `npm run dev` — Start development server with `tsx watch`
- `npm run build` — Compile TypeScript to `dist/`
- `npm run start` — Start compiled server
- `npm run seed` — Seed initial upcoming community service events
- `npm run typecheck` — Run TypeScript type check
