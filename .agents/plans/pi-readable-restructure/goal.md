# Goal

Make every Pi TypeScript root read like veyra: role folders (`types/`, `schemas/`, `constants/`, `services/`, `tools/`, `commands/`, `components/`) divided by domain and operation, one clear function per service, fully typed contracts with no optional fields, `any`, or loose `unknown`, and code that explains itself through names. The rules make this mandatory for all TypeScript packages, and `check-code` lets any agent see the same errors the editor shows. Cheap parallel Haiku agents do the move under an Opus-written brief.

## Done when

- `.agents/rules/` state every new requirement; Biome enforces the tool-checkable ones.
- `check-code` runs the CLI checker for every configured LSP language and fails on errors.
- All Pi code follows the role-root layout; `bun run check`, the flake check, and `check-code` pass.
- Installed `~/.pi/agent` paths are unchanged and exclude tests; all three targets evaluate.
