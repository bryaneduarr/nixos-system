let
  flake = builtins.getFlake ("path:" + toString ../..);
  inherit (flake.inputs.nixpkgs) lib;

  checkTarget =
    target:
    let
      home = flake.nixosConfigurations.${target}.config.home-manager.users.bryaneduarr;
      commands = builtins.filter (package: (package.name or "") == "nfu") home.home.packages;
      shellDefinitions = [
        home.programs.zsh.initContent
        home.programs.fish.shellInit
        home.programs.fish.interactiveShellInit
      ];
    in
    assert lib.assertMsg (builtins.length commands == 1) "${target} must install one nfu command";
    assert lib.assertMsg
      (lib.hasInfix ''exec bash "$HOME/nixos-system/scripts/update-all-packages/update-all-packages.sh" "$@"'' (builtins.head commands)
      .text)
      "${target} nfu must run the checkout's update-all-packages.sh";
    assert lib.assertMsg (
      !(home.programs.fish.functions ? nfu)
      && !(home.programs.fish.shellAliases ? nfu)
      && !(home.programs.zsh.shellAliases ? nfu)
      && builtins.all (
        text: builtins.match ".*(nfu[[:space:]]*\\(\\)|function[[:space:]]+nfu).*" text == null
      ) shellDefinitions
    ) "${target} shells must not define nfu";
    true;
in
lib.genAttrs [
  "nixos"
  "wsl-x86_64"
  "wsl-aarch64"
] checkTarget
