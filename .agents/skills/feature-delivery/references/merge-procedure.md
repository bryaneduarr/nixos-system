# Merge procedure

## Integration worktree

The main checkout may hold the user's staged work, which blocks merges. Merge in a separate worktree:

```sh
git worktree add -b <feature>-integration .claude/worktrees/<feature>-integration <feature-branch>
```

Install dependencies there once. Merge each finished worker branch as soon as its report arrives; order does not matter within a phase.

```sh
git merge --no-ff --no-edit <worker-branch>
```

Check the worker branch's merge base first. If it is not the feature branch or the integration branch, discard the work and relaunch the worker.

## Resolving conflicts

- **Import-only hunks:** keep both sides, then remove duplicate import lines and imports of files that no longer exist. Lint does not remove duplicates.
- **Modify/delete:** one side moved or split the file. Keep the deletion, then apply the other side's change to the new file. `tsc` errors about missing modules list every stale import.
- **Parallel designs of one thing:** keep the version owned by the area that owns the contract and delete the other. Search exported names across areas after each merge to catch duplicates that merged without conflict.
- **Entry files:** the coordinator writes the final version; keep the registration order.

After resolving: format, run the full project check, run the behavior checks from the checklist, then commit the merge.

## Between phases

Add phase notes to the brief: merge decisions, duplicates removed, items left open. Remove finished worker worktrees and branches:

```sh
git worktree remove --force --force .claude/worktrees/agent-<id>
git branch -D worktree-agent-<id>
```

## Finishing

Fast-forward the feature branch from the main checkout; unrelated staged files do not block a fast-forward:

```sh
git merge --ff-only <feature>-integration
```

Then remove the integration worktree and branch.

## Commits with a dirty index

When the user has staged work, never commit the whole index. Path-limited commits (`git commit -- <paths>`) work for additions and edits. To record deletions of files that still exist on disk, build the commit from a temporary index:

```sh
export GIT_INDEX_FILE=$(mktemp -u)
git read-tree HEAD
git rm -r --cached <paths>
commit=$(git commit-tree "$(git write-tree)" -p HEAD -m "<message>")
unset GIT_INDEX_FILE
git update-ref refs/heads/<feature-branch> "$commit"
git rm -r --cached <paths>
```
