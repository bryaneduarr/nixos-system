# Structure and ownership

These rules are mandatory for creating, moving, reviewing, and naming files.

## Target layout

The repository is migrating toward this layout. Existing code moves when a task touches its ownership area, not in one sweep.

```text
flake.nix                    Inputs and outputs only; builds targets from hosts/ and discovers modules.
hosts/<target>/              One folder per target (desktop, wsl). <target>.nix sets system options,
                             <target>.home.nix sets Home Manager options; also hardware or platform specifics.
system/<area>/               Internal NixOS configuration owned by no single program: accounts, Nix, desktop session.
services/<service>/          Background services the system runs, such as Docker, PostgreSQL, or web research.
packages/<program>/          Everything one program needs: system and Home Manager modules, configuration
                             files, scripts, documentation, and tests.
scripts/<tool>/              Standalone tools packaged by Nix, together with the command that runs them.
nvim/                        Neovim Lua configuration, linked as-is by packages/neovim.
.agents/                     Agent instructions only. Never imported by Nix.
```

- Choose the category by what the code configures: a program the user runs goes in `packages/`, a daemon in `services/`, operating-system configuration that is neither in `system/`, and a tool started by a command in `scripts/`. Program-specific maintenance, such as a cache-cleanup timer, stays with its program.
- One folder holds both sides of a feature. Its NixOS module is `<name>.system.nix` and its Home Manager module is `<name>.home.nix`. When both exist, the system module declares the options and the home module follows them through `osConfig`.
- `flake.nix` imports every `<category>/<name>/<name>.system.nix` into each target and every `<category>/<name>/<name>.home.nix` into each Home Manager user. Every discovered module therefore does nothing until its `enable` option is set.
- `hosts/<target>/` only sets options and holds hardware or platform specifics. Feature behavior belongs in its category folder.
- The Pi harness keeps its Nix wiring and TypeScript source together in `packages/pi/`.
- `.agents/` stays agent-facing. Do not import its skills or rules into Nix modules, install them through Home Manager, or generate system configuration from them.

## Choose the deepest meaningful owner

- Organize by feature, then by responsibility inside the feature. Use descriptive kebab-case folder names that state what each folder owns.
- Each folder level must identify a real ownership boundary. Do not create empty scaffolding, speculative folder trees, or layers that only increase depth.
- Keep a feature flat while it is small. Add a subfolder when several files serve a distinct part of the feature, such as `scripts/`, `templates/`, or `keybindings/`.
- When several features need the same implementation, place it under the narrowest truthful capability owner, such as `system/desktop-session/` for appearance values used by several programs. Never create `shared/`, `common/`, `utils/`, `helpers/`, or `misc/` folders or files.
- When a task establishes a better owner for related existing files, move them as part of the task and update every import, `imports` list, path reference, test, and document that pointed to them. Remove empty folders. A repository-wide migration of unrelated features requires separate authorization.
- Ask the user before proceeding when plausible owners imply materially different module boundaries. Make straightforward placements without asking.

## Files

- Keep each file focused on one responsibility. Target roughly 150 lines; a small overrun is fine when splitting would reduce clarity.
- Name files and folders for their actual responsibility, in kebab-case.
- Nix: never create `default.nix` files. A feature folder's entrypoints are named after the folder with their role, `<name>.system.nix` or `<name>.home.nix`, such as `web-research/web-research.system.nix`; a host's are `hosts/<target>/<target>.nix` and `<target>.home.nix`. Other files must not use those suffixes. An entrypoint declares the feature's options and composes its parts through `imports`; it is a real module, not a barrel. Other files are `<responsibility>.nix`, such as `keybindings.nix`.
- Import and package Nix files by their full file path, never by folder path, such as `./packages/niri/config.nix` or `callPackage ./pi-tools/pi-tools.nix { }`. Existing `default.nix` files are renamed when their feature is touched.
- TypeScript: name files `<specific-responsibility>.<singular-role>.ts`, such as `session-registry.store.ts` or `exit.command.ts`. See [typescript.md](typescript.md).
- Shell: name files `<action-or-responsibility>.sh`, such as `select-target.sh`.
- Lua: follow the existing `nvim/lua/config/` and `nvim/lua/plugins/<plugin>.lua` layout.
- Put each test file next to the file it tests, named after the file or behavior it checks: `<subject>.test.ts` or `<subject>.test.nix`. Test files follow the same comment rules as other code; their names state what they check. Never create a central `tests/` folder or a per-feature `tests/` subfolder; existing ones migrate when their subject is touched.
- Preserve filenames required by tools: `flake.nix`, `init.lua`, `package.json`, `stylua.toml`, and similar.
- Apply naming rules to new files and files moved for the task. Do not rename unrelated files during another task.

## Dependencies

- Add external sources as flake inputs. Pin non-flake sources with `flake = false` inputs or fixed-output fetchers that include a hash.
- Add packages in the module of the feature that uses them, not in a global package list.
- Do not update unrelated flake inputs or dependency versions during another task. `nfu` updates everything deliberately.
- Keep lockfiles (`flake.lock`, `bun.lock`, `package-lock.json`, `nvim/lazy-lock.json`) consistent with their manifests. Never edit a lockfile by hand.
