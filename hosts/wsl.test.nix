# Asserts the WSL targets in hosts/wsl.nix: build limits, enabled services,
# and that desktop-only packages and features stay off.
let
  flake = builtins.getFlake ("path:" + toString ../.);
  inspect =
    target: system:
    let
      c = flake.nixosConfigurations.${target}.config;
      h = c.home-manager.users.bryaneduarr;
      packageNames = map (p: p.pname or p.name) h.home.packages;
      excluded = [
        "google-chrome"
        "zen-browser"
        "kitty"
        "waybar"
        "rofi"
        "matugen"
        "mpv"
        "awww"
      ];
    in
    assert flake.nixosConfigurations.${target}.pkgs.stdenv.hostPlatform.system == system;
    assert c.wsl.enable;
    assert c.nix.settings.max-jobs == 1;
    assert c.nix.settings.cores == 2;
    assert
      flake.nixosConfigurations.${target}.pkgs.python3Packages.duckdb.CMAKE_BUILD_PARALLEL_LEVEL == "1";
    assert
      flake.nixosConfigurations.${target}.pkgs.python3Packages.duckdb.SKBUILD_BUILD_TOOL_ARGS == "-j1";
    assert c.wsl.defaultUser == "bryaneduarr";
    assert c.system.stateVersion == "25.05";
    assert h.home.stateVersion == "25.05";
    assert !c.services.displayManager.enable;
    assert !c.programs.hyprland.enable;
    assert !c.programs.niri.enable;
    assert !c.hardware.bluetooth.enable;
    assert !c.boot.loader.systemd-boot.enable;
    assert !h.home.pointerCursor.enable;
    assert c.services.openssh.enable;
    assert c.services.postgresql.enable;
    assert c.services.tailscale.enable;
    assert c.virtualisation.docker.enable;
    assert c.custom.playwright.enable;
    assert c.environment.sessionVariables.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS == "1";
    assert builtins.any (p: (p.pname or "") == "glib") c.programs.nix-ld.libraries;
    assert builtins.elem "neovim" packageNames;
    assert h.custom.neovim.enable;
    assert h.xdg.dataFile ? "nvim/site/spell/es.utf-8.spl";
    assert h.programs.zsh.enable;
    assert h.programs.fish.enable;
    assert h.programs.tmux.enable;
    assert h.programs.git.enable;
    assert h.programs.yazi.enable;
    assert builtins.all (name: !builtins.elem name packageNames) excluded;
    assert
      builtins.match ".*@openai/codex@latest.*" h.home.activation.installBunGlobalPackages.data != null;
    assert
      builtins.match ".*chrome-devtools-mcp.*" h.home.activation.installBunGlobalPackages.data == null;
    {
      inherit system packageNames;
      derivation = c.system.build.toplevel.drvPath;
    };
in
{
  x86_64 = inspect "wsl-x86_64" "x86_64-linux";
  aarch64 = inspect "wsl-aarch64" "aarch64-linux";
}
