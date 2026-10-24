# Pi configuration

- `agent-configuration/harness/` is the Pi harness. `harness.extension.ts` registers everything, and `package.json` points Pi to it; code lives in `types/`, `schemas/`, `constants/`, `services/`, `tools/`, `commands/`, and `components/`, each divided by domain, such as `services/sessions/`.
- `agent-configuration/extensions/` contains independent Pi extensions. Multi-file extensions use the same folders.
- `agent-configuration/settings/` defines JSON settings installed by Home Manager.
- `agent-configuration/themes/` contains themes.
- `agent-configuration/skills/` contains the Efficient Tools and Web Research skills used by the Pi harness.
- The repository root `.agents/skills/` belongs to coding harnesses. Home Manager does not read or install it.
- `home-manager/` installs files and configures Pi. `pi-tools/` packages dependencies. Tests sit next to the code they check and are not installed.

`home-manager/managed-files.nix` maps source files to `~/.pi/agent/`. Pi runs with the harness tools and configured web tools.

Run `bun install`, then `bun run check` from this directory to type-check, lint, find unused code, and run the tests. `nix build .#checks.x86_64-linux.pi` from the repository root runs the same checks in a sandbox.

## Browse and copy prompts

Long sent prompts show a three-line text preview followed by `...` and a shortcut hint. Short prompts keep their Markdown rendering. This changes only the interactive transcript. Pi stores the complete prompt and sends it unchanged to the agent.

Press `Ctrl+Alt+U` or run `/prompts` to open the read-only prompt browser. The left pane lists sent user messages from the current branch, newest first. A nonempty editor draft appears first and opens by default. The right pane shows the complete original text. Narrow terminals stack the panes. Opening or closing the browser does not change the draft or interrupt the agent. Resumed sessions use the same previews.

Press `Tab` to switch panes. In the list, use `j`, `k`, or the arrow keys to choose a message. In the text, use `h`, `j`, `k`, and `l` to move the cursor, `w` and `b` to move between words, and Home and End to reach line edges. Use `gg` and `G` for message edges, `Ctrl+D` and `Ctrl+U` for half pages, or Page Up and Page Down for full pages. Arrow keys, Home, and End also work.

Press `v` to select characters or `V` to select whole lines, then move the cursor and press `y` to copy. Use `yy` to copy the current line or `ggyG` to copy the complete message. The footer reports clipboard success or failure. Copies retain original whitespace and line endings, without borders or display-wrap breaks. Escape cancels an active selection; a second Escape closes the modal. `Ctrl+C` closes immediately.

After installing the configuration with `nrs`, run `/reload` in Pi.
## Live sessions in Herdr

Press `Ctrl+Alt+S` or run `/sessions` in interactive Pi inside Herdr. The menu groups live sessions by canonical project directory and refreshes once a second. Each row shows one status, the Git branch, and main-session context usage. `working` takes priority over an orange `draft` label. An empty idle editor shows `idle`. Unknown context usage shows `unknown`. A star marks the current process. Press `i` to filter by folder, session name, branch, or status.

Select a session and press Enter to focus its Herdr agent. Pi stays running in its own pane, so switching does not replace its session, interrupt tools, or clear its editor. Press `N` to select a known project, browse directories, or enter a directory path. The manager resolves symbolic links and rejects files and missing paths. Each new session splits the calling pane in the same tab and workspace, even for a different project. Wide panes split right. Narrow panes split down. Herdr must detect interactive readiness and Pi must register before the manager focuses the new pane.

Press `Ctrl+Alt+N` to start another Pi instance in the current session's project directory without opening a menu. The shortcut preserves the current editor draft. `Alt+S` remains available for stash text.

The menu, pane label, and Herdr agent use `<project-name>-pi-<number-of-instance>`, starting at `1`. The project name comes from the folder name. Herdr requires lowercase ASCII agent names of at most 32 characters, so the manager replaces unsupported characters with hyphens and truncates long folder names. Names that do not start with a letter get a `project-` prefix. Numbers count live instances within each Herdr socket registry. When a session closes, surviving sessions are renumbered from `1` on their next heartbeat. Startup reserves a number for up to 60 seconds before registration. Failed startup releases the reservation. Reloading or replacing the conversation preserves the reservation. Folders with the same normalized name share a number sequence.

The private registry lives under `$XDG_STATE_HOME/pi/sessions/`, or `~/.local/state/pi/sessions/`. Each Herdr socket has a separate registry. Records contain process start times, session identities, project paths, and status, but no editor contents. The manager removes expired records after 15 seconds and remembers valid project directories. Print, JSON, and RPC invocations do not register. Failed startup leaves the new pane open for inspection and does not close existing panes.

