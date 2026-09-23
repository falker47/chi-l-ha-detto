# Chi l'ha detto?

An Italian-language quote quiz about **attribution, context and ambiguity**. The game asks who said a line, then goes beyond the answer with historical context, hints and notes for quotations whose popular attribution is disputed or apocryphal.

[**Play the live version →**](https://chi-l-ha-detto.vercel.app/)

![Chi l'ha detto? preview](public/images/preview.png)

## What it is

The project combines a quiz game with a small curated knowledge base around quotations.

- **4 themes**: Classica, Intrattenimento, Trash and Mista.
- **2 gameplay models**:
  - **Eracle** — finite progression through increasingly difficult stages.
  - **Achille** — open-ended streak mode.
- **Theme-specific identities** such as Hollywood, Superstar, Memelord and Gran Sapiarca.
- **Hints and second-chance mechanics** integrated into gameplay.
- **Top-5 leaderboards** separated by theme and mode.
- **Responsive UI** designed for desktop and mobile.
- Quote records include source/context fields, difficulty, hints and ambiguity notes rather than treating every viral attribution as unquestionably authentic.

## Architecture

```text
React 18 + TypeScript + Vite + Tailwind
                │
                ├── static game UI and quote dataset
                │
                └── /api/leaderboard
                         │
                         ▼
                 Vercel Function (fra1)
                         │
                         ▼
              Neon PostgreSQL (Frankfurt)
```

The leaderboard API is server-side only. `DATABASE_URL` is never exposed through Vite, and request payloads are validated with Zod before reaching PostgreSQL.

The frontend keeps a localStorage cache as a graceful fallback when the remote leaderboard is temporarily unavailable. Server-side ranking, upsert behavior and historical-row compatibility are covered by PostgreSQL-compatible integration tests using PGlite.

### Main stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| API | Vercel Functions, Web Standard `Request`/`Response` |
| Database | Neon PostgreSQL |
| Validation | Zod |
| Tests | Node test runner + PGlite |
| Hosting | Vercel |

## Verification

The repository includes automated checks for the game data and leaderboard stack:

```bash
npm test
npm run typecheck
npm run lint
npm run validate
npm run build
```

The leaderboard test suite covers all eight theme/mode combinations, ranking and Top-5 selection, PostgreSQL schema behavior, upserts, concurrent submissions, API validation/error handling, migration/import semantics, microsecond timestamps and the local cache fallback.

A GitHub Actions workflow runs the same verification path on pushes and pull requests.

## Live deployment

Production is hosted on Vercel:

**https://chi-l-ha-detto.vercel.app/**

The production project deploys from `main`. The SPA and leaderboard API share the same Vercel project, while `/api/*` is excluded from the frontend fallback rewrite.

The current backend architecture replaced the older Supabase/Render setup. Historical migration notes are retained for reproducibility, but they are not part of the runtime architecture.

## Local development

Requires **Node.js 22**.

```bash
npm ci
npm run dev
```

To run the frontend and local API together:

```bash
npm run dev:full
```

Before pushing a change:

```bash
npm test
npm run typecheck
npm run lint
npm run validate
npm run build
```

## Repository map

```text
├── src/
│   ├── components/          # Game and leaderboard UI
│   ├── data/                # Quote dataset
│   └── lib/                 # Frontend leaderboard client/cache
├── api/                     # Vercel Function entry point
├── backend/                 # Database, queries and validation
├── shared/                  # Shared leaderboard types/ranking helpers
├── tests/                   # PostgreSQL-compatible integration tests
├── migrations/              # Database schema
├── scripts/                 # Validation and migration utilities
├── public/images/           # Game artwork and social preview
├── vercel.json              # Runtime region, routing and cache config
└── README.md
```

## Operational documentation

These documents preserve the implementation and migration details without cluttering the main project overview:

- [Vercel + Neon deployment](DEPLOY_GUIDE.md)
- [Leaderboard API, cache and tests](LEADERBOARD_README.md)
- [Database migration and rollback](DATABASE_MIGRATION_README.md)
- [Completed migration verification](MIGRATION_STATUS.md)

## Scope and limitations

The leaderboard is a lightweight game feature, not an anti-cheat system: scores originate in the browser and player identities are not authenticated. The server validates shape and plausible score bounds, but does not attempt to provide competitive-game security.

No explicit open-source license is currently granted for this repository.
