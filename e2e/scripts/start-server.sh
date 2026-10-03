#!/bin/bash
# Starts the app for E2E tests against a throwaway database:
#   1. drops and recreates $E2E_DB_NAME (dev data in $DB_NAME is never touched)
#   2. applies the real Flyway migrations to it
#   3. publishes the server (which builds the Angular SPA into wwwroot) and runs it on $E2E_PORT
# Playwright's webServer runs this automatically; run it by hand (or via the "Start E2E Server"
# VS Code task) to keep a server up between test runs.
set -euo pipefail
cd "$(dirname "$0")/../.."

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-YourStrong!Passw0rd}"
E2E_DB_NAME="${E2E_DB_NAME:-leaderboard_e2e}"
E2E_PORT="${E2E_PORT:-5180}"
export PGPASSWORD="$DB_PASSWORD"

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; do
  echo 'Waiting for PostgreSQL...'
  sleep 1
done

echo "Recreating database $E2E_DB_NAME..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 \
  -c "DROP DATABASE IF EXISTS $E2E_DB_NAME WITH (FORCE)" \
  -c "CREATE DATABASE $E2E_DB_NAME"

DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" DB_USER="$DB_USER" DB_PASSWORD="$DB_PASSWORD" DB_NAME="$E2E_DB_NAME" \
  ./PoolLeaderboard.Database/deploy.sh

echo 'Publishing server...'
dotnet publish PoolLeaderboard.Server -c Release -o artifacts/e2e

export ConnectionStrings__DefaultConnection="Host=$DB_HOST;Port=$DB_PORT;Database=$E2E_DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD"
export ASPNETCORE_ENVIRONMENT=E2E
export ASPNETCORE_URLS="http://0.0.0.0:$E2E_PORT"

echo "Starting server on port $E2E_PORT..."
cd artifacts/e2e
exec dotnet PoolLeaderboard.Server.dll
