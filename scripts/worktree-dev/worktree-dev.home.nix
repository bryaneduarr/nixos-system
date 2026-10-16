{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.worktree-dev;
  worktreeDev = pkgs.callPackage ./worktree-dev-package.nix { };
in
{
  options.custom.worktree-dev.enable = lib.mkEnableOption "the worktree-dev command for per-worktree development servers";

  config = lib.mkIf cfg.enable {
    home.file.".local/bin/worktree-dev".source = lib.getExe worktreeDev;
  };
}
