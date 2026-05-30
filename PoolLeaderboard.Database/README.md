# Database

The database schema is managed using [Flyway](https://flywaydb.org/) migrations. Migration SQL files live in the `migrations/` directory, named following Flyway's convention: `V{version}__{description}.sql`.

## Deploy

Run the `deploy.sh` script to apply any pending migrations to the database:

```bash
./PoolLeaderboard.Database/deploy.sh
```

The script waits for PostgreSQL to be ready before running, so it is safe to call immediately after the container starts.

It reads the following environment variables (with the defaults shown):

| Variable      | Default               | Description                |
|---------------|-----------------------|----------------------------|
| `DB_HOST`     | `db`                  | PostgreSQL host            |
| `DB_PORT`     | `5432`                | PostgreSQL port            |
| `DB_USER`     | `postgres`            | PostgreSQL user            |
| `DB_PASSWORD` | `YourStrong!Passw0rd` | PostgreSQL password        |
| `DB_NAME`     | `leaderboard`         | Database name              |

These are set automatically in the devcontainer via `docker-compose.yml`.

## Adding a migration

Create a new file in `migrations/` following the naming pattern:

```
V2__describe_your_change.sql
```

Flyway tracks which migrations have already been applied, so only new files will be run.

## Query the dev database

`psql` is preinstalled in the devcontainer. Connect with:

```bash
psql -h db -U postgres -d leaderboard
```

Enter the password `YourStrong!Passw0rd` when prompted.

You can also connect from outside the devcontainer using the forwarded port:

```bash
psql -h localhost -p 5432 -U postgres -d leaderboard
```
