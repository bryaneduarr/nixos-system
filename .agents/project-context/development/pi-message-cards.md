# Pi message cards and visual replies

- 2026-10-23 UTC, `0984f6d` plus uncommitted work.
- Source-inspected: [card constants](../../../packages/pi/agent-configuration/harness/constants/transcript/message-card.constant.ts). Thinking uses the tool-box `+--` frame; other cards stay rounded.
- Codemode shows a summarized `+--` box via [codemode renderer](../../../packages/pi/agent-configuration/harness/services/tool-rendering/codemode/renderers/create-codemode-renderers.service.ts).
- Pitfall: a `registerToolRenderer` resolver must return `next()` for tools it ignores, or every tool shows raw JSON.
- Checked: `check-code`, Pi tests. Not seen on screen.
