# Decisions

## Carried from the first plan

- Local `bun install` for types; bashls via Nix; tests beside subjects with `describe`; `*.test.ts` filtered from install; `.mjs` to TypeScript; README usage only; Biome 2 spaces, double quotes, width 120; `@types/bun` pruned; flake check on both systems; `bun run check` with knip.
- Superseded: feature + layer layout (`state/`, `rendering/`). Replaced by role roots below.

## Architecture

- Per-root layout: `harness/` and each multi-file extension own their role roots; single-file extensions stay one file. Rejected: one root for all extensions (breaks install links).
- Roles: `types/` (`*.interface.ts`), `schemas/` (TypeBox `*.schema.ts`), `constants/` (`*.constant.ts`), `services/` (`*.service.ts`, one exported function), `tools/` (`*.tool.ts`), `commands/` (`*.command.ts`), `components/` (`*.component.ts`); inside each root, domain then operation folders as in veyra. Rejected: only types + services; flat `types/`; feature-first.
- Entry `index.ts` registers everything with visible order.
- Imports stay relative with `.ts` (no bundler). Pi library types keep optionals; converted to own unions at the boundary.
- Future TypeScript packages use the same roots in their own folder.

## Typing and readability rules

- Absence: literal-discriminated unions; no `?:`, no `| undefined`/`| null` in owned contracts. Rejected: defaults; `| null` lookups.
- `unknown`: only as the value passed straight into a schema parse; caught errors narrowed immediately.
- Classes only when a library contract requires one (pi-tui `Component`). Others become factory functions with plain objects.
- No function comments; comments only on interfaces and schema fields, or for rare non-obvious logic.
- Long conditions become named booleans or validation functions; repeated strings become constants; `const` and `readonly` by default.
- Readability rules go in `code-quality.md` for all languages; layout and typing in `structure.md` and `typescript.md`.

## Verification

- CLI equivalents for every configured LSP, required before completion; listed in rules.
- Biome errors: `noExplicitAny`, `noNonNullAssertion`, `noDeprecatedImports`, `noExcessiveCognitiveComplexity`, `useConst`.
- `check-code`: bash, `scripts/check-code/`, git-changed files by default or given paths. Rejected: whole repo only.
- CSS via Biome; HTML, Tailwind, Emmet reported as unchecked.

## Execution

- Branch `pi-architecture`; separate commits for tooling, reformat, rules, each merged phase.
- Phases A (contracts), B (code), C (review), 8 Haiku agents each in worktrees: activity, sessions, subagents, tools, inspector, prompt browser, tool rendering, extensions. Opus writes the brief and merges. Rejected: same checkout; 4 or 12 agents; Opus review (chose Haiku cross-review).
