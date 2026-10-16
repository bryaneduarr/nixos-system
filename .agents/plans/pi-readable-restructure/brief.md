# Brief

- Date: 2026-10-16 UTC. Revision: `d4358b4`; steps 1-4 of the first plan done but uncommitted.
- Request 1: make `packages/pi/` simpler to read; editor support for TypeScript, shell, Nix; descriptive names; colocated tests.
- Request 2: role roots (`types/`, `services/`) modeled on `~/veyra` (`packages/schemas/src`, `apps/server/src/services`); ban optional fields, `any`, loose `unknown`, classes, function comments, long conditions; constants for repeated strings; LSP-equivalent CLI checks for every language; write all of it as rules; run the work with parallel Haiku 5.5 subagents.

## Success criteria

- Every Pi TypeScript root follows the role-root layout; `bun run check` and the flake check pass.
- Rules state every new requirement; `check-code` runs every available CLI checker.
- Pi runtime behavior and installed paths are unchanged.

## In scope

`packages/pi/`, `.agents/rules/`, `scripts/check-code/`, `nvim/` LSP list, `packages/development-tools/`, flake checks.

## Out of scope

Pi behavior changes, other packages' code, installing HTML/CSS/Tailwind/Emmet servers.

## Direction

Rules and tooling first, commit on branch `pi-architecture`, then three parallel Haiku phases (contracts, code, review) merged by Opus.
