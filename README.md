# OMNICON — BioByte

A one-day biotech hackathon site built around a BEN 10 / Alien HUD theme.
Teams pick an alien track, build working tools for real problems in
bioprocessing, imaging and drug discovery, then demo them the same day.

Organised by **Crescent Technocrats Club**.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Firebase 12
- **Entry point:** [`app/page.tsx`](app/page.tsx) — Splash → Hero → Ticker →
  FeaturedMission → AlienGallery → About → ProblemStatements → Prizes →
  RulesTimeline → Registration → FAQs → CoreTeam → Contact → Footer
- **Content:** every string, track, prize and contact detail lives in
  [`data/site.ts`](data/site.ts). Components stay presentational, so copy
  changes never require touching JSX.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase values
npm run dev                  # http://localhost:3000
```

`.env.local` is gitignored. The public Firebase config is also checked into
[`lib/firebaseConfig.ts`](lib/firebaseConfig.ts) as a fallback so a fresh clone
runs without env setup — see [Firebase](#firebase) for why that is safe.

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run deploy` | **Deploy Firestore + Storage rules** (see below) |
| `npm run emulators` | Local Firestore/Storage emulators |

## Tracks

Five alien tracks, 12 seats each. Selection is enforced server-side in
[`firestore.rules`](firestore.rules) — the hard-coded track list there is
deliberate, because rules must not depend on anything a client sends.

| ID | Alien | Problem |
| --- | --- | --- |
| OM-01 | Upgrade | Digital Twin for Industrial Bioreactors |
| OM-02 | Grey Matter | AI-Based Microscopy Analysis |
| OM-03 | Heatblast | Smart Fermentation Monitoring System |
| OM-04 | Diamondhead | Heavy Metals Sedimentation Predictor |
| OM-05 | Ghostfreak | AI-Assisted Drug Repurposing Candidates |

Round 1 is free registration plus a PPT submission; Round 2 is ₹50 per head.

## Firebase

Project: **`biobyte-1e69c`** (set in both `.firebaserc` and
`lib/firebaseConfig.ts`).

```
app/auth/*            registration gate
registrations/{id}    one doc per verified account
trackSlots/{trackId}  seat counters, publicly readable for live seat counts
```

### Deploying the rules

The rules are the real security boundary. If they are not deployed, Firestore
and Storage fall back to whatever was last published — so deploy them before
announcing registration.

```bash
npx firebase login      # one-time
npm run deploy
```

`npm run deploy` publishes **only** the rules; it never touches data.

## Security model

[`firestore.rules`](firestore.rules) and [`storage.rules`](storage.rules)
enforce, server-side:

1. Only verified, allow-listed accounts may register.
2. A registration is bound to the account that created it — no forged `uid`,
   borrowed pass ID or pre-approved status.
3. A `trackSlots` counter can only ever move forward by exactly one, and only
   when a matching `registrations` document is created in the same
   transaction. Nobody can inflate the counter to lock other teams out, or
   deflate it to sneak past capacity.
4. Only organisers can list every registration, retag a status, retune a
   capacity, or delete a row.
5. Uploads are restricted to the caller's own registration folder, capped at
   25 MB, and must carry a presentation extension. Filenames must start with a
   freshly minted pass ID so a rejected duplicate cannot overwrite the PPT that
   already won the race.

Everything not matched is denied.

### Allow-list

Contestants must have a verified email on:

- `240071601217@crescent.education`
- `*@crescent.education`
- `*@crescenttechnocrats.club`

### Known gap

1. **Client gate is stricter than the rules.**
   [`lib/access.ts`](lib/access.ts) only accepts the exact domain
   `crescent.education`, but the rules also permit
   `*@crescenttechnocrats.club`. Members of the organising club are therefore
   permitted by the rules but blocked by the UI. Align the two — most likely
   by widening `ALLOWED_DOMAIN` handling to a domain list.

### Admin identity

Admin access has one client-side source of truth — `CANONICAL_ADMIN_EMAILS`
in [`lib/access.ts`](lib/access.ts) — merged with any extras in
`NEXT_PUBLIC_ADMIN_EMAILS`. The same eleven addresses are hard-coded in
`isAdmin()` in both [`firestore.rules`](firestore.rules) and
[`storage.rules`](storage.rules); the three lists must be edited together.
An address in the UI list but not the rules loads the dashboard and then
fails with a permission error (the dashboard explains this and names the
account). Deploy rules with `npm run deploy` after editing them.

### Publishing the client config

The Firebase web config in `lib/firebaseConfig.ts` is a **public client
identifier**, not a secret — it ships in the browser bundle by design and is
not what protects your data. Access is enforced entirely by the rules above,
so committing it is safe. Keep service-account keys and any real secrets out
of the repo.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/admin` | Organiser dashboard — admin-gated |
| `/confirmed` | Post-registration pass |

## Project layout

```
app/           routes, layout, globals.css (design system), sections.css (layouts)
components/    one component per section, presentational only
data/site.ts   all content
lib/           firebase client, access gate, registration + validation
firestore.rules / storage.rules   the security boundary
```

Styling is two plain stylesheets, no CSS-in-JS: `globals.css` owns tokens,
typography and shared primitives; `sections.css` owns per-section layout.
Import order in `app/layout.tsx` matters — `sections.css` loads second so
section rules win specificity ties.
