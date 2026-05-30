#!/bin/bash
set -e

echo "Waiting for PostgreSQL at ${PGHOST}:${PGPORT:-5432}..."
until pg_isready -h "${PGHOST}" -p "${PGPORT:-5432}" -U "${PGUSER}" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "Running Flyway migrations..."
/flyway/flyway \
  -url="jdbc:postgresql://${PGHOST}:${PGPORT:-5432}/${PGDATABASE}" \
  -user="${PGUSER}" \
  -password="${PGPASSWORD}" \
  -locations="filesystem:/app/migrations" \
  migrate

echo "Starting PoolLeaderboard..."
exec dotnet PoolLeaderboard.Server.dll
