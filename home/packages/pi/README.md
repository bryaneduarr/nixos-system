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

`home-manager/managed-files.nix` maps source files to `~/.pi/agent/`. Pi runs with the harness tools and configured web tools. Run extension tests with `bun test` from this directory.

## Browse and copy prompts

Long sent prompts show a three-line text preview followed by `...` and a shortcut hint. Short prompts keep their Markdown rendering. This changes only the interactive transcript. Pi stores the complete prompt and sends it unchanged to the agent.

Press `Ctrl+Alt+U` or run `/prompts` to open the read-only prompt browser. The left pane lists sent user messages from the current branch, newest first. A nonempty editor draft appears first and opens by default. The right pane shows the complete original text. Narrow terminals stack the panes. Opening or closing the browser does not change the draft or interrupt the agent. Resumed sessions use the same previews.

Press `Tab` to switch panes. In the list, use `j`, `k`, or the arrow keys to choose a message. In the text, use `h`, `j`, `k`, and `l` to move the cursor, `w` and `b` to move between words, and Home and End to reach line edges. Use `gg` and `G` for message edges, `Ctrl+D` and `Ctrl+U` for half pages, or Page Up and Page Down for full pages. Arrow keys, Home, and End also work.

Press `v` to select characters or `V` to select whole lines, then move the cursor and press `y` to copy. Use `yy` to copy the current line or `ggyG` to copy the complete message. The footer reports clipboard success or failure. Copies retain original whitespace and line endings, without borders or display-wrap breaks. Escape cancels an active selection; a second Escape closes the modal. `Ctrl+C` closes immediately.

After installing the configuration with `nrs`, run `/reload` in Pi. The implementation is in `agent-configuration/harness/ui/prompts/`. Run `bun test tests/prompt-previews.test.ts tests/prompt-browser.test.ts` from this directory to check previews, navigation, selection, and clipboard handling.

## Extension settings

Pi uses `pi-mcp-adapter` as its sole MCP extension. The managed settings disable `builtin:mcp` and store adapter settings in `~/.pi/agent/mcp-adapter.json`. The Nix package patches the LSP adapter's host libraries into wildcard peer dependencies and removes nested copies.

## Toggle Codex fast mode

Select a supported `openai-codex` model, then run `/fast` to open the On/Off menu. You can also use `/fast on`, `/fast off`, `/fast toggle`, or `/fast status`. Press `Ctrl+Alt+F` to toggle fast mode. The footer shows a rainbow `fast` beside the model only when fast mode is on and the selected model supports it.

Fast mode requests the `priority` service tier and increases usage. Pi saves your last on or off choice in `$XDG_STATE_HOME/pi/codex-fast-mode.json`, or `~/.local/state/pi/codex-fast-mode.json` when `XDG_STATE_HOME` is unset. This preference applies across new and resumed sessions. Without a saved preference, fast mode starts off or restores the active session's existing choice. It does not write to the managed `settings.json`.

The extension reads supported priority models from `$CODEX_HOME/models_cache.json`, or `~/.codex/models_cache.json` when `CODEX_HOME` is unset. If the cache is unavailable, the fallback models are `gpt-5.4` and `gpt-5.5`. Restart Pi after Codex refreshes its model cache. Unsupported models use their normal service tier even when the saved fast-mode preference is on.
