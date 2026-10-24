# Agent instructions handoff

Evidence: 2026-10-15 UTC; base `32ac1c9`; uncommitted `.agents/`, `.claude/`, `AGENTS.md`, `CLAUDE.md`, eval tests.

- Objective: adapt instructions copied from another project to this NixOS repository.
- Owner: coordinating agent. Status: done, awaiting user review and commit.
- Kept skills: commit-done, finish-feature, pr, context-review, typescript-best-practices, zod-validation-utilities.
- Rules rewritten per language: code-quality, structure, nix, scripts, typescript, neovim.
- Added shellcheck, shfmt, stylua, lua-language-server packages; not activated.
- Moved `tests/*.nix` beside subjects; split herdr asserts into its own test.
- Checks: all targets evaluate; nixfmt, statix, deadnix, eval tests pass.
- Next action: user review; then migrations follow [target layout](../../architecture/target-layout.md).
