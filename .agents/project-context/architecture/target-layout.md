# Target layout

Evidence: 2026-10-15 UTC; `e5b5d36` plus uncommitted reorganization; user-confirmed, evaluated, not activated.

- Categories: `system/`, `services/`, `packages/`, `scripts/`; hosts set `custom.*` in `hosts/<target>/<target>.nix` and `<target>.home.nix`.
- [flake.nix](../../../flake.nix) auto-imports every `<category>/<name>/<name>.{system,home}.nix`; each is inert until enabled.
- Pi keeps Nix wiring and TypeScript together in `packages/pi/`; `nvim/` stays top-level.
- No `default.nix`; argument-free modules use `_:`; no new Python.
- Full rules: [structure](../../rules/structure.md), [nix](../../rules/nix.md).
