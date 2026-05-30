#!/bin/bash

# Set working directory to the script's location
cd "$(dirname "$0")"

# Wait for PostgreSQL to be ready
until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" 2>/dev/null; do
  echo 'Waiting for PostgreSQL...'
  sleep 1
done

echo 'Deploying migrations...'
flyway \
  -url="jdbc:postgresql://${DB_HOST:-db}:${DB_PORT:-5432}/${DB_NAME:-leaderboard}" \
  -user="${DB_USER:-postgres}" \
  -password="${DB_PASSWORD:-YourStrong!Passw0rd}" \
  -locations="filesystem:$(pwd)/migrations" \
  migrate
