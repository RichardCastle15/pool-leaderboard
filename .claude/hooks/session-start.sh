#!/bin/bash
# SessionStart hook for Claude Code cloud sessions: gives the sandbox the same toolchain as the devcontainer
# (.NET 10 SDK, Flyway, PostgreSQL reachable as `db`, npm deps, Playwright browsers, Playwright MCP) so builds,
# all three test suites and the Playwright MCP work. Idempotent; does nothing outside cloud sessions.
#
# Sandbox network notes: builds.dotnet.microsoft.com and the Playwright browser CDN are blocked, so the .NET SDK
# comes from Ubuntu's apt archive and Playwright uses the pre-installed Chromium in $PLAYWRIGHT_BROWSERS_PATH.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
log() { echo "[session-start] $*" >&2; }

FLYWAY_VERSION=9.22.3        # same as .devcontainer/Dockerfile and the bug-triage workflow
PLAYWRIGHT_MCP_VERSION=0.0.83 # same as .devcontainer/Dockerfile and .mcp.json expectations
PG_DATA=/var/lib/postgresql/pool-leaderboard
DB_PASSWORD='YourStrong!Passw0rd' # devcontainer default, so scripts/tests need no env overrides

# --- .NET 10 SDK -------------------------------------------------------------------------------------------
if ! command -v dotnet >/dev/null 2>&1 || ! dotnet --list-sdks | grep -q '^10\.'; then
  log "Installing .NET 10 SDK from apt..."
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq dotnet-sdk-10.0 >/dev/null
fi

# --- Flyway (bundles its own JRE) ---------------------------------------------------------------------------
if [ ! -x "/opt/flyway-$FLYWAY_VERSION/flyway" ]; then
  log "Installing Flyway $FLYWAY_VERSION..."
  curl -fsSL "https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/$FLYWAY_VERSION/flyway-commandline-$FLYWAY_VERSION-linux-x64.tar.gz" \
    | tar -xz -C /opt
  chmod a+rx "/opt/flyway-$FLYWAY_VERSION/flyway"
fi
ln -sf "/opt/flyway-$FLYWAY_VERSION/flyway" /usr/local/bin/flyway

# --- PostgreSQL, reachable as db:5432 like in the devcontainer ------------------------------------------------
grep -qE '^127\.0\.0\.1\s+db(\s|$)' /etc/hosts || echo '127.0.0.1 db' >> /etc/hosts
PG_BIN=$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)
if [ ! -s "$PG_DATA/PG_VERSION" ]; then
  log "Initialising PostgreSQL cluster..."
  mkdir -p "$PG_DATA" && chown postgres:postgres "$PG_DATA"
  su postgres -c "$PG_BIN/initdb -D $PG_DATA -U postgres --auth=trust" >/dev/null
fi
mkdir -p /var/run/postgresql && chown postgres:postgres /var/run/postgresql
if ! "$PG_BIN/pg_isready" -h localhost -p 5432 -q; then
  log "Starting PostgreSQL..."
  su postgres -c "$PG_BIN/pg_ctl -D $PG_DATA -l $PG_DATA/server.log -o '-p 5432 -k /var/run/postgresql' -w start" >/dev/null
fi
export PGPASSWORD="$DB_PASSWORD"
psql -h db -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'leaderboard'" | grep -q 1 \
  || psql -h db -U postgres -qc 'CREATE DATABASE leaderboard'
./PoolLeaderboard.Database/deploy.sh > /tmp/session-start-flyway.log 2>&1 \
  || { cat /tmp/session-start-flyway.log >&2; exit 1; }

# --- npm dependencies -----------------------------------------------------------------------------------------
log "Installing npm dependencies..."
# Hook stdout becomes session context, so keep tool chatter on stderr.
(cd poolleaderboard.client && npm install --no-audit --no-fund --loglevel=error) >&2
(cd e2e && npm install --no-audit --no-fund --loglevel=error) >&2

