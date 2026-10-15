# Guide to verification and tools

Use this guide to choose a useful approach for the current task. It is a decision aid, not a mandatory checklist. Permissions come from the task and applicable instructions, not from reading this guide.

## Choose the tool for the question

| Situation                                                  | Useful starting point                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| The relevant file is not known.                            | Search filenames under `hosts/`, `home/`, `modules/`, `scripts/`, or `nvim/`. |
| An option, package, or setting needs locating.             | Use a scoped text search, then read the matching module.                      |
| The final value of an option matters.                      | Evaluate it with `nix eval` instead of reading every module that sets it.     |
| A NixOS or Home Manager option's type or meaning is needed. | Search the upstream option docs or `nixpkgs` source; do not guess.           |
| A TypeScript symbol's definition or consumers are needed.  | Use LSP tools when available; otherwise search and inspect references.        |
| The file or function is already known.                     | Read a bounded slice or the specific symbol.                                  |
| Independent investigation can be delegated.                | Give a subagent one bounded question and only the context it needs.           |

## Flakes only see tracked files

The flake is a Git repository, so evaluation ignores untracked files. A new `.nix` file that is not yet added to the index evaluates as missing. Use `git add --intent-to-add <file>` to make it visible without staging content, and mention it in the report.

## When changing Nix

Format and lint each changed file:

```sh
nixfmt path/to/file.nix
nixfmt --check path/to/file.nix
statix check path/to/file.nix
deadnix path/to/file.nix
```

Evaluate every affected target. Evaluating the toplevel derivation path catches type errors, missing options, and failed assertions without building:

```sh
nix eval .#nixosConfigurations.nixos.config.system.build.toplevel.drvPath
nix eval .#nixosConfigurations.wsl-x86_64.config.system.build.toplevel.drvPath
nix eval .#nixosConfigurations.wsl-aarch64.config.system.build.toplevel.drvPath
```

Run the evaluation tests next to the changed modules. Each file locates the flake from its own path, so it runs from any directory. To find them all, run `git ls-files '*.test.nix'`.

```sh
nix eval --impure --json --file hosts/wsl.test.nix
nix eval --impure --json --file home/packages/herdr/config.test.nix
```

`hosts/configuration.test.nix` asserts nothing; it prints the desktop target's settings for before-and-after comparison.

For a single value, evaluate it directly, for example `nix eval .#nixosConfigurations.wsl-x86_64.config.custom.<feature>.enable`.

For structure-only refactors, compare the toplevel `drvPath` before and after. An identical path proves the built system is unchanged. If it differs, compare the relevant settings to explain why.

`nrs dry-build` shows what would be built without activation. `nrs build` builds without activation. Neither is needed for every change; use them when packaging or derivations changed.

## When changing shell scripts

Run `bash -n` on standalone scripts. Scripts packaged with `writeShellApplication` run ShellCheck during the build, so building the package checks them. Run `shellcheck` and `shfmt -d` on standalone scripts. Before they are on `PATH`, `nix run nixpkgs#shellcheck -- <file>` runs ShellCheck once.

## When changing TypeScript

From the owning project directory, run its tests with `bun test` and, once configured, `tsc --noEmit` and `biome check`. The Pi harness currently has tests but no type check, so state that types were not verified.

## When changing documentation or instructions

Review the text for consistency, check that links point to existing files, and look for references to deleted documents.

```sh
git diff --check -- path/to/document.md
```

New files do not appear in an ordinary `git diff`; read them directly.

## When behavior needs runtime proof

Evaluation and builds show that the configuration is valid, not that services work. Runtime proof needs activation, which requires an explicit request. When activation is out of scope, say which behavior remains unverified.

## When verification is blocked

Identify whether the obstacle is a missing tool, an unavailable target architecture, a network fetch, or an existing evaluation error. Explain which check was blocked and what could still be inspected. A concise delivery summary states what changed, which checks passed or failed, and what remains unverified.
