# Rent & Flatmate Finder

A platform where owners list rooms and tenants create profiles to find either a room to rent or a flatmate to share with — ranked by an AI compatibility engine, with real-time chat and email notifications.

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Maps | Leaflet + OpenStreetMap |
| Backend | NestJS |
| Auth | Custom JWT + Passport + bcrypt (roles: TENANT / OWNER / ADMIN) |
| ORM / DB | Prisma + PostgreSQL (Supabase/Neon) |
| AI | Gemini 2.5 Flash |
| Queue | Upstash Redis + BullMQ |
| Chat | Socket.IO |
| File storage | Supabase Storage (or Cloudinary) |
| Email | Resend / Brevo |
| Deploy | Vercel (frontend) + Render (backend) |

## Setup

### Prerequisites
- Node.js 20+
- A PostgreSQL instance (Supabase or Neon free tier)
- API keys: Gemini, Resend/Brevo, Upstash Redis, Supabase (see `.env.example`)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in values
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App runs at `http://localhost:3000`, API at `http://localhost:4000/api/v1`.

## Documentation
- [`docs/ERD.md`](docs/ERD.md) — database schema + entity relationships
- [`docs/API-SPEC.md`](docs/API-SPEC.md) — full endpoint reference
- [`docs/ROUTES.md`](docs/ROUTES.md) — frontend page map
- [`docs/LLM-PROMPTS.md`](docs/LLM-PROMPTS.md) — compatibility scoring prompts + fallback logic + example I/O
- [`docs/SYSTEM-DESIGN.md`](docs/SYSTEM-DESIGN.md) — 800-word design write-up
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — UI tokens and component conventions
- [`docs/PHASES.md`](docs/PHASES.md) — build plan

## Known limitations (free-tier trade-offs)
- Backend on Render free tier spins down after 15 min idle — first request after inactivity takes ~30-50s.
- Database (Supabase/Neon free tier) pauses after a period of inactivity — auto-resumes on next query.
- Gemini free tier is rate-limited; the BullMQ retry + rule-based fallback handles this gracefully, so scoring never hard-fails.

## Live Demo
- Frontend: _add Vercel URL_
- Backend: _add Render URL_

## Demo Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.com | _seed value_ |
| Owner | owner@demo.com | _seed value_ |
| Tenant | tenant@demo.com | _seed value_ |