After a successful switch, the manager shuts down an unused session only when the manager created that session. The session must have no conversation history, editor text, queued prompts, or active work. Pi inserts attachment paths into the editor, so attachments prevent cleanup. Using the configured clipboard-paste action permanently protects the process because Pi does not expose completion of asynchronous clipboard reads. Starting a conversation or a user bash command also permanently protects the process, including after `/new`. Existing Pi terminals that the manager did not create never close automatically.

Cleanup requests a graceful Pi shutdown. A detached helper waits for that exact process to exit and verifies that its pane contains only the original shell before closing that pane. It leaves sibling panes intact and never issues a tab-close command. A replacement process, failed switch, or unavailable process information prevents closure. The harness also sends lifecycle and session identity reports to Herdr. If Herdr rejects an agent rename while startup is pending, Pi keeps its live record and retries the rename on the next heartbeat.

The harness reports `working` and `idle` to Herdr under its own `pi:harness` source, separate from Herdr's native Pi integration. Drafts remain `idle` in Herdr and appear as `draft` in the Pi session menu. After changing the reporter, run `nrs`, then `/reload` in each live Pi instance. Reloading Herdr's config alone does not reload Pi extensions.

Pi sends one audible completion notification after the agent settles. Repeated settlement events, aborted runs, and noninteractive subagents do not send another notification. Herdr's automatic Pi state-change sound is muted to avoid a second sound. Home Manager reloads a running Herdr server when its configuration file changes. If an older server still plays both sounds, run `herdr server reload-config`; no Pi restart is needed.

The manager uses the existing `pi` executable through `herdr agent start --kind pi`. It does not install a shell wrapper or change noninteractive Pi invocations. Pi must load this harness in the new pane. Restart older Pi processes to make them appear in the menu.
## Exit Pi

Run `/exit` or press `Ctrl+Alt+Q` in interactive Pi. Outside Herdr, this requests Pi's graceful shutdown without closing a terminal. Inside Herdr, it also schedules closure of the current pane after the exact Pi process exits. Explicit exit works with conversation history and with Pi instances that the session manager did not create. It does not change the automatic unused-session cleanup rules.

Pi asks for confirmation when it has active work, pending messages, or an editor draft. Cancel leaves Pi running and preserves that work. Confirm requests shutdown and aborts active work. Pi keeps the saved conversation for `/resume`. Unsent drafts and queued prompts are not saved as conversation messages.

Before shutdown, the extension verifies the current pane, Pi process, socket, and shell process identity. If verification or helper startup fails, Pi stays running and reports an error. Check the Herdr socket and pane process information, then retry. Pi's built-in `Ctrl+D` with an empty editor exits without requesting pane closure.

The detached helper waits up to 60 seconds for Pi to exit, then up to 10 seconds for the original shell to remain alone. It rechecks the exact pane and original shell start identity before closing only that pane. It never sends a tab-close command. If another process starts, the shell changes, or Herdr information becomes unavailable, the helper leaves the pane open. Check the remaining processes before closing that pane manually. Repeated invocations do not schedule extra helpers. Reload or session replacement cancels an in-flight exit request.

## Extension settings

Pi uses its built-in MCP support and reads servers from `~/.pi/agent/mcp.json`; run `/mcp` to sign in to OAuth servers such as Notion. Auto-compaction starts at 300k tokens on 1M-context models. The Nix package patches the LSP adapter's host libraries into wildcard peer dependencies and removes nested copies.

## Toggle Codex fast mode

Select a supported `openai-codex` model, then run `/fast` to open the On/Off menu. You can also use `/fast on`, `/fast off`, `/fast toggle`, or `/fast status`. Press `Ctrl+Alt+F` to toggle fast mode. The footer shows a rainbow `fast` beside the model only when fast mode is on and the selected model supports it.

Fast mode requests the `priority` service tier and increases usage. Pi saves your last on or off choice in `$XDG_STATE_HOME/pi/codex-fast-mode.json`, or `~/.local/state/pi/codex-fast-mode.json` when `XDG_STATE_HOME` is unset. This preference applies across new and resumed sessions. Without a saved preference, fast mode starts off or restores the active session's existing choice. It does not write to the managed `settings.json`.

The extension reads supported priority models from `$CODEX_HOME/models_cache.json`, or `~/.codex/models_cache.json` when `CODEX_HOME` is unset. If the cache is unavailable, the fallback models are `gpt-5.4` and `gpt-5.5`. Restart Pi after Codex refreshes its model cache. Unsupported models use their normal service tier even when the saved fast-mode preference is on.
