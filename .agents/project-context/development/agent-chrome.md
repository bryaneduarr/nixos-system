# Agent Chrome

Evidence: 2026-10-21 UTC; `0984f6d` plus uncommitted module; targets evaluate, packages built, not activated.

- [scripts/agent-chrome](../../../scripts/agent-chrome/agent-chrome.home.nix) installs `agent-chrome` (isolated headed Chrome per name, loopback debug port) and `agent-chrome-mcp` (pinned `chrome-devtools-mcp`).
- Activation merges the `chrome` and `chrome-isolated` servers into the Claude Code, OpenCode, and Pi MCP files because those apps rewrite them.
- Enabled on desktop only. RTX 4080 WebGL was seen with hand-installed copies.
