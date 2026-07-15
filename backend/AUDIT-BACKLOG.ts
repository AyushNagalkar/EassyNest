// =============================================================================
// BACKEND AUDIT BACKLOG — Items deferred from the 2026-07-13 audit.
// These do NOT block frontend work but should be addressed before production.
// =============================================================================

// TODO [AUDIT-B1]: Email timing bug
//   - Email service sends verification/welcome emails synchronously in the
//     request path. Move to BullMQ queue (already set up) so API responses
//     are not blocked by Resend latency or failures.

// TODO [AUDIT-B2]: Upload ownership checks
//   - /upload/property/:propertyId/photos does not verify that the
//     authenticated user actually owns the property before allowing uploads.
//     Add ownership validation.

// TODO [AUDIT-B3]: Seeker geo-filter
//   - SeekerProfileService.browse() uses bounding-box filter but skips
//     Haversine post-filter, unlike PropertiesService. Add consistent
//     distance-based filtering for seeker profile searches.

// TODO [AUDIT-B4]: Rate limiting
//   - ThrottlerModule is configured globally (100 req/60s) but is not
//     applied per-route. Add tighter limits on auth endpoints (login,
//     register, refresh) and scoring endpoints.

// TODO [AUDIT-B5]: Token revocation
//   - Logout endpoint clears the refresh token hash but does not invalidate
//     the access token. Consider a Redis-based token blacklist for active
//     access tokens, or shorten access token TTL.

// TODO [AUDIT-B6]: Upload error handling
//   - Supabase storage upload errors are silently caught. Surface proper
//     error messages to the client and implement retry logic.

// TODO [AUDIT-B7]: Review duplicate handling
//   - ReviewsService.create() does not check for existing reviews from the
//     same user for the same target. Add unique constraint or service-level
//     check to prevent duplicate reviews.

// TODO [AUDIT-B8]: Unimplemented alert/verification features
//   - SavedSearches alert matching (cron job to notify users of new matching
//     listings) is defined in schema but not implemented.
//   - Phone verification flow is stubbed (phoneVerified field exists but no
//     SMS/OTP integration).
//   - Email verification callback handler is missing.

// TODO [AUDIT-B9]: Stale tests
//   - app.controller.spec.ts is the only test file and tests default
//     boilerplate. Add integration tests for the 4 fixed endpoints and
//     e2e tests for WebSocket notification flow.
