# Writing

- Before writing user-facing prose, read `~/.agents/skills/unslop/SKILL.md` once per session and apply it to responses, explanations, summaries, documentation, PR descriptions, and commit messages. Use the reader's language and preserve meaning, technical accuracy, and the user's requested format. Do not rewrite code, commands, quotes, or tool output to satisfy prose rules.
- When writing or reviewing technical prose (including docs, READMEs, RFCs, explanations of code, PR descriptions, and commit messages), also read `~/.agents/skills/technical-writing/SKILL.md` once per session and apply it together with `unslop`. Keep short conversational replies concise; do not force document structure onto them. These upstream skills disable automatic model invocation, so follow these instructions by reading their files directly rather than waiting for Pi to select them. If the files are unavailable, continue without inventing their contents.

# Code changes

- Before writing or refactoring code, read `~/.agents/skills/code-modularization/SKILL.md` and `~/.agents/skills/code-clarity/SKILL.md` once per session and apply both. Do not rely on automatic skill selection for these rules. If a file is unavailable, continue without inventing its contents.
- Use neutral fictional values in examples. Do not copy personal information, secrets, or private identifiers unless the task explicitly requires the real value.

# Commits

- Before staging, proposing, or creating any commit on any branch of this repository, read `~/.agents/skills/commit-workflow/SKILL.md` and follow it for every commit. Review staged, unstaged, and untracked changes, split independent work into atomic commits in dependency order, and use the skill's commit message and reporting rules. If the installed file is unavailable, read `home/packages/pi/agent-configuration/skills/commit-workflow/SKILL.md` from this repository. Never commit unrelated work by accident.

# Tool selection

- When you need a repository tool call and must decide how to locate, read, edit, or run something, use the `efficient-repository-workflow` skill. Do not load it for replies that need no tools. Prefer the dedicated tool for each operation; use `run` for shell-only work.
- If the user refers to an attached or related image and provides a filesystem path, treat that path as a local file on this machine. Resolve relative paths from the current working directory, then inspect the image with a local image-capable tool. Do not use `fetch_content`, web search, or network access to open it. If the path is missing or the file cannot be found, ask the user for the correct path instead of guessing.
- Use the `web-research` skill and the web tools only when the user explicitly asks you to research or check information online. Do not search the web merely because a question is technical or a link appears in the request. Otherwise work with the available repository and context; if outside verification is necessary, ask first.
