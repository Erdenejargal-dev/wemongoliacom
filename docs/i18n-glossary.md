# WeMongolia i18n glossary (EN / MN)

Short reference for **copy consistency** when editing `lib/i18n/messages/**` and public locale files. It does not replace the codebase: keys and structure live in the repo.

## Tone

| Locale | Target |
|--------|--------|
| **English** | Clean, modern, slightly premium (Airbnb / Booking-style): short labels, confident, not salesy. Prefer sentence case for body; section titles can stay title case where the UI already uses it. |
| **Mongolian** | Natural, tourism-friendly phrasing. Avoid word-for-word English; prefer how Mongolian travel sites and everyday speech would say it. |

## Core terms (pair these consistently)

| Concept | English | Mongolian | Notes |
|---------|---------|------------|--------|
| Guided product | tour / trip context | **аялал** | Use **тур** only if the English UI literally says “tour” in a product name; default guest-facing is **аялал**. |
| Accommodations | stay(s), place to stay, listing | **хоноглолт** / **амралт, буудал** (context) | For counts and browse, **хоноглолт** fits “# stays”; avoid odd compounds like *буудлалт* unless already fixed elsewhere. |
| Service (generic) | service | **үйлчилгээ** | For provider/platform service, not a single “tour” product. |
| Booking object | booking, reservation | **захиалга** | Primary in checkout and guest flows. |
| Same idea, OTA style | (sometimes) book / reserve | **бронь** / **захиалах** | Use **захиалга** for the noun; verbs **захиалах** / **броньлох** as fits the CTA. |
| Star text reviews | review(s), guest reviews | **сэтгэгдэл** / **зочдын сэтгэгдэл** | Prefer **сэтгэгдэл** for written feedback; not mixed with “rating” in the same line. |
| Star score | rating(s), stars | **үнэлгээ** / **од** (context) | “Ratings” as scores → **үнэлгээ**; “reviews” as text → **сэтгэгдэл**. |
| Host / organizer | host, organizer | **зохион байгуулагч** / **эзэн** (context) | **About the host** → phrasing like *Зохион байгуулагчийн тухай*, not a literal *эзний тухай* if it sounds off-brand. |
| Nightly price | / night, per night | **/ шөнө** | EN: ` / night` (spaced slash); keep consistent across cards and detail. |
| Check-in / out | Check-in, Check-out | **Орох / гарах** (or your fixed strings) | EN: hyphenated **Check-in** / **Check-out** in travel labels. |

## CTAs and navigation (English)

- Prefer **View** for opening a single item; **Browse** / **Browse all …** for list exploration.
- Do not suffix with arrows (**→**) in English strings; the UI can add chevrons.
- Keep “Message” (contact) aligned with “replies within … hours” / “a few hours” (human, not “API” or technical).

## Admin / operator (FX, pricing)

- **English**: short, operator-clear (what the row does, append-only, no editing history).
- **Mongolian**: use **шинэ** for “fresh” FX data, not loan calques (e.g. avoid **свеж**).

## When adding new copy

1. Reuse a term from this table before inventing a synonym.
2. If you add a new domain term, add one row here (EN + MN + one line of usage).
3. Run parity checks for namespaces that have them (`messages/parity.ts` / `registry`).

## Related paths

- Message modules: `lib/i18n/messages/`
- Public strings: `lib/i18n/public/`
- Provider / admin: `lib/i18n/provider/`, `lib/i18n/admin/`, `lib/i18n/traveler/`
