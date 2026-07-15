# API Spec

Base URL: `/api/v1`. Auth via `Authorization: Bearer <JWT>`. Roles gate access at the route level via NestJS Guards.

## Auth
| Method | Route | Role | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `{ email, password, name, role }` | role = TENANT or OWNER (ADMIN seeded manually) |
| POST | `/auth/login` | Public | `{ email, password }` | returns `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | Public | `{ refreshToken }` | rotate token |
| POST | `/auth/logout` | Any | — | invalidate refresh token |

## Properties (Owner)
| Method | Route | Role | Notes |
|---|---|---|---|
| POST | `/properties` | OWNER | create listing + photo upload URLs |
| GET | `/properties/mine` | OWNER | owner's own listings |
| PATCH | `/properties/:id` | OWNER | edit listing (must own it) |
| PATCH | `/properties/:id/status` | OWNER | mark FILLED / ACTIVE |
| DELETE | `/properties/:id` | OWNER | soft delete |

## Browse / Search (Tenant + Public)
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | `/properties` | Public | filters: `city, minRent, maxRent, roomType, lat, lng, radiusKm` — excludes FILLED |
| GET | `/properties/:id` | Public | listing detail + photos |
| GET | `/properties/:id/score` | TENANT | this tenant's compatibility score for this listing (from DB, computed on first view) |
| GET | `/seekers` | Public | browse flatmate-seeker posts, same filter shape as properties |
| GET | `/seekers/:id` | Public | seeker post detail |

## Seeker Profile (Tenant)
| Method | Route | Role | Notes |
|---|---|---|---|
| POST | `/seeker-profile` | TENANT | create profile: `type, preferredCity, lat, lng, budgetMin, budgetMax, moveInDate, bio` |
| GET | `/seeker-profile/me` | TENANT | own profile |
| PATCH | `/seeker-profile/me` | TENANT | edit |

## Compatibility Scoring
| Method | Route | Role | Notes |
|---|---|---|---|
| POST | `/scores/property/:propertyId` | TENANT | trigger scoring job if not already cached; enqueues BullMQ job, returns `{status: "queued"}` or cached score |
| POST | `/scores/seeker/:seekerProfileId` | TENANT | same, for flatmate-to-flatmate scoring |
| GET | `/scores/:id` | TENANT | poll job result once queued |

## Interests
| Method | Route | Role | Notes |
|---|---|---|---|
| POST | `/interests` | TENANT | `{ targetType, targetPropertyId? , targetSeekerProfileId? }` — triggers score check → email if >80 |
| GET | `/interests/sent` | TENANT | interests this user sent |
| GET | `/interests/received` | OWNER / TENANT (flatmate) | interests targeting your property or seeker post |
| PATCH | `/interests/:id/accept` | OWNER / TENANT | creates ChatRoom, emails the other party |
| PATCH | `/interests/:id/decline` | OWNER / TENANT | emails the other party |

## Chat (REST for history, WS for live)
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | `/chat/:interestId/messages` | Participant | paginated history |
| WS | `chat:join` | Participant | join room `chat:<chatRoomId>` |
| WS | `chat:message` | Participant | `{ chatRoomId, content }` → broadcast + persist |
| WS | `chat:typing` | Participant | typing indicator (ephemeral, not persisted) |

## Notifications (in-app, separate from email)
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | `/notifications` | Any | unread + recent, paginated |
| PATCH | `/notifications/:id/read` | Any | mark read |

## Favorites
| Method | Route | Role | Notes |
|---|---|---|---|
| POST | `/favorites/:propertyId` | TENANT | toggle save |
| GET | `/favorites` | TENANT | saved listings |

## Admin
| Method | Route | Role | Notes |
|---|---|---|---|
| GET | `/admin/users` | ADMIN | list + filter, deactivate user |
| GET | `/admin/properties` | ADMIN | list all, force-remove |
| GET | `/admin/activity` | ADMIN | recent interests, signups, flagged content |
| PATCH | `/admin/users/:id/deactivate` | ADMIN | soft-ban |

## Standard error shape
```json
{ "statusCode": 400, "message": "Budget max must be greater than budget min", "error": "Bad Request" }
```
