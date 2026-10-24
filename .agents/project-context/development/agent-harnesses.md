# Agent harnesses

Evidence: 2026-10-23 UTC; `0984f6d` plus uncommitted; bridge subagents ran via `pi -p`.

- Pi reads [AGENTS.md](../../../AGENTS.md) and `.agents/skills/`.
- Claude Code reads [CLAUDE.md](../../../CLAUDE.md), which imports `AGENTS.md`, and `.claude/skills`, symlinked to `.agents/skills`; edit skills only there.
- `packages/pi/agent-configuration/skills/` are runtime Pi skills, separate from `.agents/skills/`.
- `pi-claude-bridge` (`provider.plan = "max"`) needs `programs.nix-ld` and rejects system prompts not embedding a recorded parent prompt.
- Pi auto-loads `~/.agents/skills`; unused skills live in `~/.agents/skills-disabled/`.
- `.gitignore` excludes `.pi/` and `.claude/settings.local.json`.
