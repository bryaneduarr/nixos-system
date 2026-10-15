# Nix

These rules are mandatory for every `.nix` file. Prefer a Nix expression over a script whenever Nix can express the behavior.

## Typed feature options

Hosts configure features only through typed options. This replaces untyped flags such as the `desktopTools` special argument, which migrates when its consumers are touched.

- Declare project options under one namespace: `custom.<feature>` for NixOS modules and `custom.<feature>` inside Home Manager modules.
- Every feature module exposes `enable = lib.mkEnableOption "<feature description>";` and wraps its configuration in `lib.mkIf cfg.enable`.
- Every other option uses `lib.mkOption` with an explicit `type` and a `description`. Add `default` only when a meaningful default exists; otherwise the host must set the value. Use `example` when the shape is not obvious.
- Use the narrowest type: `types.enum` over `types.str` for fixed choices, `types.port`, `types.path`, `types.package`, `types.submodule` for structured values, `types.listOf`/`types.attrsOf` with an element type. Never use `types.anything`, `types.unspecified`, or `types.attrs` for project-owned values.
- Express relationships between options with `assertions` and clear messages, not silent fallbacks.
- Bind `cfg = config.custom.<feature>;` once in `let` and read options only through it.
- A target-specific difference (desktop versus WSL) is an option set by the host, not a separate copy of the module and not a `specialArgs` flag.
- Option `description` fields are required documentation: one sentence stating what the option controls. They follow the comment rules in [code-quality.md](code-quality.md).

## Group attribute prefixes

- In each attribute set, declare a shared static prefix once and put its children in one nested set. Use `home = { packages = [ ]; sessionPath = [ ]; };`, not repeated `home.packages` and `home.sessionPath`.
- Apply this at every nesting level, including `xdg`, `systemd.user`, `programs`, `services`, and `home.file`.
- Do not mix `home = { ... };` with separate `home.*` assignments in the same set.
- A single dotted assignment is allowed when its prefix has no other siblings in that set.
- Keep quoted attribute names intact. Dots inside a quoted filename or MIME type are part of the key.
- Do not merge declarations across separate modules or scopes.

This rule addresses Statix's `repeated_keys` diagnostic, `W20`.

## Expressions

- Use `inherit` instead of `x = x;`. Avoid `rec`; use `let` instead.
- Do not use `with` except as `with pkgs; [ ... ]` for a package list. Never use top-level `with lib;`.
- Reference executables with `lib.getExe` or `lib.getExe'`, not hardcoded store paths or bare command names that depend on `PATH`.
- Use `lib.mkDefault`, `lib.mkForce`, and `lib.mkMerge` only with a concrete reason. `mkForce` needs a comment naming the conflicting definition.
- Keep evaluation pure. Do not use `builtins.getEnv`, `builtins.currentSystem`, or unpinned fetchers outside `*.test.nix` files.
- Generate configuration files from Nix attribute sets with `pkgs.formats.*` or the program's Home Manager module rather than string templates, unless the format has no generator.
- Do not copy files into place with activation scripts when `home.file`, `xdg.configFile`, or `environment.etc` can manage them. Existing activation copies migrate when touched.

## Scripts inside Nix

- Package shell tools with `pkgs.writeShellApplication`, declaring every command in `runtimeInputs`. This enables strict mode and ShellCheck at build time.
- Keep script bodies in their own `.sh` files read with `builtins.readFile` when they exceed a few lines. See [scripts.md](scripts.md).

## Checks

Run on every changed Nix file before completion:

- `nixfmt` to format and `nixfmt --check` to verify.
- `statix check <file>`, fixing all diagnostics, plus a manual check for mixed parent-set and dotted declarations.
- `deadnix <file>`, removing unused bindings and arguments.
- Evaluation of every affected target and the `*.test.nix` files next to the changed modules. For structure-only changes, compare evaluated settings before and after to confirm unchanged behavior.
