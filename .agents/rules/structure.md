# Structure and ownership

These rules are mandatory for creating, moving, reviewing, and naming files.

## Target layout

The repository is migrating toward this layout. Existing code moves when a task touches its ownership area, not in one sweep.

```text
flake.nix                    Inputs and outputs only; builds targets from hosts/.
hosts/<target>/              One folder per target (desktop, wsl). Imports feature modules,
                             sets typed options, and holds hardware or platform specifics.
modules/nixos/<feature>/     System-level feature modules: typed options plus config.
modules/home/<feature>/      Home Manager feature modules: typed options plus config.
pi-harness/                  Pi harness TypeScript source, tests, tsconfig, and lockfiles.
nvim/                        Neovim Lua configuration, linked as-is by a home module.
scripts/<tool>/              Standalone tools packaged by Nix; one folder per tool.
.agents/                     Agent instructions only. Never imported by Nix.
```

- Today `hosts/` mixes target and system modules, `home/` holds Home Manager modules, and the Pi harness lives in `home/packages/pi/`. Treat those as legacy owners: when a task changes a feature there, move that feature to its target owner as part of the task if the move is contained; otherwise report the needed move.
- `hosts/<target>/` only selects features and sets their options. Feature behavior belongs in `modules/`.
- A feature that needs both system and user configuration has one folder in each of `modules/nixos/` and `modules/home/` with the same feature name.
- The Nix wiring for the Pi harness (packaging, Home Manager files, settings) belongs in `modules/home/pi/`. TypeScript source belongs in `pi-harness/`.
- `.agents/` stays agent-facing. Do not import its skills or rules into Nix modules, install them through Home Manager, or generate system configuration from them.

## Choose the deepest meaningful owner

- Organize by feature, then by responsibility inside the feature. Use descriptive kebab-case folder names that state what each folder owns.
- Each folder level must identify a real ownership boundary. Do not create empty scaffolding, speculative folder trees, or layers that only increase depth.
- Keep a feature flat while it is small. Add a subfolder when several files serve a distinct part of the feature, such as `scripts/`, `templates/`, or `keybindings/`.
- When several features need the same implementation, place it under the narrowest truthful capability owner, such as `modules/home/theme/` for colors used by several programs. Never create `shared/`, `common/`, `utils/`, `helpers/`, or `misc/` folders or files.
- When a task establishes a better owner for related existing files, move them as part of the task and update every import, `imports` list, path reference, test, and document that pointed to them. Remove empty folders. A repository-wide migration of unrelated features requires separate authorization.
- Ask the user before proceeding when plausible owners imply materially different module boundaries. Make straightforward placements without asking.

## Files

- Keep each file focused on one responsibility. Target roughly 150 lines; a small overrun is fine when splitting would reduce clarity.
- Name files and folders for their actual responsibility, in kebab-case.
- Nix: a feature folder's entrypoint is `default.nix`. It declares the feature's options and composes its parts through `imports`; it is a real module, not a barrel. Other files are `<responsibility>.nix`, such as `keybindings.nix`.
- TypeScript: name files `<specific-responsibility>.<singular-role>.ts`, such as `session-registry.store.ts` or `exit.command.ts`. See [typescript.md](typescript.md).
- Shell: name files `<action-or-responsibility>.sh`, such as `select-target.sh`.
- Lua: follow the existing `nvim/lua/config/` and `nvim/lua/plugins/<plugin>.lua` layout.
- Put each test file next to the file it tests, named after the file or behavior it checks: `<subject>.test.ts` or `<subject>.test.nix`. A test file starts with a comment naming what it checks. Never create a central `tests/` folder or a per-feature `tests/` subfolder; existing ones migrate when their subject is touched.
- Preserve filenames required by tools: `flake.nix`, `default.nix`, `init.lua`, `package.json`, `stylua.toml`, and similar.
- Apply naming rules to new files and files moved for the task. Do not rename unrelated files during another task.

## Dependencies

- Add external sources as flake inputs. Pin non-flake sources with `flake = false` inputs or fixed-output fetchers that include a hash.
- Add packages in the module of the feature that uses them, not in a global package list.
- Do not update unrelated flake inputs or dependency versions during another task. `nfu` updates everything deliberately.
- Keep lockfiles (`flake.lock`, `bun.lock`, `package-lock.json`, `nvim/lazy-lock.json`) consistent with their manifests. Never edit a lockfile by hand.
