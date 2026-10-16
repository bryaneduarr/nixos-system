# Code quality

These rules are mandatory for every language in this repository: Nix, shell, TypeScript, and Lua.

## Simplicity and task scope

- Keep all code as simple as possible while achieving the requested goal correctly. Simplicity means clarity and necessity, not the fewest lines.
- Implement only what the task and its required use case need. Do not add unrequested features, speculative options, unused configuration, or unnecessary module layers.
- Make future expansion practical through clear responsibilities. Extend the implementation when another use case is needed, not in anticipation of hypothetical requirements.
- Preserve necessary validation, assertions, error handling, and correctness. Required safeguards are not bloat.
- Preserve existing system behavior unless the user requests a behavior change. A refactor must not change what any target builds or activates.
- Inspect the working tree before editing and preserve unrelated user changes, including deletions.

## Readability and functions

- Keep the primary behavior of a file focused and its execution flow easy to follow without navigating through unnecessary wrapper layers.
- Isolate complicated logic in descriptively named functions or files when that improves readability, even with one current consumer. Keep necessary decisions and the order of operations visible in the main file.
- Extraction must clarify responsibilities, not merely hide complexity behind forwarding wrappers.
- Do not introduce forwarding wrappers without validation, transformation, error handling, or another concrete responsibility.
- Prefer explicit, simple implementations and useful inference over duplicate definitions.
- Reuse code when it genuinely reduces duplication, not merely to add layers.
- Do not sacrifice clarity to abstraction or correctness to file-size targets.

## Self-explanatory code

Code is written for the next reader, not its author. These rules apply to every language.

- Names state exactly what a function, variable, constant, or file does or holds, such as `isPaneInWorkspace` or `readSessionRegistry`. A reader must understand the code from names and flow without comments.
- Do not write long conditions that combine several unrelated checks inline. Give each check a named boolean or a validation function that names the rule it enforces, then combine the names. Prefer schema validation for checking the shape of external data.
- Store repeated literals (strings, numbers, patterns, paths) in named constants. Inline a literal only when it is used once and its meaning is obvious.
- Declare values once and keep them immutable: `const`, `readonly`, Nix `let`, `local` (and `readonly` in shell when the value never changes). Reassign or mutate only when the algorithm requires it. Leave no unused variables, parameters, or imports.

## Examples and placeholders

- Do not hardcode personal information, real email addresses, API keys, tokens, UUIDs, or private identifiers unless the task explicitly requires them. The configured username and existing host names are allowed where the system needs them.
- Use neutral fictional values such as `example@example.com` in examples and tests.
- Never commit credentials or secrets. Secrets stay out of the Nix store and out of Git.

## Comments

These rules apply to `#`, `//`, `/** */`, and `--` comments alike.

- Write code that is understandable without explanation: descriptive names, focused functions, and a straightforward flow.
- Required documentation is not optional: Nix option `description` fields and TypeScript contract comments follow [nix.md](nix.md) and [typescript.md](typescript.md).
- Tests follow these rules too. Outside required documentation, do not add comments that restate what the code, configuration, or script already shows, such as narrative, summary, section-banner, or usage comments.
- Add a comment only when it records something the code cannot express and a future maintainer needs: a non-obvious external constraint, a value that must stay in sync elsewhere, a workaround for an upstream bug with its link, or a reason an apparently simpler change would break behavior. Keep it to one short line when possible.
- Simplify unclear code instead of explaining it.
- Do not comment functions, methods, or procedures, including `/** */` doc comments above them; the name and signature describe them. Comment inside a function only for genuinely difficult logic that renaming or splitting cannot make clear.
- Do not prefix comments with `Why:` or `What:`. Do not use numbered step comments, decorative separators, or label-style comments.
- Do not mention "human readable", "human friendly", or "human-like" in comments. Avoid pronouns addressing the reader.
- End complete comment sentences with a period. Use plain keyboard characters; no em dashes or decorative Unicode.
- When editing a file that has comments violating these rules, remove or fix them in the lines you touch. Do not sweep unrelated files.

## README files

- Do not create README files or other documentation files for features, packages, services, or scripts unless the user asks for one. Self-explanatory code replaces them.
- Keep a requested README short and precise: what the feature is and what someone must do to use or maintain it.
- READMEs contain only instructions, guides, processes, and the overall structure a newcomer needs. They are not changelogs or inventories of features, files, packages, or options.
- Do not add README content because a feature, module, or package was added. Change a README only when the user asks for specific content, or when an instruction, process, or structural statement it already makes becomes incorrect.
- When something is removed from the project, remove its README mentions so the text reads as if it never existed. Never write that something was removed, replaced, renamed, or deprecated.
- Record feature details, progress, and other agent-facing facts in `.agents/project-context/`, never in READMEs.

## Required delivery behavior

- Before implementation, inspect ownership and required related relocations; before completion, review the affected ownership area as well as the scoped diff.
- Do not describe a change as complete while a known applicable rule violation or required related relocation remains unresolved.
- Report the actual changes, the verification performed, and any blockers or limitations.
- Before completion, run the diagnostics below for every changed file and resolve every error and warning they report. Report any language left unchecked.
- Do not claim that evaluation, a build, or a type check proves runtime behavior. Only an activated system or an executed test shows that.
- Do not run `nrs`, `nixos-rebuild switch`, or any activation merely to validate a change. Activation requires an explicit request.
- Consult [verification and tools](../methods/verification-and-tools.md) to choose checks. It does not impose additional requirements.

## Diagnostics

Agents cannot see editor diagnostics, so they run the command-line equivalent of every language server configured in `nvim/lua/plugins/lsp.lua` and the linters next to it:

- TypeScript (`ts_ls`, Biome): `tsc --noEmit`, `biome ci`, and `knip` from the owning project.
- Nix (`nil_ls`): `nil diagnostics <file>`, `statix check`, `deadnix`, and `nixfmt --check`.
- Shell (`bashls`): `shellcheck` and `shfmt -d`.
- Lua (`lua_ls`): `lua-language-server --check` as described in the verification guide, and `stylua --check`.
- C and C++ (`clangd`): `clang-tidy` when the project has a compile database.
- CSS (`cssls`): `biome ci`.
- HTML, Tailwind, and Emmet have no command-line diagnostics; report them as unchecked.

`check-code` runs all of these on Git-changed files, or on the paths given, and lists unchecked files. When a language server is added to `lsp.lua`, add its command-line equivalent here and to `scripts/check-code/` in the same change.

## Decision priority

When valid approaches conflict, prefer, in order:

1. Correct behavior on every affected target.
2. Type safety: typed Nix options, strict TypeScript, checked shell.
3. Declarative Nix over imperative scripts.
4. Clear responsibility boundaries.
5. Readability.
6. Maintainability.
7. Simple implementation.
8. Reuse that genuinely reduces duplication.
9. Performance optimization supported by a demonstrated need.
