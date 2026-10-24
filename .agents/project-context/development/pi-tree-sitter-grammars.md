# Pi tree-sitter grammars

- 2026-10-23 UTC, `0984f6d` plus uncommitted work; source-inspected and checked by execution.
- `pi-tree-sitter@0.2.8` maps Lua to a `tree-sitter-wasms` build that `web-tree-sitter` 0.26 rejects in `getDylinkMetadata`, so Pi reported "Failed to load tree-sitter grammar for Lua". [Patch](../../../packages/pi/pi-tools/patches/pi-extension-packages/patch-pi-tree-sitter-grammars.ts) points Lua at `@tree-sitter-grammars/tree-sitter-lua`; swift, toml, yaml, and vue still use the rejected source.
- Checked: the built package downloads and parses Lua without errors.
