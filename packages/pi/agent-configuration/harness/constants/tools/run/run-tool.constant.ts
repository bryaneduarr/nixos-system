import { RUN_DIR, WORK_DIR } from "../artifacts/workspace.constant.ts";

export const RUN_TOOL_LABEL = "Run";

export const RUN_TOOL_DESCRIPTION = [
  "Run a shell command when no specialized tool covers the operation.",
  "Commands already start in the session directory; never prefix them with `cd`, and pass `cwd` to run elsewhere.",
  `Captures exit code, compresses large output, and stores the full output under ${WORK_DIR}/${RUN_DIR}.`,
  "The exit code is the last command's; use `set -o pipefail` or `&&` when earlier pipeline steps must succeed.",
  "The host is NixOS: run missing tools with `nix shell nixpkgs#<package> -c <command>`.",
].join(" ");

export const RUN_TOOL_PROMPT_SNIPPET = "Run shell commands not covered by search, read, or edit";

export const RUN_TOOL_GUIDELINES = [
  "Use run only when search, read, or edit does not cover the operation: read files with read, not cat, sed, head, or tail; find text and files with search, not grep, rg, find, or ls.",
  "Do not start run commands with `cd`; set `cwd` instead.",
  "In shell commands, use `fd` instead of `find` and `rg` instead of `grep`; both are faster and skip ignored files.",
  "Use `ast-grep` for code shapes, `jq` for JSON, and `yq` for YAML instead of Python or `sed` one-liners.",
  "Scope shell searches to the project or a known folder, never the whole home directory or `/`.",
  "Also installed: `xxd`, `dig`, `lsof`, `pstree`, and `brotli`; apt, dpkg, and pip installs are unavailable.",
] as const;
