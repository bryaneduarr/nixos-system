{
  biome,
  callPackage,
  clang-tools,
  coreutils,
  deadnix,
  git,
  lib,
  lua-language-server,
  neovim,
  nil,
  nixfmt,
  nodejs,
  shellcheck,
  shfmt,
  statix,
  stylua,
  typescript,
  writeShellApplication,
}:
let
  ruleAudit = callPackage ../rule-audit/rule-audit-package.nix { };

  scriptFiles = [
    ./modules/record-check-results.sh
    ./modules/collect-target-files.sh
    ./modules/check-nix-files.sh
    ./modules/check-shell-files.sh
    ./modules/check-typescript-projects.sh
    ./modules/check-lua-files.sh
    ./modules/check-c-files.sh
    ./modules/check-web-files.sh
    ./check-code.sh
  ];
in
writeShellApplication {
  name = "check-code";
  runtimeInputs = [
    biome
    clang-tools
    coreutils
    deadnix
    git
    lua-language-server
    neovim
    nil
    nixfmt
    nodejs
    ruleAudit
    shellcheck
    shfmt
    statix
    stylua
    typescript
  ];
  text = lib.concatMapStringsSep "\n" builtins.readFile scriptFiles;
}
