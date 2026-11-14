# CivicRoots — Social Development Events Platform

**Live Site URL:** [https://ph-assignment-08-five.vercel.app/](https://ph-assignment-08-five.vercel.app/)

CivicRoots is a community-driven social development events platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **BetterAuth**, **Express.js**, and **MongoDB** where neighbors can organize, discover, join, and track local social service initiatives.

## Key Features

- **BetterAuth Authentication & JWT API Security**: Supports email/password registration (with strict uppercase, lowercase, and 6+ character validation), Google OAuth login, persistent sessions across page reloads on private routes, and cryptographic JWT verification via BetterAuth's JWKS + `jose`.
- **Dynamic Home Showcase & Upcoming Feed**: Displays a themed hero banner, platform capabilities, the 6 soonest upcoming events fetched dynamically via MongoDB `.limit(6)`, a static community service gallery, and a weekly digest newsletter section.
- **Create Event with Future-Date Enforcement**: Authenticated organizers can publish cleanups, tree plantations, winter clothing drives, food shares, education camps, and healthcare events with `react-datepicker` validation that blocks past dates on both client and server.
- **Public Event Details & Authenticated Joining**: Anyone can browse upcoming events (past dates automatically excluded) and view full event details publicly, while logged-in volunteers can join or leave events with duplicate-join protection.
- **Creator-Only Event Management & Date-Sorted Joined Events**: Organizers can edit or delete only their own created events from the Manage Events dashboard, and volunteers can track all joined drives sorted chronologically on Joined Events.
- **Full Light/Dark Theme, Search & Filters, Skeletons & Profile Editing**: Includes a system-wide Light/Dark theme toggle, real-time keyword search and category filtering, loading skeletons throughout the app, and a Profile page to update display name and profile picture.

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
```

## Local Development

```bash
npm install
npm run dev
```

## Production Build Verification

```bash
npm run typecheck
npm run lint
npm run build
```

