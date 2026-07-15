# LLM Prompts & Fallback Logic

## 1. Room compatibility (tenant → property)

**System prompt:**
```
You are a compatibility scoring engine for a rental platform. Score strictly
based on budget fit and location match. Respond with JSON only, no markdown,
no prose outside the JSON object.
```

**User prompt template:**
```
Room listing:
- City: {property.city}
- Rent: ₹{property.rent}/month
- Room type: {property.roomType}
- Furnishing: {property.furnishing}
- Available from: {property.availableFrom}

Tenant profile:
- Preferred city: {seeker.preferredCity}
- Budget: ₹{seeker.budgetMin} - ₹{seeker.budgetMax}/month
- Move-in date: {seeker.moveInDate}

Compute a compatibility score from 0 to 100 based on budget and location
match. Return JSON: { "score": number, "explanation": string }
```

**Example input:**
```json
{
  "property": { "city": "Pune", "rent": 14000, "roomType": "SINGLE_ROOM", "furnishing": "SEMI_FURNISHED", "availableFrom": "2026-08-01" },
  "seeker": { "preferredCity": "Pune", "budgetMin": 10000, "budgetMax": 15000, "moveInDate": "2026-08-05" }
}
```

**Example output:**
```json
{
  "score": 88,
  "explanation": "Rent falls within budget with some margin, same city, and move-in dates are 4 days apart — a strong match."
}
```

## 2. Flatmate compatibility (seeker → seeker)

**User prompt template:**
```
Person A is looking for a flatmate:
- City: {a.preferredCity}
- Budget: ₹{a.budgetMin} - ₹{a.budgetMax}/month
- Move-in date: {a.moveInDate}
- Bio: {a.bio}

Person B is looking for a flatmate:
- City: {b.preferredCity}
- Budget: ₹{b.budgetMin} - ₹{b.budgetMax}/month
- Move-in date: {b.moveInDate}
- Bio: {b.bio}

Compute a compatibility score from 0 to 100 based on budget overlap,
location match, and move-in date proximity. Return JSON:
{ "score": number, "explanation": string }
```

## Fallback: rule-based score (used when Gemini fails/times out)

```
locationScore = 60 if same city (case-insensitive) else 20
budgetOverlap = overlap between [budgetMin, budgetMax] and target's price/range,
                as a % of the seeker's own range
budgetScore   = 40 * budgetOverlap
dateProximity = penalty of up to -10 if move-in dates are >30 days apart

finalScore = clamp(locationScore + budgetScore - datePenalty, 0, 100)
explanation = "Score computed using budget and location match (AI scoring
               temporarily unavailable)."
```

This keeps the score on the same 0–100 scale and the same DB row shape (`source: RULE_BASED`), so the frontend never needs to special-case it.

## Failure handling flow
1. Interest or score request triggers a BullMQ job, not a synchronous API call.
2. Job calls Gemini with an 8s timeout.
3. On timeout/error: retry once with exponential backoff (2s).
4. On second failure: run the rule-based fallback, store with `source: RULE_BASED`, mark job complete — user never sees a hung request.
5. Score row is permanent. It is never silently recomputed; if it needs to change (e.g. listing edited), the update path explicitly deletes the old `CompatibilityScore` row and re-enqueues.
