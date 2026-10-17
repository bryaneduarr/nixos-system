# Pi readable restructure

- Updated 2026-10-16 UTC; `pi-architecture` at `0583922`. Owner: Codex commit planning. Status: restructure committed; review fixes and unrelated changes uncommitted. No activation or history rewriting.
- Sources: [Pi audit rules](../../../rules/pi-rule-audit.md), [commit workflow](../../../skills/commit-done/SKILL.md), ignored `.agents/plans/commit-pi-architecture/commit-plan.md`.
- Checked: Pi `bun run check` passes 96 tests; rule-audit check passes 18; both audits have zero findings; diff whitespace passes. Knip hints that `@earendil-works/pi-agent-core` no longer needs ignoring.
- User-confirmed: delete both session-group plans; exclude generated `nvim/lua/matugen_colors.lua`, preserving staging.
- Earlier builds/evaluations concern `cbec670`, not this tree. Runtime/aarch64 execution unverified.
- Next: approve numbered commit plan, run remaining checks, commit without pushing. No plan approval yet.