# --- Playwright MCP (.mcp.json runs `playwright-mcp`) ------------------------------------------------------------
if [ "$(npm ls -g --depth=0 @playwright/mcp 2>/dev/null | grep -o "@playwright/mcp@[^ ]*" || true)" != "@playwright/mcp@$PLAYWRIGHT_MCP_VERSION" ]; then
  log "Installing Playwright MCP $PLAYWRIGHT_MCP_VERSION..."
  npm install -g --no-audit --no-fund --loglevel=error "@playwright/mcp@$PLAYWRIGHT_MCP_VERSION" >&2
fi

# --- Playwright browsers ------------------------------------------------------------------------------------------
# The CDN is blocked, so point whichever Chromium revision each Playwright install expects at the newest
# pre-installed build. Directory layouts differ between Playwright versions, so link both known layouts.
BROWSERS="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"
# Real files only (-type f), so links made by an earlier run are never picked as the source.
SRC_CHROME=$(find "$BROWSERS" -maxdepth 3 -type f -path '*/chromium-[0-9]*/chrome-linux/chrome' 2>/dev/null | sort -V | tail -1)
SRC_SHELL=$(find "$BROWSERS" -maxdepth 3 -type f -path '*/chromium_headless_shell-[0-9]*/chrome-linux/headless_shell' 2>/dev/null | sort -V | tail -1)
link_browsers_for() { # $1 = a playwright-core package directory
  local rev
  rev=$(node -e "const b=require('$1/browsers.json').browsers;console.log(b.find(x=>x.name==='chromium').revision)" 2>/dev/null) || return 0
  if [ -n "$SRC_CHROME" ] && [ ! -e "$BROWSERS/chromium-$rev/INSTALLATION_COMPLETE" ]; then
    mkdir -p "$BROWSERS/chromium-$rev/chrome-linux64" "$BROWSERS/chromium-$rev/chrome-linux"
    ln -sf "$SRC_CHROME" "$BROWSERS/chromium-$rev/chrome-linux64/chrome"
    ln -sf "$SRC_CHROME" "$BROWSERS/chromium-$rev/chrome-linux/chrome"
    touch "$BROWSERS/chromium-$rev/INSTALLATION_COMPLETE" "$BROWSERS/chromium-$rev/DEPENDENCIES_VALIDATED"
  fi
  if [ -n "$SRC_SHELL" ] && [ ! -e "$BROWSERS/chromium_headless_shell-$rev/INSTALLATION_COMPLETE" ]; then
    mkdir -p "$BROWSERS/chromium_headless_shell-$rev/chrome-headless-shell-linux64" "$BROWSERS/chromium_headless_shell-$rev/chrome-linux"
    ln -sf "$SRC_SHELL" "$BROWSERS/chromium_headless_shell-$rev/chrome-headless-shell-linux64/chrome-headless-shell"
    ln -sf "$SRC_SHELL" "$BROWSERS/chromium_headless_shell-$rev/chrome-linux/headless_shell"
    touch "$BROWSERS/chromium_headless_shell-$rev/INSTALLATION_COMPLETE" "$BROWSERS/chromium_headless_shell-$rev/DEPENDENCIES_VALIDATED"
  fi
}
link_browsers_for "$CLAUDE_PROJECT_DIR/e2e/node_modules/playwright-core"
for core in $(find "$(npm root -g)/@playwright/mcp" -type d -name playwright-core -path '*node_modules*' 2>/dev/null); do
  link_browsers_for "$core"
done

# Karma's ChromeHeadlessCI launcher needs a Chrome binary (the devcontainer uses puppeteer's).
if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -n "$SRC_CHROME" ]; then
  grep -q '^export CHROME_BIN=' "$CLAUDE_ENV_FILE" 2>/dev/null || echo "export CHROME_BIN=$SRC_CHROME" >> "$CLAUDE_ENV_FILE"
fi

# --- .NET restore -----------------------------------------------------------------------------------------------------
log "Restoring .NET packages..."
dotnet restore PoolLeaderboard.sln -v quiet >/dev/null

log "Done."
