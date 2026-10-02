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
