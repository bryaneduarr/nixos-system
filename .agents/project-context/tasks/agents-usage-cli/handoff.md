# Agents usage CLI

- Date: 2026-10-26 UTC; revision `85751bf`; changes uncommitted (`scripts/agents/`, `.gitignore`, both `hosts/*/*.home.nix`).
- Objective: `agents --usage` cards. User narrowed scope to Claude Code and OpenCode Go; Codex and Antigravity were removed ([plan](../../../plans/agents-usage-cli/goal.md) still lists four).
- Status: built. `check-code scripts/agents` clean, 187 tests pass, three targets evaluate, package builds, real run about 0.5s. Not activated.
- OpenCode Go key comes from Pi's `~/.pi/agent/auth.json`; OpenCode's own `auth.json` key is expired. `percent` is assumed to mean used.
- Open: HTTP 403 counts as `login-expired`; `services/runtime/` mixes terminal and adapter code; OpenCode provider has no separate review.
- Next: commit.
