# Target layout

Evidence: 2026-10-15 UTC; `32ac1c9`; user-confirmed intent, nothing migrated yet.

- Hosts become `hosts/<target>/` and only set typed `custom.<feature>` options.
- Features move to `modules/nixos/<feature>/` and `modules/home/<feature>/`, gradually, when touched.
- Pi harness TypeScript moves to top-level `pi-harness/` with strict tsconfig; Nix wiring stays in a home module.
- Language order: Nix, then bash, then TypeScript; no new Python, Python tests migrate when touched.
- Neovim stays Lua with lazy.nvim and Mason.
- Full rules: [structure](../../rules/structure.md), [nix](../../rules/nix.md).
