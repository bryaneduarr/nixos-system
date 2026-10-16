# Risks

- Behavior: moves break [managed-files.nix](../../../packages/pi/home-manager/managed-files.nix) links or Pi discovery. Mitigation: keep installed names, build `pi-tools`, evaluate three targets, diff installed file lists.
- Quality: Haiku misses rules no tool checks (naming, depth, comments). Mitigation: Biome errors, explicit brief with examples, Haiku checklist review. Accepted: residual misses.
- Contracts: phase B agents need other areas' types. Mitigation: phase A merges all contracts before B starts.
- Merges: conflicts in `harness/index.ts` and shared types. Mitigation: Opus merges in fixed order and owns `index.ts`.
- Cost: about 24 Haiku runs plus Opus merges. Accepted.
- Types: Pi API optionals; converted at boundaries, never suppressed.
- Formatting and `.mjs` conversion risks as in the first plan; bun fetch hashes accepted.
- `check-code`: tools missing on PATH. Mitigation: Nix runtime inputs; report unchecked languages explicitly.
