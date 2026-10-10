# Pi configuration

- `agent-configuration/extensions/` contains independent Pi extensions.
- `agent-configuration/harness/tools/` implements repository tools.
- `agent-configuration/harness/activity/` stores activity state.
- `agent-configuration/harness/ui/` renders activity and tool details.
- `agent-configuration/settings/` defines JSON settings installed by Home Manager.
- `agent-configuration/themes/` contains themes.
- `agent-configuration/skills/` contains the Efficient Tools and Web Research skills used by the Pi harness.
- The repository root `.agents/skills/` belongs to coding harnesses. Home Manager does not read or install it.
- `home-manager/` installs files and configures Pi. `pi-tools/` packages dependencies. `tests/` contains extension tests.

`home-manager/managed-files.nix` maps source files to `~/.pi/agent/`. Pi runs with the harness tools and configured web tools. The repository's root `AGENTS.md` points to `repo-dictionary/` for project facts. Run extension tests with `bun test` from this directory.

## Extension settings

Pi uses `pi-mcp-adapter` as its sole MCP extension. The managed settings disable `builtin:mcp` and store adapter settings in `~/.pi/agent/mcp-adapter.json`. The Nix package patches the LSP adapter's host libraries into wildcard peer dependencies and removes nested copies.

## Toggle Codex fast mode

Select a supported `openai-codex` model, then run `/fast` to open the On/Off menu. You can also use `/fast on`, `/fast off`, `/fast toggle`, or `/fast status`. The footer shows the current state, including when the selected model does not support fast mode.

Fast mode requests the `priority` service tier and increases usage. It starts off in new sessions and restores your choice when you resume a session. It does not write to the managed `settings.json`.

The extension reads supported priority models from `$CODEX_HOME/models_cache.json`, or `~/.codex/models_cache.json` when `CODEX_HOME` is unset. If the cache is unavailable, the fallback models are `gpt-5.4` and `gpt-5.5`. Restart Pi after Codex refreshes its model cache. Unsupported models use their normal service tier even when the saved fast-mode preference is on.
