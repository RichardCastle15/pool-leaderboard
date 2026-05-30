# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is an ASP.NET Core (`net10.0`) + Angular 19 SPA generated from the standard MS template, plus a PostgreSQL database project. Four C# projects + one Angular project sit side-by-side in the solution:

- `PoolLeaderboard.Server/` — ASP.NET Core host (controllers, SignalR hubs, DI wiring, `Program.cs`, Dockerfile). Has a `ProjectReference` to the Angular `.esproj` so a `dotnet build` also builds the SPA.
- `PoolLeaderboardEngine/` — pure-domain class library (Elo, Killer game state machine, leaderboard/match repositories, `IDbConnectionFactory`). No ASP.NET dependencies. The server depends on this; the Npgsql connection factory lives in the server project.
- `PoolLeaderboard.Server.Test/` — xUnit + NSubstitute tests for controllers and `KillerGameService`.
- `PoolLeaderboardEngine.Test/` — xUnit + NSubstitute tests for engine internals.
- `PoolLeaderboard.Database/` — Flyway migration project. `deploy.sh` applies pending migrations via Flyway. Schema lives in `migrations/V*.sql` files.
- `poolleaderboard.client/` — Angular 19 app using **Nebular** components and **Eva Icons**. Built artifacts get served by ASP.NET in production via `MapStaticAssets()` + `MapFallbackToFile("/index.html")`.

## Common commands

Most day-to-day work happens through the VS Code `Run and Debug` profiles (`Debug Backend`, `Debug Angular Frontend`, `Debug Fullstack`). The CLI equivalents:

```bash
# Build everything (also builds the Angular SPA via the project reference)
dotnet build

# Build backend only without running npm install (matches the VS Code task)
dotnet build PoolLeaderboard.Server -p:ShouldRunNpmInstall=false

# Run all .NET tests
dotnet test

# Run a single .NET test by fully-qualified name or substring
dotnet test --filter "FullyQualifiedName~EloCalculatorTests"
dotnet test PoolLeaderboardEngine.Test --filter "DisplayName~Pot"

# Frontend dev server (proxies /api, /leaderboardHub, /killerHub, /exampleHub to the backend)
cd poolleaderboard.client && npm start              # ng serve --host=0.0.0.0

# Frontend tests
cd poolleaderboard.client && npm test               # interactive Karma/Jasmine
cd poolleaderboard.client && npm run test:ci        # ChromeHeadless, single run (used in CI)

# Database: apply Flyway migrations to the dev PostgreSQL container
./PoolLeaderboard.Database/deploy.sh                # uses $DB_HOST/$DB_PORT/$DB_USER/$DB_PASSWORD/$DB_NAME
```

A single ng test for one spec: `cd poolleaderboard.client && npx ng test --include='**/elo.spec.ts'` (drop `--watch=false --browsers=ChromeHeadlessCI` to run headless).

## Architecture: how a result flows end-to-end

Two write paths feed the leaderboard, both broadcast updates through SignalR rather than relying on the client to poll:

1. **1v1 match** — `POST /api/match` (`MatchController.RecordResult`)  loads both players, calls `EloCalculator.Compute(winner, loser)`, writes `UpdateRating` for each player and an `Add` to the match table, then broadcasts the new leaderboard via `IHubContext<LeaderboardHub>` → `"ReceiveLeaderboard"`.
2. **Killer game** — multi-player elimination game. `KillerGameService` is a **singleton** holding at most one in-progress `KillerGame` (the engine class). Clients drive it through `KillerHub` methods (`Pot`, `Miss`, `EarlyBlackPot`, `Undo`, `Abandon`); each hub method runs the action, then broadcasts `"ReceiveKillerGame"` to all clients. `POST /api/killer` starts a game; `DELETE /api/killer` (`ConfirmEnd`) settles the leaderboard: winner gets `+10 * (playerCount - 1)`, every loser gets `-10`.

Key design points worth knowing before changing things:

