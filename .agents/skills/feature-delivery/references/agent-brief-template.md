# Agent brief template

Copy into `.agents/plans/<slug>/agent-brief.md` and fill every angle-bracket field. Keep rules as links to `.agents/rules/`; add only feature-specific instructions and examples.

## Worker prompt

Every worker prompt is short and points at the brief:

```text
You are working in a git worktree of the repository at your current working directory.

First run `git reset --hard <feature-branch>` and confirm that <a file that exists only on the feature branch> exists.
If it does not, stop and report a blocker.

Read <absolute path to the main checkout>/.agents/plans/<slug>/agent-brief.md completely and follow it exactly.

Your area: <area>. Your phase: <A|B|C>.
Do the "Before you start" steps, the phase work for your area only, the phase checks, commit in your worktree,
and end with the report format from the brief.
```

## Brief sections

1. **Context.** One paragraph: the feature, the project, why the structure matters.
2. **Before you start.** Read the rule files (list them). Install dependencies (such as `bun install --frozen-lockfile`). Record the baseline with tools on `PATH`, never a guessed local binary: type errors, lint, unused code, rule audit, and tests.
3. **Fixed constraints.** No behavior change. Entry files and installed paths that must stay. Files workers must not edit (Nix, lockfiles, project configs, `.agents/`). Import style. Runtime limits, such as processes that run outside the main loader.
4. **Target layout.** Role folders and domain names every worker uses.
5. **Areas.** A table of area, current files, and tests that move with them, plus placement hints per area.
6. **Coding rules with examples.** Right and wrong snippets for the rules most often missed: absence as unions, `unknown` only into a schema, named conditions, factories instead of classes, narrow interfaces instead of test casts, constants.
7. **Cross-area edits.** Workers may change other areas' files only to update imports and call sites of what they moved; the coordinator owns entry files.
8. **Phases.** For each phase: the work and the done criteria. Done always includes zero type errors, lint, unused-code, and rule-audit findings in the area's files, and passing tests.
9. **Phase notes.** Added by the coordinator between phases: decisions made at merge, duplicates to remove, items workers left open.
10. **Report.** Exactly this block:

```text
Area: <area>  Phase: <A|B|C>
Commit: <hash>
Files created: <n>  Files moved: <n>  Files deleted: <n>
Checks: types <before -> after>, lint <before -> after>, unused <findings>, rule audit <findings>, tests <pass/fail>
Cross-area edits: <files>
Decisions: <bullets, or none>
Not done: <rule items left open and why, or none>
Blockers: <bullets, or none>
```
