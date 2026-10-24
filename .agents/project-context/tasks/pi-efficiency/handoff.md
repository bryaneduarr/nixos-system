# Pi efficiency

- Updated 2026-10-23 UTC; revision `0984f6d` plus uncommitted changes. Owner: Claude Code session. Status: implemented, not committed, not activated.
- Objective: make Pi cheaper and more reliable. User-confirmed: no harness orchestration; selected model runs; 300k compaction cap on 1M models; built-in MCP; AWS skills moved to `~/.agents/skills-disabled/aws/`.
- Changes: `run` turns leading `cd` into `cwd`; DeepSeek argument repair; `task` fixed for `claude-bridge`; `search`/`edit` call fff, LSP, tree-sitter ([backend search](../../../../packages/pi/agent-configuration/harness/services/tools/search/backend-search.service.ts)); `/session-stats`.
- Checked: `check-code` clean; targets evaluate; flake check passes; `pi -p` subagents worked. `pi-ast-grep` is unloaded but stays in `package.json`.
- Unverified: built-in MCP/codemode, vtsls diagnostics before activation.
- Blocker: none. Next: activate, sign in to Notion via `/mcp`, run `/session-stats` after a week.
