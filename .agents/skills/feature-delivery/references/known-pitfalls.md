# Known pitfalls

Problems met in earlier runs, each with its fix. Add new ones before handing off.

## Workers

- **Worktrees start from `main`.** The subagent tool created 7 of 8 worktrees from the default branch, so workers saw stale code. Every worker prompt resets to the feature branch and checks a branch-only file.
- **Briefs are not in the worktree.** Plans are gitignored. Workers read the brief by absolute path from the main checkout.
- **Wrong baseline.** A worker counted errors from a local binary that did not exist, so a failed command counted as zero errors. Use tools on `PATH`, and treat a zero baseline as suspect when errors are known.
- **Rule gaps.** Workers left `| undefined`, `?.`, test casts, and long files that tools did not report. The rule audit is part of every done criterion.
- **Duplicates.** Two areas each wrote the same reader. Assign shared contracts to one area, and search exported names after each merge.
- **Broad cross-area edits.** One area's worker edited many other areas' files, causing large conflicts. Merge contracts first and keep cross-area edits to imports and call sites.
- **Unrequested documentation edits.** Workers updated README lines. Allowed only when a statement became wrong; the coordinator reviews them.
- **Unassigned files.** An area table built from folder globs missed a file with findings, so no worker fixed it. Build the area table from the actual finding or file list and check that every listed file has exactly one owner.
- **Misread check results.** A worker reported a failing check because Biome printed a warning, but `biome ci` exited 0. Re-run any reported failure yourself and judge by the exit code.
- **Unconstructible library types.** End-to-end tests of whole extensions need fakes of APIs with per-event overloads or classes with private members; no narrow interface fits. Keep those casts in `.test-double.ts` files, allowlisted with the reason, and keep tests cast-free.
- **Claimed behavior equivalence.** Workers describe changes as equivalent without proof. Require the behavior evidence from the checklist.

## Merging

- **Staged user work blocks merges.** Merge in an integration worktree and fast-forward at the end.
- **Modify/delete conflicts** from parallel moves; resolve by porting the change into the new file.
- **Keep-both import hunks** leave duplicate imports; remove them before checking.
- **Path-limited commits cannot delete files that still exist on disk.** Use the temporary-index commit in the merge procedure.

## Runtime and packaging

- **Different runtimes.** A detached worker runs on plain Node outside the application's module aliases, so it cannot import aliased packages. Check every entry's runtime and version.
- **Third-party raw TypeScript** fails strict type checks. Map the import to a small declaration through tsconfig `paths`, and verify the runtime still loads the real module.
- **Nix sandbox has no `/usr/bin/env`.** Run package scripts with `node <script>` instead of their shebang.
- **Fixed-output dependencies** cannot reference store paths, must keep `node_modules` as a nested folder for type resolution, and use `bun install --cpu='*' --os=linux` so one hash fits every system.

## Rule audit

- **Linters that contradict the audit.** Biome's `useOptionalChain` suggested the `?.` the audit forbids. Turn off any linter rule that pushes code against a project rule.
- **Module-level state breaks test order.** An extension read `XDG_STATE_HOME` when its module loaded, so a new test that imported it first broke another test. Resolve environment-dependent paths when used, not at import.
- **Pattern false positives.** The first `nullable-union` pattern also matched `undefined ||`. When a worker rewrites correct code only to satisfy the audit, fix the audit pattern and add a test instead.

## Shell and tooling in agent sessions

- **zsh does not split `$VARIABLE`** into words; use arrays or `find -exec`.
- **Heredocs and long chained commands can hang** in agent shells; write files with the editor tool.
- **Perl substitutions with backticks or `#`** in the text fail to parse; use the editor tool for multi-line edits.

## Not verified in earlier runs

- Real application runtime before activation, aarch64 builds, interactive terminal behavior, and extension load time after splitting code into many small files.
