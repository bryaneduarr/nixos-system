# Pi turn history and scroll on submit

- 2026-10-23 UTC; `0984f6d` plus uncommitted changes. Owner: Claude Code session. Status: implemented, not committed, not activated.
- Objective: scroll to the bottom on submit; show only the focused turn, with `Alt+T` menu, `Alt+H` toggle, and dividers. Local plan (untracked): `.agents/plans/hide-previous-turns/`.
- Sources: [turn window patch](../../../../packages/pi/pi-tools/patches/pi-coding-agent/turn-navigation/patch-pi-turn-window.ts), [submit patch](../../../../packages/pi/pi-tools/patches/pi-coding-agent/turn-navigation/patch-pi-scroll-on-submit.ts), [turn services](../../../../packages/pi/agent-configuration/harness/services/transcript/turn/).
- Checked: `check-code` clean, 196 tests, three targets evaluate, `pi-tools` builds from a clean copy with both patches.
- Limits: rendering, scrolling, and `Alt+T` Enter were not seen live. Turns map by count from the end.
- Blocker: none. Next: rebuild Home Manager and try both shortcuts in a long session.
