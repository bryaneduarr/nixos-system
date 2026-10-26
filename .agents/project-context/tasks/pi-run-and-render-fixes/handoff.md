# Pi run directory and boxed rendering

- 2026-10-23 UTC; `0984f6d` plus uncommitted changes. Owner: Pi session. Status: implemented, not committed, not activated.
- Objective: verify the harness after a rebuild and fix the Lua grammar error, the missing `run` cwd, and boxes for codemode, thinking, and warnings.
- Sources: [run directory](../../../../packages/pi/agent-configuration/harness/services/tools/run/prepare-run-directory.service.ts), [tree-sitter patch](../../../../packages/pi/pi-tools/patches/pi-extension-packages/pi-tree-sitter-grammars.patch.ts), [thinking patch](../../../../packages/pi/pi-tools/patches/pi-coding-agent/transcript-rendering/pi-thinking-box.patch.ts), codemode framing services.
- Checked: full test suite, `tsc`, `biome ci`, rule audit, shellcheck; the piTools build applies both patches and parses Lua; three targets evaluate.
- Limits: screen rendering and cwd creation in a live session were not observed.
- Next: rebuild Home Manager, then check a codemode call, a thinking block, a warning, and a run in a missing directory.
