---
name: feature-delivery
description: "Deliver a feature or restructure end to end: distill the plan, split the work into areas for parallel worker agents, merge their branches in an integration worktree, verify with checks and behavior evidence, and hand off to finish-feature for the pull request. Use only when explicitly asked to run this workflow."
disable-model-invocation: true
---

# Feature delivery

Coordinate a feature from request to a reviewable branch. The pull request created by [finish-feature](../finish-feature/SKILL.md) is the only review artifact. Read every reference below before starting; resolve links relative to this skill directory.

- [Agent brief template](references/agent-brief-template.md): what every worker reads.
- [Merge procedure](references/merge-procedure.md): integration worktree, conflict handling, cleanup.
- [Verification checklist](references/verification-checklist.md): checks and behavior evidence.
- [Known pitfalls](references/known-pitfalls.md): problems met in earlier runs and their fixes.

## Invocation and boundaries

- Invoke with `/feature-delivery <feature>` (Pi: `/skill:feature-delivery`). Asking to edit or review this skill does not run it.
- Mandatory repository instructions and rule files apply to the coordinator and every worker.
- Never activate the system, push, or open a pull request here. Commits go to the feature branch only.
- Never create review files or README content for review. Plans and briefs live in the ignored `.agents/plans/<slug>/`.
- Preserve the user's staged and unstaged work in the main checkout; never commit it, stash it, or reset it.

## Roles and models

- **Coordinator** (the strongest available model, such as Opus): plans, writes the brief, owns entry files and Nix wiring, merges, resolves conflicts, runs verification, and reviews the riskiest diffs.
- **Workers** (a cheap fast model, such as Haiku): one per area, in parallel, each in its own worktree, started in the background through the host's subagent tool (Claude Code: `Agent` with `model: "haiku"`, `isolation: "worktree"`, `run_in_background: true`).
- **Reviewers** (same cheap model): one per area in the review phase, checking the rules no tool checks.
- **Spot review** (coordinator): read every diff that changes a contract used by several areas, every allowlisted boundary file, and every reported behavior change.

## Size the run

- Fewer than 3 areas or about 20 files: the coordinator does the work alone and still follows the verification checklist.
- Otherwise use the phases below. Areas are disjoint ownership units with their own files; aim for 4 to 8, merging areas with few files.
- Skip phase A when no contract is shared between areas. Skip phase C when every rule the work touches is enforced by a tool (such as a rule-audit cleanup); the coordinator then spot-reviews every worker diff instead.
- Put safety-net tests (such as registration tests) in place and commit them before workers start, so every worker runs them.

## Stages

1. **Distill.** Run [thinking-distill](../thinking-distill/SKILL.md). Its plan lives in `.agents/plans/<slug>/`.
2. **Prepare.** Create the feature branch. Commit tooling and rule changes before any worker starts, because worktrees only see commits. Record the baseline from the [checklist](references/verification-checklist.md).
3. **Map.** List every affected file with its area and target path. Shared contracts used by several areas get one owning area.
4. **Brief.** Write `.agents/plans/<slug>/agent-brief.md` from the [template](references/agent-brief-template.md). Workers read it by absolute path from the main checkout.
5. **Phase A, contracts** (only when areas share contracts): workers create types, schemas, and constants. Merge all before phase B.
6. **Phase B, code**: workers move and rewrite implementation and tests. Merge.
7. **Phase C, review**: one reviewer per area against the brief checklist and the rule audit. Merge, then spot review.
8. **Finish.** Coordinator wiring (Nix installs, entry files, docs that name moved paths), then the full checklist.
9. **Hand off.** Summarize in chat: checks before and after, behavior changes, unverified items, open gaps. When the user asks for the PR, run [finish-feature](../finish-feature/SKILL.md); the PR body carries the same summary.

## Gates

- Every worker prompt starts with the branch reset and the brief check from the template; a worker that cannot confirm them stops.
- After each merge, the full project check passes before the next phase starts. Fix integration breakage in the integration worktree, not in a new worker.
- A worker report without before and after numbers is incomplete; ask the worker to finish it.
- Do not claim behavior is unchanged without the evidence listed in the checklist.
- Update [known pitfalls](references/known-pitfalls.md) with every new problem before handing off.
