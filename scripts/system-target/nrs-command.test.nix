let
  flake = builtins.getFlake ("path:" + toString ../..);
  inherit (flake.inputs.nixpkgs) lib;

  checkTarget =
    target:
    let
      home = flake.nixosConfigurations.${target}.config.home-manager.users.bryaneduarr;
      commands = builtins.filter (package: (package.name or "") == "nrs") home.home.packages;
      shellDefinitions = [
        home.programs.zsh.initContent
        home.programs.fish.shellInit
        home.programs.fish.interactiveShellInit
      ];
    in
    assert lib.assertMsg (builtins.length commands == 1) "${target} must install one nrs command";
    assert lib.assertMsg
      (lib.hasInfix ''exec bash "$HOME/nixos-system/scripts/system-target/rebuild.sh" "$@"'' (builtins.head commands)
      .text)
      "${target} nrs must run the checkout's rebuild.sh";
    assert lib.assertMsg (
      !(home.programs.fish.functions ? nrs)
      && !(home.programs.fish.shellAliases ? nrs)
      && !(home.programs.zsh.shellAliases ? nrs)
      && builtins.all (
        text: builtins.match ".*(nrs[[:space:]]*\\(\\)|function[[:space:]]+nrs).*" text == null
      ) shellDefinitions
    ) "${target} shells must not define nrs";
    true;
in
lib.genAttrs [
  "nixos"
  "wsl-x86_64"
  "wsl-aarch64"
] checkTarget
