# CivicRoots — Social Development Events Platform

> **Live Client URL:** [https://ph-assignment-08-five.vercel.app/](https://ph-assignment-08-five.vercel.app/)  
> **GitHub Repository:** `https://github.com/Shanto472/PH-Assignment-08`

CivicRoots is a community-driven social development event management platform where citizens can create, discover, join, and track social service initiatives across their local neighborhoods—such as winter clothes distributions, blanket outreach, urban tree plantations, and canal cleanups.

---

## 🌟 Key Features

1. **Authentication with BetterAuth & Cryptographic JWT**: Supports email/password registration with strict password criteria (uppercase, lowercase, and 6+ characters) and Google login without disruptive email verification. Client requests attach signed JWT tokens validated cryptographically on the Express backend via BetterAuth's JWKS and `jose`.
2. **Reload-Resilient Single Page Experience**: Navigating and reloading private/protected routes (`/create-event`, `/manage-events`, `/joined-events`, `/profile`) never redirects authenticated users back to login, displaying sleek loading skeletons while sessions rehydrate.
3. **Dynamic Home Feed with MongoDB `.limit(6)`**: The home page dynamically features the 6 soonest upcoming community service drives using MongoDB's `.limit()` operator, paired with an impactful hero banner, feature breakdown, community photo gallery, and weekly newsletter section.
4. **Create Event with Strict Future-Date Validation**: Organizers can schedule community drives with title, category dropdown, location, description, and thumbnail preview. Form validation strictly blocks past dates on both client datepicker and server API.
5. **Public Event Discovery & Authenticated Joining**: Anyone can browse upcoming events (past events are automatically excluded) with keyword search and category filtering. Logged-in volunteers can join events with duplicate-join protection, and manage their participation on a chronologically sorted Joined Events dashboard.
6. **Creator-Only Event Management & Profile Customization**: Users can edit or delete only their own hosted events on the Manage Events dashboard, and view their volunteer impact stats or update their display name and profile picture on the Profile page.
7. **Comprehensive Light & Dark Theme Customization**: Features an accessible theme toggle button that switches the entire application between warm ivory and deep forest dark modes seamlessly.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI Primitives, Lucide Icons, React DatePicker, Sonner, SweetAlert2.
- **Backend**: Express.js 5, TypeScript, MongoDB Native Driver, `jose` JWT Verification.
- **Authentication**: BetterAuth (`@better-auth/mongo-adapter`, `jwt`, `bearer` plugins).

---

## 🚀 Quick Start (1-Click Local Run)

Double click `start.bat` in the project root, or execute:

```powershell
node run-all.mjs
```

This boots the in-memory MongoDB database pre-seeded with 7 Dhaka community events, launches the Express backend on `http://localhost:5000`, and starts the Next.js frontend on `http://localhost:3000`.

### Manual Development Setup

1. **Backend Server**:
   ```powershell
   cd server
   npm install
   npm run dev
   ```
2. **Frontend Client**:
   ```powershell
   cd client
   npm install
   npm run dev
   ```

---

## 📜 Assignment Checklist & Verification

- [x] **Zero Lorem Ipsum text** used anywhere in the codebase
- [x] **No native browser `alert()` or `confirm()`** used (powered by themed Sonner toasts & SweetAlert2)
- [x] **Protected Routes session preservation** across page reloads
- [x] **Upcoming events only** shown on discovery feeds (past events filtered out)
- [x] **Full Light / Dark mode toggle**
- [x] **Strict password validation** (1 uppercase, 1 lowercase, 6+ characters)
- [x] **X logo used in footer** instead of legacy Twitter bird
