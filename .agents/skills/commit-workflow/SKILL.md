---
name: commit-workflow
description: Plan and create atomic, dependency-ordered commits for every commit on any branch of this repository. Use before staging, proposing, or running git commit, including after implementation tasks; review all staged, unstaged, and untracked changes, write concise Conventional Commit messages, apply the plan without asking for approval, and report each commit and its files.
---

# Commit workflow

Apply this workflow before **every** commit on **every** branch of this repository. Do not wait for a request to split commits. All commit titles, bodies, plans, and final commit reports must be in English. Do not use pronouns or references to people in commit messages; describe the code and its purpose instead. Keep the plan internal unless a blocker requires escalation; after committing, report the results.

## 1. Discover the full change set

- Check the branch and working tree with `git status --short --branch`. Inspect staged and unstaged diffs separately with `git diff --cached` and `git diff`; include `--stat`, `--name-status`, and targeted diffs when the output is large. Inspect untracked files explicitly, including content not shown by `git diff`. Check renamed, deleted, binary, ignored, and generated paths as needed. Do not assume that the index or working tree contains only changes from the current task.
- Read enough surrounding source to understand what changed, not just the filenames. Classify changes by purpose: source, tests, configuration, documentation, migrations, generated output, styles, UI, and accidental or unrelated edits. Inspect existing staged hunks before altering the index.
- Identify dependencies between changes and distinguish independent changes from inseparable ones. Never silently discard, overwrite, amend, or include unrelated work. If the scope of a pre-staged or pre-existing change is uncertain, leave it untouched and report the blocker rather than guessing.

## 2. Plan and review the commits before applying any

- Partition the intended changes into the smallest coherent, independently reviewable units. Group by behavior or purpose, not merely by directory or file type. Split independent features or fixes even when located in the same file, using hunk-level staging or a safe temporary patch when necessary.
- Put foundations before consumers: types, schemas, database migrations, API contracts, shared utilities, configuration, reusable components, and shared hooks precede dependent features, pages, and UI. Each intermediate commit should make sense on its own and remain buildable when practical. If a strict dependency order conflicts with a useful test pairing, keep the test with the behavior it validates and explain the choice.
- Keep tests with the feature or fix they verify. Keep related docs with the behavior change. Separate project-wide dependency, build, tooling, or configuration changes when independently reviewable. Include generated files only when required by the related source change; exclude accidental artifacts.
- For each proposed commit, record the exact paths or hunks, dependency on earlier commits, title, short body, and applicable checks. Critique the plan: flag broad commits, unrelated files, and splits that break a coherent behavior. Revise weak groupings before committing. If a file spans commits, split its hunks carefully; if a clean split would break the build or distort the history, keep it together and explain that tradeoff in the final report.
- Split as far as meaningful review allows, not into artificial one-file or formatting-only commits that separate inseparable behavior. Do not create an omnibus commit because staging is inconvenient.

## 3. Write the messages

- Use Conventional Commits **only in the title**: `type(scope): imperative summary` or `type: imperative summary`. Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `build`, `ci`. Use a scope when it clarifies the change.
- Limit the entire title to 50 characters. Wrap every body line at 72 characters or fewer. Separate title and body with a blank line. Do not add Conventional Commit prefixes or labels to the body.
- In a short body, state **what changed, why it was needed, and what purpose or behavior it enables**. Explain causal intent, not a file inventory or an unsupported claim. Mention a migration or compatibility consequence when relevant. Avoid vague titles such as `update files`, `fix stuff`, `changes`, `refactor code`, or `improve things`.
- Never write meta-commentary such as "human readable", "human like", or references to an agent, reviewer, or user. Avoid pronouns in the message, including `I`, `we`, `you`, `it`, and `they`. Name the relevant component instead.

## 4. Apply the approved-by-review plan immediately

- Do not ask for confirmation after planning. Stage **only** the files or hunks for the next commit with explicit paths, `git add -p`, or an equivalent safe patch. Never use `git add .`, `git add -A`, or `git commit -a` against a mixed working tree. When the index already contains unrelated hunks, preserve them rather than resetting or committing them by accident; use a safe isolated index or stop and report why isolation is not possible.
- Before each commit, verify `git diff --cached --check`, review `git diff --cached` and `git diff --cached --name-status`, and confirm the staged content matches the planned unit. Run relevant checks when available. Do not commit secrets, accidental files, generated noise, or failing changes knowingly. If a check cannot run, record the reason rather than claiming it passed.
- Commit with the planned title and body. Verify the resulting commit and remaining staged/unstaged/untracked state, then repeat for the next unit. Do not rewrite existing commits or force-push. If a commit fails, stop, preserve the working tree and index, and report the failure. Do not proceed with a partially applied plan without reassessing dependencies.

## 5. Report the outcome

- State the number of commits created and list each commit in dependency order with its short hash, exact title, concise description of what changed and why, and paths included. For files split across commits, identify the relevant hunks or behavior and explain the split or inseparable tradeoff. Note any excluded changes, skipped checks, or blockers. Do not claim that commits were made unless Git confirms them.

## Examples

A schema change and a page using the new field belong in separate commits when the schema can stand alone. A regression test belongs with the behavior that the test verifies:

```text
1. feat(properties): add listing status schema

   Adds a validated listing status to the property contract.
   Provides a stable field for draft-aware property flows.

   Files: packages/contracts/property.ts

2. feat(properties): show draft listing state

   Reads listing status from the property contract and renders
   draft labels. Makes unpublished listings distinguishable.

   Files: apps/web/property-card.tsx,
          apps/web/property-card.test.tsx
```

Unrelated build tooling and a feature must not share a commit. Split even when both touch one config file, provided each hunk works independently:

```text
1. build(web): configure asset hashing

   Adds content hashes to web assets to prevent stale client
   bundles after deployment.

   Files: apps/web/build.config.ts (asset naming hunk)

2. feat(web): enable map worker

   Registers the map worker for interactive property maps.
   Keeps map rendering off the main thread.

   Files: apps/web/build.config.ts (worker hunk),
          apps/web/map.tsx
```

A one-line fix and its regression test form one commit, not two artificial commits:

```text
fix(auth): reject expired refresh tokens

Checks token expiry before session renewal to prevent expired
credentials from issuing a new session.

Files: apps/api/auth.ts, apps/api/auth.test.ts
```