- **EloCalculator is duplicated** in [PoolLeaderboardEngine/src/Elo/EloCalculator.cs](PoolLeaderboardEngine/src/Elo/EloCalculator.cs) and [poolleaderboard.client/src/app/leaderboard/services/elo.ts](poolleaderboard.client/src/app/leaderboard/services/elo.ts) so the record-result dialog can show a preview. The C# file has a comment flagging this — keep both implementations in sync (constants `K=100`, clamp `[5, 95]`, `expected = 1 / (1 + 10^((loser - winner)/400))`).
- **Killer engine uses a command pattern** ([PoolLeaderboardEngine/src/Killer/GameActions/](PoolLeaderboardEngine/src/Killer/GameActions/)): each action implements `IGameAction.Apply(state)` / `Undo(state)` and is pushed onto a `Stack<IGameAction>` so `Undo()` is just pop-and-reverse. When adding a new action, follow the existing pattern (ApplyImpl on `BaseGameAction`) so undo works. Sudden-death has its own internal state enum (`SuddenDeathState.NotActive | ActiveWithNoPots | ActiveWithPots`).
- **`KillerGameService` is the concurrency boundary.** It holds a single `_currentGame` plus the player roster and serialises every operation behind an `object _lock`. The engine itself is not thread-safe — do not bypass the service.
- **DTOs vs. engine types.** The engine's `KillerGameState` is internal-shaped (e.g. `internal SuddenDeathState`); the wire shape is `KillerGameStateDto` / `KillerGameRowDto` in `KillerGameService.cs`. When changing the engine's state, update the mapping in `GetStateDto()`.
- **DB access is raw ADO.NET via `IDbConnectionFactory`** (no EF, no Dapper). Repositories open a connection per call, parameterise queries manually, and read columns by name. The connection string comes from `ConnectionStrings:DefaultConnection`, set in the devcontainer Dockerfile (`Host=db;Port=5432;Database=leaderboard;...`).
- **SQL constraints must be explicitly named.** When writing SQL schema files (in `PoolLeaderboard.Database/migrations/`), always name all foreign key, primary key, and other constraints explicitly (e.g., `CONSTRAINT fk_match_player_id FOREIGN KEY (player_id) ...`). Flyway requires idempotent migrations; named constraints make re-runs safe.
- **The `match` table name is a reserved keyword in PostgreSQL** and must always be quoted as `"match"` in SQL queries and DDL.
- **SignalR error channel.** Hubs catch their own exceptions and emit `LeaderboardError` / `KillerError` to `Clients.Caller`. The Angular services subscribe to those alongside the data events.

## Frontend architecture

- **Presenter/container pattern.** `*-container.component.ts` files own state, services, and SignalR subscriptions. Presenters under `presenters/` and `killer/killer.component.ts` are pure inputs/outputs. Don't put business logic in presenters — they're also rendered in the **component showcase** (routes only registered when `environment.production === false`, see [src/app/app-routing.module.ts](poolleaderboard.client/src/app/app-routing.module.ts)). Each presenter state should have a corresponding showcase entry under `src/app/component-showcase/`.
- **SignalR connections.** Each container creates its own hub connection through a service (`LeaderboardService.connect()`, `KillerService` similarly). The proxy ([src/proxy.conf.js](poolleaderboard.client/src/proxy.conf.js)) forwards `/api`, `/leaderboardHub`, `/killerHub`, `/exampleHub` from the Angular dev server to the backend.
- **Adding a new backend endpoint** requires updating `proxy.conf.js` if it's not under one of the existing context paths, and restarting the Angular dev server.
- **UI library is Nebular** (`@nebular/theme`, `@nebular/eva-icons`). Prefer Nebular components over hand-rolled equivalents.
- For frontend color/theming guidance, see `poolleaderboard.client/CLAUDE.md`.

## Dev environment

Devcontainer (`.devcontainer/docker-compose.yml`) runs two containers: the dev container (.NET 10 SDK, Node 20, Angular CLI, `psql`, Flyway) and a `db` container (PostgreSQL 17) reachable as `db:5432` from inside, `localhost:5432` from the host. The `postCreateCommand` does `dotnet restore`, builds, trusts the dev cert, installs puppeteer's chrome, and runs `deploy.sh` to apply Flyway migrations. Forwarded ports: 60125 (Angular), 5166 (HTTP backend), 7114 (HTTPS backend).

To query the dev DB: `psql -h db -U postgres -d leaderboard` (password: `YourStrong!Passw0rd`).

## CI / deploy

[`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml) on push to `main`: runs `npm run test:ci`, then builds the `test` stage of [PoolLeaderboard.Server/Dockerfile](PoolLeaderboard.Server/Dockerfile) (which runs `dotnet test` inside Docker), then builds and pushes `ghcr.io/richardcastle15/poolleaderboard:latest`. Failing tests block the image push.
