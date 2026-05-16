---
name: branch-and-pr
description: Move uncommitted work off main onto a feature branch, push it, and open a GitHub PR — all in one shot. Use when the user asks to "raise a PR", "make a PR", "open a PR", "ship this", or otherwise wants the current changes pushed and proposed for review. Also use when they say something like "branch this off as RC/Foo and PR it". Pushy default: if the user names a branch and asks for a PR in one breath, just run this skill — don't ask whether they want a PR separately.
---

# branch-and-pr

End-to-end flow: take pending changes on `main` (or any non-feature branch), move them to a feature branch, push to origin, and open a PR via the GitHub MCP.

## When to use

- "make a branch called X, push, and raise a PR"
- "PR this", "ship this", "open a PR"
- The user describes a fix and then says "let's get it reviewed" / "raise it"

Skip this skill if:
- There are no changes to ship (`git status` is clean and HEAD == origin/main) — say so instead of inventing work.
- The user only wants a branch, not a PR — just `git checkout -b`.
- The PR target is not GitHub (no GitHub remote, or the user wants GitLab/Bitbucket) — do it manually with the host's CLI.

## Required inputs

Before running, you need:

1. **Branch name** — Required. Ask if not provided. Respect the repo's convention (look at `git branch -a` for a hint; this repo uses `<CodersInitials>/<PascalCase>`).
2. **Linked issue number** — Optional but ask if not provided. If the user mentions an issue ("linked to #33", "closes 33"), include `Closes #N` in the PR body so GitHub auto-closes it on merge.
3. **PR title** — If not given, derive a short one from the changes / commit message (under 70 chars).

If any of these are ambiguous, ask **before** committing — don't push a half-formed branch.

## Steps

Run these in order. Stop and report if any step fails.

### 1. Sanity-check the working tree

```bash
git status
git diff --stat
git rev-parse --abbrev-ref HEAD
```

- If `git status` is fully clean, there's nothing to ship — stop.
- If already on a non-`main` branch, **don't** create a new one; reuse the current branch.
- If on `main` with uncommitted changes, proceed.
- If on `main` with no uncommitted changes but commits ahead of origin/main, branching is still valid (carry the commits onto the new branch).

### 2. Create the branch (only if on main)

```bash
git checkout -b <branch-name>
```

### 3. Stage and commit

Stage **specific files** — never `git add -A` or `git add .` (avoid accidentally committing secrets or build artefacts).

```bash
git add <path1> <path2> ...
git commit -m "$(cat <<'EOF'
<short subject line>

<optional body — why, not what>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Match the repo's commit-message style — check `git log --oneline -10` first if unsure.

### 4. Push

```bash
git push -u origin <branch-name>
```

If the push is rejected (e.g. branch exists upstream with diverged history), stop and ask — don't `--force`.

### 5. Open the PR via the GitHub MCP

Resolve the owner/repo from `git remote get-url origin` (parse the GitHub URL).

Use `mcp__github__create_pull_request`:

- `owner`, `repo` — from the remote URL.
- `head` — the new branch.
- `base` — `main` (or whatever the repo's default branch is; check via `git symbolic-ref refs/remotes/origin/HEAD` if unsure).
- `title` — short, under 70 chars.
- `body` — see template below. If a linked issue was provided, the **first line** must be `Closes #N` (or `Fixes #N`) so GitHub picks up the link.

### PR body template

```markdown
Closes #<N>.    <!-- omit this line if no linked issue -->

## Summary

<1–3 sentences on what changed and why.>

## Test plan

- [ ] <verification step>
- [ ] <verification step>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 6. Report back

Give the user the PR URL (from the MCP response's `html_url`). One line is enough.

## Failure modes to watch for

- **GitHub MCP isn't loaded.** The `mcp__github__create_pull_request` tool is deferred — load it via `ToolSearch` with `select:mcp__github__create_pull_request` before calling. If it's not available at all, fall back to `gh pr create`.
- **Remote name isn't `origin`.** Check `git remote` first.
- **Owner case mismatch.** GitHub URLs are case-insensitive in the browser but the MCP is case-sensitive. Use the casing from `git remote get-url origin` exactly.
- **Default branch isn't `main`.** Don't hardcode — derive it.
- **Pre-commit hook failure.** Don't `--no-verify`. Fix the underlying issue, re-stage, and create a **new** commit (never `--amend` past a hook failure).

## Don't

- Don't push to `main` directly — the whole point is to land on a feature branch.
- Don't force-push.
- Don't open the PR as draft unless the user asked.
- Don't invent an issue number — only include `Closes #N` if the user gave one or you've confirmed it exists.
