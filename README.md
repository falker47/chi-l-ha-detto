# Chi l'ha detto?

**An Italian-language quotation quiz about attribution, context, and the stories behind famous words.**

*Chi l'ha detto?* (“Who said it?”) challenges players to identify quotations from history, philosophy, entertainment, and internet culture. After answering, players can explore the quotation's context, its recorded source, and notes about ambiguous or disputed attributions.

The game also includes quotations that are popularly attributed to someone without reliable historical evidence. In those cases, the expected quiz answer may represent a conventional attribution rather than a verified original speaker.

**[Play the game](https://chi-l-ha-detto.vercel.app/)**

![Chi l'ha detto? — game preview](public/images/preview.png)

## Choose your challenge

The game offers four Italian-language themes:

| Theme | Quotation records | Focus |
| --- | ---: | --- |
| **Classica** | 159 | History, philosophy, politics, science, and literature |
| **Intrattenimento** | 140 | Films and popular entertainment |
| **Trash** | 5 | Memes, internet culture, and unconventional references |
| **Mista** | 304 available | A combination of the other three datasets |

These counts describe the quotation files in the repository. Mista draws from the existing records; it is not a fourth independent collection.

Every question presents four answer positions. After a round, the interface can reveal the recorded context, source information, and attribution notes.

### Two gameplay models

Each theme has two game modes with its own title:

| Theme | Finite challenge | Streak challenge |
| --- | --- | --- |
| Classica | Eracle | Achille |
| Intrattenimento | Hollywood | Superstar |
| Trash | Memelord | Memegod |
| Mista | Gran Sapiarca | Il Supremo |

**Eracle — complete the challenge**

The finite mode consists of **12 levels**, except for Mista, which has **15**. Players have 60 seconds per question. A wrong answer or expired timer ends the run, unless an already activated second chance is available.

Four single-use aids are available during a run: **50/50**, **Hint**, **Super Hint**, and **2nd Chance**. Correct answers award points according to the level reached and the remaining time. Completing every level also applies a final multiplier based on how many aids remain unused.

For individual themes, question selection targets progressively higher difficulty levels where suitable records exist. Questions may repeat because the current finite-mode selector does not guarantee unique selections within a run.

**Achille — build your streak**

The streak mode continues without a preset number of levels. Players have **45 seconds per question**, and the run ends on an incorrect answer or timeout. Unlike Eracle, it does not offer lifelines.

Question difficulty generally increases as the run progresses and with longer streaks. Points depend on the question's difficulty and the time remaining, with an additional streak-based multiplier.

Question variety is constrained by the available records. In particular, Trash contains only five entries, while Mista's current category-selection behavior differs between modes and should not be interpreted as uniformly balanced sampling.

## Quotations, sources, and uncertainty

The content is stored in three JSON datasets under [`src/data/`](src/data/):

- [`quotes.json`](src/data/quotes.json) — Classica
- [`entertainmentQuotes.json`](src/data/entertainmentQuotes.json) — Intrattenimento
- [`trashQuotes.json`](src/data/trashQuotes.json) — Trash

Quotation records include the text, expected answer, four options, historical period, source title and URL, contextual explanation, difficulty, hints, and an ambiguity note.

These fields support a richer quiz than simple name recognition, but they are **editorial metadata, not proof of historical authenticity**. Many source URLs lead to encyclopedic or secondary references rather than original documents. A valid URL, a recorded source title, or a passing data check does not establish that someone actually said the words attributed to them.

Some entries intentionally preserve a widely circulated attribution despite acknowledging that it is doubtful or unsupported. Attribution notes should therefore be read alongside the expected answer.

The datasets have not undergone a complete independent, source-by-source historical verification. Individual claims, translations, dates, and attributions may need correction.

## Leaderboards

The application maintains a **Top 5 for each theme and gameplay mode**, producing eight separate leaderboards.

Entries are ranked by:

1. Highest completed streak or level count.
2. Highest score.
3. Earlier submission timestamp.
4. Record ID, as a deterministic final tie-breaker.

Each theme/mode combination uses a player name as its record identity. Names are case-sensitive. Submitting again under the same name replaces the selected existing result, **even when the new result is worse**.

The browser communicates with a server-side endpoint at [`/api/leaderboard`](api/leaderboard.ts), backed by Neon PostgreSQL. The API validates submitted fields and score bounds, and the database logic handles historical duplicate identities without deleting their underlying rows.

If the online leaderboard cannot be reached, the frontend can display cached records from `localStorage`. A record saved locally during an outage is **not automatically synchronized** when connectivity returns and may later be replaced by remote data.

### Trust and privacy limitations

Leaderboards are intended as a lightweight game feature, not a secure competitive ranking system.

There is no player account system or strong identity verification. Scores are calculated in the browser; server-side checks reject malformed or out-of-range submissions but cannot prove that a run was played legitimately. A client can submit plausible fabricated scores, and another person can replace a record by using the same display name.

Player names and scores submitted to the online leaderboard are stored in the database and may appear publicly in rankings. The browser also retains leaderboard data and question-history information locally. When no local portrait is available, the interface may request a generated image from the external `ui-avatars.com` service.

The repository does not establish comprehensive privacy, data-retention, or anti-abuse guarantees.

## Architecture

```text
React 18 · TypeScript · Vite · Tailwind CSS
                    |
       Game UI and local JSON datasets
                    |
          /api/leaderboard
                    |
         Vercel server-side Function
                    |
            Neon PostgreSQL
```

The application uses:

| Layer | Implementation |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| API | Vercel Function using Web Standard Request/Response |
| Database | Neon PostgreSQL |
| Input validation | Zod |
| Database integration tests | PGlite and Node.js test runner |
| Deployment | Vercel |

The server-side API handles database access, validation, record updates, and rankings. Database credentials are not required by the frontend bundle.

The repository's [`vercel.json`](vercel.json) configures the `fra1` Function region, Vite build output, and SPA routing that excludes `/api` from the frontend fallback.

## Run locally

**Requirements:** Node.js **22.x** and npm.

Clone the repository and install its locked dependencies:

```bash
git clone https://github.com/falker47/chi-l-ha-detto.git
cd chi-l-ha-detto
npm ci
```

To run the frontend:

```bash
npm run dev
```

This starts the Vite development server. The online leaderboard API is not provided by Vite alone, so leaderboard requests may use the local fallback.

To run the frontend together with the local API adapter, configure the server-side `DATABASE_URL` in an untracked `.env.local` file. See [`.env.example`](.env.example) for the expected variable and connection format.

Then run:

```bash
npm run dev:full
```

This launches Vite and the API adapter on port `3001`. Vite proxies `/api` requests to that adapter, which uses the same handler as the Vercel Function.

The adapter connects to the configured Neon database, not a disposable local database. The application validates the expected Frankfurt database target and role. Avoid test submissions against a production database.

Never commit credentials, expose `DATABASE_URL` through a `VITE_`-prefixed variable, or include database secrets in frontend configuration.

## Tests and verification

The repository provides the following checks:

```bash
npm test
npm run typecheck
npm run lint
npm run validate
npm run build
```

`npm test` exercises the leaderboard implementation using PostgreSQL-compatible PGlite tests. Coverage includes the eight theme/mode combinations, ranking, submission validation, updates, historical-schema compatibility, API error handling, and local cache behavior.

`npm run validate` checks the structure and selected consistency rules of **`src/data/quotes.json` only**. It does not currently validate the entertainment and trash datasets. It also does not check whether quotations are historically authentic or independently confirm their source references.

The tests do not replace production database verification, real multi-connection concurrency tests, or end-to-end browser gameplay tests.

[GitHub Actions](.github/workflows/ci.yml) runs installation, tests, type checking, linting, quote-data validation, and the production build on pushes to `main` and pull requests targeting `main`.

## Deployment and database

The public application is hosted at:

**https://chi-l-ha-detto.vercel.app/**

The Vercel project is connected to the repository's `main` branch. The configured architecture uses a Vercel Function in Frankfurt (`fra1`) and a Neon PostgreSQL database in the Frankfurt region.

The current database was migrated from an earlier Supabase/Render architecture. Historical migration and import utilities remain in the repository for reference and carefully scoped future operations.

**Do not run `db:migrate` or `db:import` against the already provisioned production database.** The historical production schema differs from the new-database schema supplied with the migration utilities.

Operational references:

- [Vercel and Neon deployment guide](DEPLOY_GUIDE.md)
- [Leaderboard API, persistence, and fallback](LEADERBOARD_README.md)
- [Database migration and rollback notes](DATABASE_MIGRATION_README.md)
- [Historical production verification record](MIGRATION_STATUS.md)

The [`docs/`](docs/) directory retains an older GitHub Pages build. It is not the current Vercel application and is excluded from the supported deployment.

## Repository structure

| Path | Purpose |
| --- | --- |
| [`src/components/`](src/components/) | Game interface, question flow, and leaderboard UI |
| [`src/data/`](src/data/) | Quotation datasets and character-image mappings |
| [`src/lib/`](src/lib/) | Frontend leaderboard client and local cache |
| [`api/`](api/) | Vercel Function entry point |
| [`backend/`](backend/) | Database access, ranking queries, and validation |
| [`shared/`](shared/) | Shared leaderboard types and ordering rules |
| [`tests/`](tests/) | Automated leaderboard and API tests |
| [`migrations/`](migrations/) | Database schema utilities |
| [`scripts/`](scripts/) | Data validation, local API, and migration tools |
| [`public/images/`](public/images/) | Character portraits, backgrounds, icons, and preview artwork |

## Content rights and reuse

This repository does **not** currently provide an explicit open-source license granting general permission to reuse, modify, or redistribute its code and content.

Its quotation texts, translations, character portraits, entertainment references, and graphical assets may involve separate rights held by their respective creators or other rights holders. The repository does not currently contain a complete asset-by-asset provenance and licensing record.

Public access to this repository should not be interpreted as permission to reuse third-party material. Verify the applicable rights and obtain any necessary authorization before redistribution.
