export const DEFAULT_RUN_TIMEOUT_MS = 120_000;
export const RUN_HEAD_LINES = 60;
export const RUN_TAIL_LINES = 20;
export const MISSING_COMMAND_HINT =
  "command not found: this is NixOS, so use `nix shell nixpkgs#<package> -c <command>` instead of apt, pip, or global installs; find the package with `nix search nixpkgs <name>`.";
