# Frontend Routes (Next.js App Router)

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing — split CTA: "Find a Room" / "Find a Flatmate" / "List Your Property" |
| `/login`, `/register` | Public | Auth, role picker on register |
| `/properties` | Public | Browse rooms — map + list split view, filters (city, budget, room type), sorted by compatibility score if logged in as tenant |
| `/properties/[id]` | Public | Listing detail, photo gallery, map pin, "Express Interest" button (TENANT only) |
| `/flatmates` | Public | Browse flatmate-seeker posts — same map + list pattern |
| `/flatmates/[id]` | Public | Seeker post detail, "Express Interest" button |
| `/dashboard/tenant` | TENANT | My seeker profile, sent interests, saved favorites, active chats |
| `/dashboard/tenant/profile` | TENANT | Create/edit seeker profile (budget, location, move-in, type) |
| `/dashboard/owner` | OWNER | My listings grid, status toggle (Active/Filled), received interests |
| `/dashboard/owner/properties/new` | OWNER | Create listing form — location picker on Leaflet map, photo upload |
| `/dashboard/owner/properties/[id]/edit` | OWNER | Edit listing |
| `/interests` | TENANT / OWNER | Unified inbox — sent + received, accept/decline actions |
| `/chat/[interestId]` | Participant only | Real-time chat, guarded — 404s if interest isn't ACCEPTED or user isn't a participant |
| `/notifications` | Any authenticated | In-app notification feed |
| `/admin` | ADMIN | Platform stats: users, active listings, interests, flagged activity |
| `/admin/users` | ADMIN | User management table, deactivate |
| `/admin/properties` | ADMIN | Listing moderation table |

## Shared components worth building once
- `MapView` (Leaflet wrapper) — used on `/properties`, `/flatmates`, and both listing-detail pages
- `CompatibilityBadge` — score + explanation tooltip, color-coded (green >80, amber 50-80, gray <50)
- `ListingCard` — used for both Property and SeekerProfile results (same shape, different fields)
- `ChatWindow` — socket connection + message list + input, reused nowhere else so keep it self-contained
