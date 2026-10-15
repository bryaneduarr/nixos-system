{ pkgs, ... }:
{
  imports = [
    ./system/users.nix
    ./services.nix
    ../modules/nixos/playwright
  ];

  wsl = {
    enable = true;
    defaultUser = "bryaneduarr";
  };

  users.users.bryaneduarr.extraGroups = [ "docker" ];

  custom.playwright.enable = true;

  nixpkgs.overlays = [
    (_: previous: {
      pythonPackagesExtensions = previous.pythonPackagesExtensions ++ [
        (_: pythonPrevious: {
          sentence-transformers = pythonPrevious.sentence-transformers.overridePythonAttrs {
            doCheck = false;
            nativeCheckInputs = [ ];
          };

          torchaudio = pythonPrevious.torchaudio.overridePythonAttrs {
            doCheck = false;
            nativeCheckInputs = [ ];
          };

          duckdb = pythonPrevious.duckdb.overrideAttrs (old: {
            env = (old.env or { }) // {
              CMAKE_BUILD_PARALLEL_LEVEL = "1";
              SKBUILD_BUILD_TOOL_ARGS = "-j1";
            };
          });
        })
      ];
    })
  ];

  nix.settings = {
    experimental-features = [
      "nix-command"
      "flakes"
    ];
    max-jobs = 1;
    cores = 2;
  };

  programs = {
    zsh.enable = true;
    fish.enable = true;
    nix-ld.enable = true;
  };

  security.sudo = {
    enable = true;
    wheelNeedsPassword = true;
  };

  environment.systemPackages = [ pkgs.postgresql_18 ];

  time.timeZone = "America/El_Salvador";
  system.stateVersion = "25.05";
}
