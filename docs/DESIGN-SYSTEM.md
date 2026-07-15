# Design System

## Principles
- Two audiences on one product (people renting a room, people finding a flatmate) — use color and iconography to distinguish the two modes at a glance, don't make it feel like the same form twice.
- Compatibility score is the hero UI element — it's the whole pitch of the product. Never bury it as small text.

## Color
| Token | Hex | Use |
|---|---|---|
| `--primary` | `#4F46E5` (indigo-600) | CTAs, active nav, links |
| `--primary-foreground` | `#FFFFFF` | text on primary |
| `--accent-room` | `#0EA5E9` (sky-500) | property/room mode accents |
| `--accent-flatmate` | `#F97316` (orange-500) | flatmate mode accents |
| `--success` | `#16A34A` | score > 80, accepted state |
| `--warning` | `#D97706` | score 50-80 |
| `--muted` | `#64748B` | score < 50, secondary text |
| `--background` | `#FAFAFA` (light) / `#0B0B0F` (dark) | page bg |
| `--surface` | `#FFFFFF` / `#16161C` | cards |
| `--border` | `#E5E7EB` / `#27272E` | dividers |

Support light + dark mode via shadcn's `next-themes`, default to system preference.

## Typography
- Font: `Inter` (via `next/font`) for UI, `Cal Sans` or `Geist` for headings if available — otherwise Inter at heavier weight.
- Scale: `text-sm` (14px) body, `text-base` (16px) default, `text-2xl`/`text-4xl` for hero/section headers.
- Never go below 13px for real content — legal-adjacent listing details need to be readable.

## Layout
- Browse pages: 60/40 split — list on left, sticky Leaflet map on right (collapses to tabbed view on mobile).
- Cards: 12px radius, subtle shadow (`shadow-sm`), hover lift (`hover:shadow-md hover:-translate-y-0.5`), 150ms transition.
- Max content width `1280px`, generous whitespace — this is a trust-driven product (people sharing living space), don't make it feel cramped or salesy.

## Compatibility Badge (signature component)
- Circular progress ring, score in center, color per `--success/--warning/--muted` thresholds.
- Click/tap reveals LLM explanation in a popover — this is the differentiator, make it feel intentional not like a tooltip afterthought.

## Motion (Framer Motion, sparingly)
- Page transitions: fade + 8px slide, 200ms.
- List items: stagger-in on filter change (40ms stagger, cap at 12 items).
- Chat messages: slide-up-fade on new message.
- Don't animate anything the user has to wait on repeatedly (e.g. skip re-animating the same list on every keystroke of a filter — debounce first).

## Components to build once, reuse everywhere
`Button`, `Input`, `Select`, `Badge`, `CompatibilityBadge`, `ListingCard`, `MapView`, `Avatar`, `EmptyState`, `Skeleton` loaders for every async section (never a blank white flash).
