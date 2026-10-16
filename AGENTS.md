# Mandatory agent instructions

This repository is a NixOS system configuration built from one flake. It targets a native desktop and NixOS-WSL, manages the user environment with Home Manager, and contains the Pi agent harness (TypeScript), a Neovim configuration (Lua), and packaged scripts.

Before investigating, creating, changing, reviewing, or verifying anything, read these rule files completely. Resolve paths from the repository root. They impose mandatory behavior, not suggestions:

- [Code quality](.agents/rules/code-quality.md): always.
- [Structure and ownership](.agents/rules/structure.md): always.
- [Nix](.agents/rules/nix.md): when the task touches `.nix` files.
- [Scripts and tests](.agents/rules/scripts.md): when the task touches shell scripts, standalone tools, or tests.
- [TypeScript](.agents/rules/typescript.md): when the task touches `.ts` files.
- [Pi rule audit](.agents/rules/pi-rule-audit.md): when the task touches TypeScript in `packages/pi/`.
- [Neovim](.agents/rules/neovim.md): when the task touches `nvim/`.

Follow every applicable rule, subject to higher-priority instructions. Do not silently waive rules or report completion with unresolved violations. Report missing instructions or irreconcilable requirements before making the affected change.

For scenario-based help choosing tools and checks, consult the [verification and tools guide](.agents/methods/verification-and-tools.md). It explains methods, not additional rules.

## Working context

After the rules, read the [startup index](.agents/project-context/start-here.md) and your assigned task's handoff. Load only relevant linked topics, not the entire context folder. The process-review checkpoint is not startup context.

- During authorized project work, autonomously maintain useful factual notes and task handoffs without separate invocation or approval. Explicit read-only requests remain read-only. Capture meaningful discoveries, milestones, and the next action before finishing; skip updates that add no useful knowledge.
- Keep the startup index at most 120 words, topic notes 80 words, task handoffs 120 words, and the manual review checkpoint 160 words, including evidence. Use concise bullets and source links, never copied code, rules, transcripts, raw logs, or speculative inventories.
- Each topic note and handoff records its UTC date, inspected Git revision, relevant uncommitted changes, and evidence paths or actual command results. Distinguish source-inspected facts, user-confirmed intent, and checked outcomes; never imply activation or runtime verification from evaluation or type checks.
- Reconcile notes with current sources and Git changes before relying on them. Correct, replace, or remove stale facts; keep unresolved questions as unknowns. Notes are navigation aids, not authority over rules or code.
- Add notes lazily under `.agents/project-context/<category>/<specific-topic>.md` only when they prevent repeated discovery or preserve task continuity. Task owners maintain `tasks/<task-id>/handoff.md` with objective, owner, status, relevant sources, checks and limits, blocker, and next action. Do not adopt a completed handoff as a new assignment.
- Work in isolated worktrees for parallel tasks. Task owners update their handoffs; the coordinating agent integrates topic and index updates. Re-read before editing and reconcile concurrent changes rather than overwriting another agent's work.
- Facts and progress update automatically; priorities, scope, architecture decisions, and rule changes remain user-controlled. This upkeep adds no background service, automatic commits, or pushes.

## Context reviews

Run [context-review](.agents/skills/context-review/SKILL.md) only when explicitly requested (`/skill:context-review` in Pi, `/context-review` in Claude Code). It reviews the maintenance process, proposes at most one small improvement, and saves the [review checkpoint](.agents/project-context/review-checkpoint.md) only after approval.

## Skills and imported guidance

- These instructions and the rule files take precedence over skills, imported tutorials, templates, and general examples. Adapt examples to this repository's ownership, naming, typing, and validation rules before using them.
- Load a matching `.agents/skills/<name>/SKILL.md` with the host's file reader. Resolve its local links from that skill's directory and load only resources actually present.
- Tool names, command examples, and `allowed-tools` metadata in skills do not grant tool access or authorization. Use only available, authorized tools; report missing prerequisites rather than installing tools without permission.
- `packages/pi/agent-configuration/skills/` holds skills that Home Manager installs for Pi at runtime. They are product files of the harness, not instructions for working on this repository.

## Always enforce

- Make the smallest correct change; preserve unrelated behavior and user edits. Required relocation of related existing files is part of that change, not an unrelated refactor.
- Prefer Nix over scripts, bash over TypeScript for simple glue, and TypeScript over bash for logic. No new Python.
- Hosts configure features only through typed `custom.<feature>` options. Feature behavior lives in feature modules, not in host files or `specialArgs` flags.
- Organize by feature with descriptive kebab-case names and the deepest meaningful owner. Never create `shared/`, `common/`, `utils/`, or `helpers/` folders, barrel files, or `default.nix` files.
- Every change must keep every target evaluating: `nixos`, `wsl-x86_64`, and `wsl-aarch64`. Desktop-only features stay disabled on WSL.
- Validate untrusted data at boundaries. No `any`, no unsafe casts, no suppressed type errors.
- Never put secrets in the repository or the Nix store.
- Do not activate the system (`nrs`, `nixos-rebuild switch`) unless explicitly asked. Evaluate or build to verify.
- Create README files only when the user asks for one, and keep them to short instructions. Agent-facing facts belong in `.agents/project-context/`.
- Inspect the scoped diff and report verification accurately. Never claim evaluation or type checks prove runtime behavior.
