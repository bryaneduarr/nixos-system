# Agent harnesses

Evidence: 2026-10-15 UTC; `32ac1c9`; uncommitted harness files below; source-inspected, Claude Code discovery not runtime-verified.

- Pi reads [AGENTS.md](../../../AGENTS.md) and `.agents/skills/` directly.
- Claude Code reads [CLAUDE.md](../../../CLAUDE.md), which imports `AGENTS.md` with `@AGENTS.md`.
- `.claude/skills` symlinks to `.agents/skills`; edit skills only there.
- `packages/pi/agent-configuration/skills/` are runtime Pi skills installed by Home Manager, separate from `.agents/skills/`.
- `.gitignore` excludes `.pi/` state and `.claude/settings.local.json`.
