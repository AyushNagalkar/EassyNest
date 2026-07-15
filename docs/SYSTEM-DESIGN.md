# System Design Write-up (draft — fill in as you build, trim to 800 words max before submission)

## 1. Compatibility Scoring Design (~200 words)
- One `CompatibilityScore` row per (seeker profile, target) pair; target is polymorphic — either a `Property` or another `SeekerProfile`, distinguished by `targetType`.
- Computed once on first interaction (profile view or interest), not on every list render — keeps browse pages fast and keeps LLM cost bounded.
- Score is invalidated and recomputed only when either side of the pair changes materially (listing edited, profile budget/location changed).
- Two prompt variants share one JSON contract (`{score, explanation}`), so scoring, storage, and UI code paths don't fork by seeker type.

## 2. LLM Integration & Fallback (~200 words)
- Scoring is async via BullMQ, not inline in the request/response cycle — a slow or down LLM never blocks the user from browsing or expressing interest.
- Gemini 2.5 Flash called with an explicit timeout + one retry with backoff.
- On exhausted retries, a deterministic rule-based scorer runs instead (same city → base score, budget-range overlap → weighted score, move-in date proximity → small penalty), producing a score on the same 0–100 scale, tagged `source: RULE_BASED` so it's auditable but never surfaced differently to the end user.
- This guarantees the "score, then rank" flow never breaks even if the AI provider is fully down.

## 3. Chat Implementation (~200 words)
- Chat is gated behind an accepted `Interest` — a `ChatRoom` is only created on acceptance, and the WebSocket gateway checks room membership against `Interest.fromUserId` / the property owner or target seeker's `userId` before allowing a join.
- NestJS WebSocket gateway, one Socket.IO room per `ChatRoom` (`chat:<id>`).
- Every message is persisted to Postgres before being broadcast, so refreshing the page or reconnecting never loses history — the socket layer is a delivery mechanism, not the source of truth.
- REST endpoint backs initial history load (paginated); the socket only carries live deltas after that.

## 4. Notification Flow (~200 words)
- Two parallel channels on the same trigger events: email (Resend/Brevo) for anything that needs to pull the user back to the site, and an in-app `Notification` row for anything they'll see next time they're active.
- Triggers: interest created with score > 80 → email + notify owner; interest accepted/declined → email + notify the sender; new message while recipient is offline → in-app notification only (avoid email spam for chat).
- Email sending happens through the same BullMQ queue as scoring, not inline — a slow email provider can't stall an API response either.
- Both channels read from the same event, so there's no risk of one firing without the other.
