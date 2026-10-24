# Pi tool reliability

- Updated 2026-10-23 UTC; revision `0984f6d` plus uncommitted changes. Owner: Claude Code session. Status: implemented, not committed, not activated.
- Evidence: session JSONL in `~/.pi/agent/sessions` joined per tool call; fixes in [quiet output](../../../../packages/pi/agent-configuration/extensions/quiet-tool-output.extension.ts), harness `read`, `edit`, `search`, `run` services.
- Objective: make Pi tool calls reliable. Pi now installs its shell tools ([packages](../../../../packages/pi/home-manager/installed-packages.nix)); `run` guidelines prefer `fd`, `rg`, `ast-grep`, `jq`, `yq`.
- Checked: `check-code` clean; Pi tests pass (145); all three targets evaluate. Runtime behavior not observed.
- Corrected 2026-10-23: subagent `claude-bridge` failures were a harness bug, not an outage; fixed in [pi-efficiency](../pi-efficiency/handoff.md).
- Blocker: none. Next: user rebuilds Home Manager, then checks that a plain `read` of a small file returns it whole.
