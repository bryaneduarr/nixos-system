{ pkgs, ... }:
let
  worktreeDev = pkgs.callPackage ../../scripts/worktree-dev { };
in
{
  home.file.".local/bin/worktree-dev".source = "${worktreeDev}/bin/worktree-dev";
}
