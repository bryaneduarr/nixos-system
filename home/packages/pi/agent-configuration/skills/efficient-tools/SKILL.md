---
name: efficient-repository-workflow
description: Choose between search, read, edit, run, and web research tools for repository work and external questions.
---

# Efficient repository workflow

Use this skill to choose the right tool for a repository question or external research. Use what is already known, make the smallest useful call, and inspect the result before widening the search.

## Decide before each call

1. What specific question or change does this call address? If the answer is already in context, do not call a tool.
2. Is the path/symbol known? If not, locate it first. Is the result textual, structural, semantic, or an exact file slice? Choose accordingly.
3. Can a dedicated tool do it? Prefer that over a shell command. Scope by path, symbol, and output size; do not search the whole monorepo by default.
4. What result would count as success? Check the path, symbol identity, omitted-result count, exit status, and whether the file was modified or ignored. A blank result is not proof of absence.
5. If a tool is unavailable, use the closest equivalent _available in this host_. Never invoke an assumed CLI, script, LSP command, or MCP tool without checking that it exists.

## Tool routing

| Need                                                       | Preferred tool in Pi                                                                                                      | Equivalent in another host or fallback                                                         | Avoid                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Locate filenames or find tests                             | `search` with `kind: "file"` and a narrow `path` when known                                                               | Native file search; shell `rg --files -g '*name*'` or `fd` if no file-search tool              | `find .`, `ls -R`, guessing a path and declaring it absent                                                  |
| Find a literal, log message, import, or configuration key  | `search` with `kind: "text"` and a bounded path                                                                           | Native text search; `rg -n -F 'text' apps/web`                                                 | Reading every file or `rg 'text' .` without a reason                                                        |
| Find a declaration or usages of a _specific symbol_        | Read-only LSP document/workspace symbols, definition, references when available; otherwise `search` with `kind: "symbol"` | Native semantic navigation; bounded text search if the language server is unavailable          | Treating same-spelled names or comments as confirmed usages                                                 |
| Find a code _shape_ such as calls regardless of whitespace | `search` with `kind: "structural"` if supported                                                                           | ast-grep with a valid language and pattern; otherwise a bounded text search with manual review | A regex match claimed to prove syntax or behavior                                                           |
| Understand a known file or function                        | `read` by symbol or bounded `offset`/`limit`                                                                              | Native file reader with line ranges; shell `sed -n '20,80p' path` only if no reader exists     | Full-file `cat` or unbounded output when a slice suffices                                                   |
| Change code or prose                                       | `edit` with exact `oldText` and `newText`, or create/move/delete as needed                                                | Native patch/editor tool; shell redirection only if no edit tool exists                        | Editing before reading the relevant slice; replacing unrelated occurrences                                  |
| Inspect JSON/YAML or package scripts                       | `read` a small section; use `run` with `jq`/`yq` if an actual structured query is needed                                  | Native structured-data tool                                                                    | Dumping entire config files for one key                                                                     |
| Inspect working-tree changes                               | `run` with `git status --short` and `git diff -- path` (or native git tools)                                              | Native diff/status tool                                                                        | Assuming a clean tree, overwriting user changes, or reviewing only unstaged diff when staged changes matter |
| Research external/current facts                            | `web_search` to find sources, `fetch_content` for selected pages, `get_search_content` for stored passages, `source_check` for claim evidence | Host web tools when permitted | Treating search snippets as verified documentation |

`run` is for shell-only operations such as Git, scripts, and commands without a dedicated tool. It is not a substitute for `search`, `read`, or `edit`. For external information, follow the `web-research` skill.

## How to read results

- `search` results may be capped or classified. If it reports omitted matches, narrow by directory or query before deciding you have seen every match.
- No matches can mean wrong spelling, wrong scope, an ignored/hidden file, a deleted file, or an unavailable index. Check `git status --short` if a known tracked path seems missing. Ripgrep normally skips hidden and ignored files; use `--hidden` or an exact path only when that is the question.
- An LSP definition pointing to the intended declaration is stronger evidence of identity than a same-name text hit. LSP references can still require review for generated code or incomplete indexes. Put the cursor on the identifier, not nearby punctuation.
- A structural match proves a syntactic pattern, not runtime behavior. Read the surrounding code before editing. A text match in a comment or test fixture does not establish a production call site.
- Before edits, inspect the relevant slice and working-tree state. Inspect the scoped diff afterward to avoid changing unrelated work.

## Examples with expected outcomes

These examples show how to judge a result. Any quoted output is illustrative, not a claim about the current tree.

### Locate, then read

Question: "Where is the web app's package script?" Call `search({query:"package.json", kind:"file", path:"apps/web"})`, then `read({path:"apps/web/package.json", limit:80})`.

- Correct: the search identifies `apps/web/package.json`, and the read shows the exact script being discussed.
- Incorrect: a search for `package.json` across every dependency returns many matches and the first result is assumed to belong to the web app. Narrow to `apps/web`.
- Incorrect: `read` returns `ENOENT`; do not invent the contents. Recheck the path or working tree.

### Handle a missing or deleted path

Question: "Why can't I read a known reference?" If `read({path:"docs/references/primitives.md"})` returns `ENOENT`, use `run` for `git status --short -- docs/references/primitives.md`.

- Correct: a status line starting with ` D` explains that a tracked file is deleted in the working tree. Preserve the deletion unless the user asks to restore it; remove stale references in the file you are authorized to edit.
- Incorrect: `ENOENT` is reported as proof the file never existed, or `git checkout` silently restores it.

### Distinguish text from semantics

Question: "Which calls use `parse`?" Start with a bounded text or structural search to locate candidates; use LSP references for a _particular_ imported `parse`, and read the caller before changing it.

- Correct: references resolve to the chosen declaration; a structural search confirms the candidate is a call such as `parse(input)`.
- Incorrect: `search({query:"parse", kind:"text"})` also returns a comment and another module's `parse`. Do not label both as usages of the same function.
- Incorrect: no LSP result is interpreted as proof of no callers. Check the cursor position, index availability, and a bounded fallback search.

### Edit a known file

Question: "Change a line in this skill." Read its relevant lines, check `git status --short`, apply one exact `edit` replacement, then inspect the scoped diff with `run`.

- Correct: the diff contains only the intended lines.
- Incorrect: `replaceAll` changes other examples too, or another person's deletions are silently restored.

## Sources for the tool choices

- [ripgrep guide](https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md): file listing and default hidden/ignore behavior.
- [ast-grep quick start](https://ast-grep.github.io/guide/quick-start.html): syntax-tree patterns versus text matching.
- [Language Server Protocol 3.17](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/): definition and references requests.
- [Git diff documentation](https://git-scm.com/docs/git-diff): scoped diff and staged versus unstaged comparisons.
