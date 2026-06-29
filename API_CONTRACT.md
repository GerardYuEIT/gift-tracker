# Gift Tracker — Frontend API Contract

This is what the frontend currently expects from the backend. The endpoint
paths below are **placeholders the frontend guessed** (see commented-out
`fetch()` calls in `src/api/client.ts`) — swap them for whatever your actual
routes are once the swagger doc is ready. The **data shapes** are the
important part to confirm; they mirror the JPA entities described to the
frontend dev.

## Data model

### Person

```json
{
  "id": "string",
  "name": "string",
  "occasion": "BIRTHDAY | CHRISTMAS | ANNIVERSARY | VALENTINES_DAY | GRADUATION | WEDDING | OTHER",
  "notes": "string | null",
  "gifts": ["Gift", "..."]
}
```

- `gifts` is expected nested and eagerly loaded (one-to-many, cascade delete on the person).

### Gift

```json
{
  "id": "string",
  "idea": "string",
  "price": "number | null",
  "link": "string | null",
  "status": "PLANNED | BOUGHT | GIVEN"
}
```

### Enums

- `Occasion`: `BIRTHDAY`, `CHRISTMAS`, `ANNIVERSARY`, `VALENTINES_DAY`, `GRADUATION`, `WEDDING`, `OTHER` — confirmed matching your `Occasion.java`.
- `GiftStatus`: `PLANNED`, `BOUGHT`, `GIVEN` — not yet confirmed against your backend enum name/values.

## Assumed endpoints

| Action | Method | Path | Body | Returns |
|---|---|---|---|---|
| List people (with gifts) | GET | `/api/people` | — | `Person[]` |
| Create person | POST | `/api/people` | `{ name, occasion, notes }` | `Person` (with `gifts: []`) |
| Update person | PUT | `/api/people/{id}` | `{ name, occasion, notes }` | `Person` |
| Delete person | DELETE | `/api/people/{id}` | — | 204, cascades to delete gifts |
| Add gift | POST | `/api/people/{personId}/gifts` | `{ idea, price, link, status }` | `Gift` |
| Update gift | PUT | `/api/people/{personId}/gifts/{giftId}` | `{ idea, price, link, status }` | `Gift` |
| Delete gift | DELETE | `/api/people/{personId}/gifts/{giftId}` | — | 204 |

## Open questions for the backend

1. Is gift creation nested (`POST /people/{id}/gifts`) or top-level (`POST /gifts` with `personId` in the body)?
2. Exact base URL once deployed/running locally (currently a placeholder `/api`).
3. Confirm `GiftStatus` enum name and values match.
4. Any pagination/sorting on `GET /people`, or is it always the full list?
