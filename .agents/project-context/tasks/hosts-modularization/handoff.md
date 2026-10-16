# Repository reorganization

Evidence: 2026-10-15 UTC; base `e5b5d36`; committed on `main` except the render-markdown removal.

- Objective: categorize into `system/`, `services/`, `packages/`, `scripts/`, `hosts/<target>/`. Owner: coordinating agent. Status: complete.
- User-confirmed: no `default.nix`; `_:` modules; one passwordless rebuild rule; zsh default, fish optional; Pi stays whole in `packages/pi/`; Python tests replaced by `*.test.nix`.
- Checked: three targets evaluate; all 18 `*.test.nix` pass on aarch64; settings diff against HEAD shows only approved changes; nothing activated or built for x86_64.
- Limits: `packages/pi/tests/` and Pi tsconfig remain; `nvim/` stays top-level; READMEs only on request (herdr shortened, niri and t3code docs removed).
- Next action: none; the render-markdown deletion awaits a stated reason.
