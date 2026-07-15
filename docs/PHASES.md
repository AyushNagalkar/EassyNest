# Build Phases — Weekend Sprint

## Phase 0 — Setup (1-2 hrs)
- [ ] Init NestJS backend, Next.js frontend as separate repos or monorepo folders
- [ ] Supabase/Neon project + Prisma connected, run first migration
- [ ] `.env` filled for both apps (see `.env.example`)
- [ ] Upstash Redis instance created, BullMQ connects
- [ ] Gemini API key, Resend/Brevo API key obtained
- [ ] `DESIGN-SYSTEM.md` decided before touching UI

## Phase 1 — Auth + Data Layer (3-4 hrs)
- [ ] Prisma schema migrated (`schema.prisma`)
- [ ] JWT + Passport strategy, bcrypt hashing, role guards
- [ ] Register/login working end-to-end via Postman
- [ ] Seed script: 1 admin, 2 owners, 3 tenants, 5 properties, 3 seeker posts

## Phase 2 — Core CRUD (3-4 hrs)
- [ ] Property CRUD + photo upload (Supabase Storage/Cloudinary)
- [ ] SeekerProfile CRUD
- [ ] Browse/filter endpoints (city, budget, room type, lat/lng radius)
- [ ] Frontend: `/properties`, `/flatmates` list views with map (Leaflet)

## Phase 3 — Compatibility Engine (2-3 hrs)
- [ ] LLM prompt finalized, Gemini call wrapped in service
- [ ] BullMQ job: score request → LLM call w/ timeout+retry → rule-based fallback on failure
- [ ] Score persisted, unique per (seeker, target) — never recomputed
- [ ] `CompatibilityBadge` on listing cards, sort-by-score on browse pages

## Phase 4 — Interests + Notifications (2-3 hrs)
- [ ] Interest create/accept/decline endpoints
- [ ] Email trigger: owner notified if score > 80 on interest created
- [ ] Email trigger: tenant notified on accept/decline
- [ ] In-app Notification rows created alongside emails

## Phase 5 — Real-Time Chat (2-3 hrs)
- [ ] NestJS WebSocket gateway, room-per-ChatRoom
- [ ] ChatRoom auto-created on interest accept
- [ ] Message persistence + REST history endpoint
- [ ] Frontend chat window with socket.io-client

## Phase 6 — Admin + Polish (2 hrs)
- [ ] Admin dashboard: users, listings, activity log
- [ ] Mark-filled hides listing from search
- [ ] Empty states, loading states, error boundaries
- [ ] Mobile responsiveness pass

## Phase 7 — Ship (1-2 hrs)
- [ ] Deploy backend (Render) + frontend (Vercel)
- [ ] Smoke test full flow: register → list/seek → score → interest → accept → chat → email
- [ ] README finalized, `.env.example` verified against actual vars used
- [ ] `SYSTEM-DESIGN.md` written (800 words max)
- [ ] Zip source, submit
