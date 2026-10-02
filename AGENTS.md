# Repository instructions

These instructions apply to all work in this repository.

## Follow the repository skills

- Treat the skills under `.agents/skills/` as mandatory instructions, not optional advice.
- Before each task, inspect the current skill directories and read every applicable `SKILL.md`. Do not rely on a cached skill list or assume that a skill has not changed.
- Apply the relevant skills throughout planning, implementation, validation, and the final response. Recheck compliance before finishing.
- Always apply [unslop](.agents/skills/unslop/SKILL.md) to writing.
- Apply [code clarity](.agents/skills/code-clarity/SKILL.md) when writing or refactoring code.
- Apply [code modularization](.agents/skills/code-modularization/SKILL.md) when adding files or changing module boundaries.
- Apply [technical writing](.agents/skills/technical-writing/SKILL.md) when creating or editing documentation.
- Apply [commit workflow](.agents/skills/commit-workflow/SKILL.md) before staging, proposing, or creating commits.
- Read and follow any additional applicable skills added to `.agents/skills/` later. The links above are not an exhaustive list.
- Keep `.agents/` as agent instructions. Do not import its skills into Nix modules, install them through Home Manager, or generate system configuration from them.

## Group Nix attribute prefixes

- In each attribute set, declare a shared static attribute prefix once and put its children in one nested set.
- Do not repeat dotted assignments such as `home.packages`, `home.sessionPath`, and `home.file`. Use `home = { ... };` instead.
- Apply this rule at every nesting level, including `xdg`, `systemd.user`, `programs`, and `home.file`.
- Do not mix `home = { ... };` with separate `home.*` assignments in the same set, even if the linter does not report them.
- A single dotted assignment is allowed when its prefix has no other siblings in that set.
- Keep quoted attribute names intact. Dots inside a quoted filename or MIME type are part of the key, not nested attribute prefixes.
- Do not merge declarations across separate modules or scopes. Preserve their values, overrides, and behavior.

For example, use one parent declaration:

```nix
home = {
	packages = [ ];
	sessionPath = [ ];
	file.".local/bin/example" = {
		executable = true;
		text = "";
	};
};
```

This rule addresses Statix's `repeated_keys` diagnostic, `W20`. Nix can accept repeated prefixes even when Statix warns about them.

## Validate the current changes

- Inspect staged, unstaged, and untracked changes. Preserve unrelated work and the existing staging state.
- Review every existing Nix file in the current change set, not only files edited during the latest task.
- Run `statix check` on each changed Nix file and fix all `W20` diagnostics. Also check manually for mixed parent-set and dotted declarations.
- Format changed Nix files with `nixfmt` and verify them with `nixfmt --check`.
- Run `git diff --check`, relevant tests, and Nix evaluation checks before reporting completion.
- For structure-only changes, compare the evaluated settings before and after the change to confirm that behavior remains unchanged.
- Use `nrs` when a system rebuild is required. Do not activate the system merely to validate a refactor.
