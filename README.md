# 🚀 FixNear

> Connecting users to nearby skilled artisans — fast, reliable, and location-based.

---

## 📂 Project Overview

**FixNear** is a **TypeScript full-stack monorepo** that connects users to verified local artisans (mechanics, carpenters, electricians, tailors, etc.) based on location and availability.

This repository contains:
                            fixnear/
                            ├── backend/ # Node.js + Express API (TypeScript, MongoDB)
                            ├── admin-web/ # Admin dashboard (React + shadcn/ui + Tailwind + Vite + TypeScript)
                            ├── client-web/ # User-facing web app (React + shadcn/ui + Tailwind + Vite + TypeScript)
                            ├── mobile-ios/ # iOS apps (SwiftUI) — planned
                            └── README.md


---

## 🛠 Tech stack (high level)

- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, bcrypt  
- **Admin & Client Web:** React, shadcn/ui, Tailwind, Vite, TypeScript, Axios  
- **Mobile (future):** SwiftUI (iOS)

---

## ⚙️ Local setup (developer)

> Each service has its own dependencies and `package.json`. Install per-service.

### 1. Clone repo
```bash
git clone https://github.com/Kobi-Okiti/fixnear.git
cd fixnear

2. Create .env files (per service)

Example for the backend:
backend/.env

PORT=5000
MONGO_URI=mongodb://localhost:27017/fixnear
JWT_SECRET=replace_with_a_strong_secret

Frontend .env example (admin-web and client-web):
VITE_API_URL=http://localhost:5000/api

3. Install dependencies & run
Backend:
cd backend
npm install
npm run dev

Admin Web:
cd ../admin-web
npm install
npm run dev

Client Web:
cd ../client-web
npm install
npm run dev


🧭 Project roadmap
Phase 1 — Backend (TypeScript)
    Auth (User + Artisan)
    Artisan search by location & trade
    Emergency nearest artisan endpoint
    Reviews & ratings
    Admin routes

Phase 2 — Admin Web
    Manage artisans & users
    Approve/suspend artisans
    Reports & analytics

Phase 3 — Client Web
    Registration & login
    Map & list view of artisans
    Emergency button
    Reviews flow

Phase 4 — iOS App (SwiftUI)
    Authentication (signup/login + secure token storage)
    Nearby artisan search (map & list view)
    Emergency button (nearest artisans)
    Artisan profile & reviews
    Availability toggle for artisans
    Push notifications & location updates

🧰 Developer notes
    Each subfolder is a separate TypeScript project with its own node_modules/.
    Run npm install separately in each service folder.
    The .gitignore in the root ignores all node_modules and build outputs.