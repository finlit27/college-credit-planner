# College Credit Planner

A free, personalized planner that helps California high-school students graduate with up to two years of college credit already done — using dual enrollment at their local community college.

Built for [FinLit Garden](https://finlitgarden.com). Source-of-truth for the underlying recommendations is the Python CLI at `~/COMMUNITY COLLEGE CREDIT/` (separate repo).

---

## Stack

- **Next.js 16.2** (App Router, Turbopack, Node runtime for API routes)
- **React 19**, **TypeScript strict**, **Tailwind v4**
- **Zod** as single source of truth for types + validation
- **Upstash Redis** via the Vercel Marketplace for share-URL persistence (30-day TTL)
- **@vercel/analytics** for funnel events
- **Vitest** for unit + integration tests
- Optional: **n8n Cloud** workflow calling **Claude Haiku 4.5** for the personalized narrative paragraph (Phase B — not yet wired)
- Optional: **Kit** newsletter (Phase C3 — not yet wired)

---

## Quick start

```bash
# from this directory
npm install
npm run sync-colleges   # pulls colleges.yaml from the CLI repo → src/data/colleges.json
cp .env.example .env.local
# fill in Upstash creds in .env.local (see "Env vars" below)
npm run dev
```

Then open http://localhost:3000.

### Without Upstash credentials

Submitting the form will 500 (the route can't persist the plan), but you can still see the rendered output at the dev-only preview routes:

- http://localhost:3000/plan/preview/maria-10-sgv-stem-csu
- http://localhost:3000/plan/preview/sam-11-online-undecided-undecided
- http://localhost:3000/plan/preview/alex-12-inland-business-transfer
- http://localhost:3000/plan/preview/jordan-9-oc-health-uc
- http://localhost:3000/plan/preview/riley-9-sfv-arts-private

These load the parity fixtures directly and return 404 in production builds.

---

## Env vars

All set via `.env.local` for dev and via the Vercel dashboard for preview + production. `.env.example` is the canonical list.

| Var | Purpose | Required for |
|---|---|---|
| `KV_REST_API_URL` | Upstash REST endpoint | `/api/plan` write, `/plan/[shareId]` read |
| `KV_REST_API_TOKEN` | Upstash REST token | same |
| `N8N_NARRATIVE_WEBHOOK` | n8n Cloud webhook for the personalized narrative | Phase C2 (`/api/narrative`) |
| `KIT_API_KEY` | Kit API v3 key | Phase C3 (`/api/newsletter`) |
| `KIT_FORM_ID` | Kit form/tag ID — should map to tag `cc-planner` | Phase C3 |

If you've linked this directory to a Vercel project (`vercel link`), `vercel env pull .env.local` will fill in everything that's already in the dashboard.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server on :3000 |
| `npm run build` | Production build — must pass before commit |
| `npm test` | Vitest run (104 tests at last commit) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:ui` | Vitest UI |
| `npm run lint` | ESLint |
| `npm run sync-colleges` | Reads `~/COMMUNITY COLLEGE CREDIT/data/colleges.yaml`, writes `src/data/colleges.json`. Run after the annual CLI data refresh. **Commit the resulting JSON.** |

---

## Architecture

```
Browser ─submit─▶ /api/plan (Node runtime)
                       │
                       ├─ IntakeSchema.safeParse
                       ├─ generatePlan(intake)        ← pure, src/lib/plan-generator.ts
                       └─ Upstash SET cc-plan:{id}    ← 30-day TTL
                                                   │
                                                   ▼
                            /plan/[shareId]  ← server component, loads from Upstash
                                                   │
                                                   ▼
                            PlanShell (CollegeCard, CourseSequence, GradeRoadmap,
                                       CalGetcChecklist, SavingsTable,
                                       ActionChecklist, CommonMistakes, ShareButton)
```

The plan-generator is a pure function with full parity-test coverage against five fixtures produced by the Python CLI. The JSON shape of `Plan` is snake_case to match the CLI's `--json` output byte-for-byte.

### Why the manual `sync-colleges` step?

The Python CLI is the source of truth for the 11 SoCal college records. It lives in a different repo and Vercel can't reach it at build time. So we keep a versioned JSON snapshot in this repo (`src/data/colleges.json`) and refresh it manually whenever the CLI's `update_college_data.md` workflow fires — about twice a year. The plan footer surfaces the last-updated date so stale data is visible.

---

## Deploy

This repo is deployed to Vercel.

1. **Preview deploys**: every push to a non-`main` branch creates a preview URL. Use these for stakeholder review.
2. **Production**: merge to `main`. Vercel auto-deploys.
3. **Env vars**: set in the Vercel dashboard for both Preview and Production environments. New env vars require a redeploy.
4. **Domains**: configured in the Vercel project settings.

### Rollback

If a production deploy is broken:

1. Open the Vercel dashboard → Deployments
2. Find the last good production deployment
3. Click "..." → "Promote to Production"
4. This is instantaneous; no rebuild required.

Share URLs survive rollbacks because data lives in Upstash, not in the build artifact.

---

## Before launch — checklist for Christopher

These are blockers for v1.0 production cutover.

### Voice-bearing copy (9 TODOs in the codebase)

Search for `TODO: Christopher` to find them. Currently stubbed:

| File | What it is |
|---|---|
| `src/components/Hero.tsx` | Pill kicker, hero headline, hero lead paragraph |
| `src/components/plan/PlanShell.tsx` | GPA-alert banner, share-section eyebrow, share CTA headline, share CTA body |
| `src/components/intake/IntakeForm.tsx` | Two submission error messages |

Per SPEC §11: AI is not allowed to write voice-bearing copy for FinLit Garden. These all need Christopher's hand.

### Other launch blockers

- [ ] Privacy page exists at `finlitgarden.com/privacy` (referenced from the newsletter opt-in, when E6 ships)
- [ ] iPhone Safari real-device QA (Phase F6) — form fillable + plan readable on actual hardware, not just a simulator
- [ ] Three AI narrative samples reviewed (Phase F7) — once Phase B + C2 + E4 ship

### Nice-to-have, not blocking

- [ ] AI narrative paragraph (Phase B + C2 + E4)
- [ ] Newsletter opt-in (Phase C3 + E6)
- [ ] Playwright E2E happy path (Phase F4)

---

## Annual data refresh

When the Python CLI's `update_college_data.md` workflow fires (typically once per academic year), the web app needs a fresh snapshot:

```bash
cd "/Users/christopherjackson/COMMUNITY COLLEGE CREDIT"
# run the CLI's update_college_data workflow to refresh colleges.yaml

cd "../FinLit Garden Apps/college-credit-planner"
npm run sync-colleges
git add src/data/colleges.json
git commit -m "Sync colleges.yaml → colleges.json (academic year YYYY-YY refresh)"
git push          # triggers preview deploy
# verify a few plan previews still look right, then merge to main
```

---

## Tests

- `tests/plan-parity.test.ts` — guards against silent drift in the TS port. Five fixtures from the Python CLI, deep-equality on every plan field.
- `tests/plan-generator.test.ts` — branch coverage on the plan composer (every major, every grade, online override, GPA gate behavior).
- `tests/intake-reducer.test.ts` — IntakeForm state machine, including the region-skip behavior for online-only students.
- `tests/api-plan.test.ts` — `/api/plan` integration tests with mocked Upstash.
- Plus unit coverage on `colleges.ts`, `schema.ts`, `money.ts`, the data tables.

`npm test` runs all 8 files / 104 cases in well under a second.
