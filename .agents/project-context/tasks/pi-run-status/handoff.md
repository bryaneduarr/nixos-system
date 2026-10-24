# Pi run status

- 2026-10-23 UTC; `0984f6d` plus uncommitted changes. Owner: Claude Code session. Status: fixed, uncommitted, not activated. Blocker: none.
- Objective: `run` calls that exit 0 must not show as errors in the inspector or tool boxes.
- Cause (source-inspected, reproduced by test): [result failed](../../../../packages/pi/agent-configuration/harness/services/tool-rendering/presentation/result-failed.service.ts) let `\s*` backtrack, so `exit: 0` matched as failed. The atlas session JSONL records `isError: false` and full output; later calls reuse IDs from it.
- Checked: `check-code` clean; Pi tests pass (139); three targets evaluate; replaying the atlas session flips 48 of 49 `run` results to success. Runtime not observed.
- Next: user rebuilds Home Manager, restarts Pi, checks the inspector.
