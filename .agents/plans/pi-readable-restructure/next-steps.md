# Next steps

Steps 1-4 of the first plan are done (rule typo, bashls, tooling, reformat).

1. Write the new rules into `code-quality.md`, `structure.md`, `typescript.md`, and the LSP check list. Verify: diff, no duplicates.
2. Add the Biome error rules to `packages/pi/biome.json`. Verify: `biome ci` runs; record new counts.
3. Add `scripts/check-code/` and its Nix package. Verify: shellcheck, nixfmt/statix/deadnix, run on a changed file per language, eval three targets.
4. Create branch `pi-architecture`; commit tooling, reformat, rules, check-code separately. Verify: clean tree.
5. Opus writes the agent brief (`agent-brief.md`): target tree, file move map per area, naming, rule checklist, required checks. Verify: every current file mapped once.
6. Phase A: 8 Haiku worktree agents write types, schemas, constants per area. Opus merges in order. Verify: `tsc` on contracts, `biome ci`.
7. Phase B: 8 Haiku agents move services, tools, commands, components, tests; convert `.mjs`. Opus merges, owns `index.ts`. Verify: `bun run check`, `nix build .#pi-tools`.
8. Phase C: 8 Haiku agents review each area's diff against the checklist; Opus applies fixes. Verify: `bun run check`, `check-code`.
9. Filter tests from install; update `managed-files.nix`. Verify: installed file list unchanged minus tests.
10. Flake check on both systems. Verify: `nix build .#checks.<system>.pi`.
11. Trim README; update project-context. Verify: eval three targets.
