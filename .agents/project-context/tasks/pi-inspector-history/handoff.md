# Pi inspector history page

- Updated 2026-10-22 UTC; revision `0984f6d` plus uncommitted changes. Owner: Claude Code session. Status: implemented, not committed, not activated.
- Objective: add a history page to the inspector. Local plan (untracked): `.agents/plans/inspector-history-page/`. Sources: [row builder](../../../../packages/pi/agent-configuration/harness/services/inspector/navigation/build-inspector-rows.service.ts), [turn recorder](../../../../packages/pi/agent-configuration/harness/services/activity/record/record-assistant-turn.service.ts).
- Checked: `check-code` clean; Pi tests pass (120). Not seen on screen.
- Unknown: speed with very long sessions; the extensions in the plan are not built.
- Blocker: none. Next: user rebuilds, opens Alt+I then `4`, and checks replies, thinking, and token rows.
