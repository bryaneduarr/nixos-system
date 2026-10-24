# Pi subagent inspector

- 2026-10-23 UTC; `0984f6d` plus uncommitted changes. Owner: Claude Code session. Status: implemented, uncommitted, not activated.
- Objective: Alt+I shows a subagent table; `l`, right arrow, or Enter opens one subagent with its full tool history as a tree with start times; the card never shows Done mid-run; no Messages page.
- Fixed: model, reasoning, tokens, and child calls showed as unknown/0 because [result fields](../../../../packages/pi/agent-configuration/harness/services/activity/parsing/tool-result/read-tool-result-fields.service.ts) read flat shapes instead of parsed task progress.
- Checked: `check-code` clean, rule audit 0 findings, Pi tests pass (one markdown test needs `COLORTERM=truecolor`). Not seen on screen.
- Blocker: none. Next: rebuild Home Manager, open Alt+I with real subagents.
