# Pi code quality

- Updated 2026-10-24 UTC; branch `fix/pi-code-quality` from `4563448`. Owner: Claude Code. Status: complete, unmerged.
- Sources: [Pi audit rules](../../../rules/pi-rule-audit.md), [rule-audit](../../../../scripts/rule-audit/), [typescript rules](../../../rules/typescript.md).
- Checked: `check-code` pi parts, `tsc`, `biome ci`, `knip`, 224 Pi tests, 40 audit tests, both audits 0 findings, Nix `pi` and `rule-audit` checks, all three targets evaluate.
- Unverified: runtime in Pi, aarch64 execution, activation. Known change: ripgrep match events without `lines` are now skipped.
- Singletons live in `stores/<domain>/*.store.ts`; Pi shares `custom.pi.tools` (readOnly).
- Next: review and merge the branch.
