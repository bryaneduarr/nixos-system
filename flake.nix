{
  description = "Main Flake Configuration";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

    home-manager = {
      url = "github:nix-community/home-manager?ref=master";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nixos-wsl = {
      url = "github:nix-community/NixOS-WSL";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    yazi-plugins = {
      url = "github:yazi-rs/plugins";
      flake = false;
    };

    tmux-tpm = {
      url = "github:tmux-plugins/tpm";
      flake = false;
    };

    zen-browser = {
      url = "github:0xc000022070/zen-browser-flake";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    awww = {
      url = "git+https://codeberg.org/LGFae/awww.git";
    };
  };

  outputs =
    {
      nixpkgs,
      home-manager,
      yazi-plugins,
      tmux-tpm,
      ...
    }@inputs:
    let
      inherit (nixpkgs) lib;

      herdrOverlay = import ./packages/herdr/overlay.nix;

      discoverModules =
        role:
        lib.concatMap
          (
            category:
            lib.pipe (builtins.readDir ./${category}) [
              (lib.filterAttrs (_: type: type == "directory"))
              builtins.attrNames
              (map (name: ./${category}/${name}/${name}.${role}.nix))
              (builtins.filter builtins.pathExists)
            ]
          )
          [
            "system"
            "services"
            "packages"
            "scripts"
          ];

      nixosTarget =
        {
          system,
          hostModule,
          homeModule,
        }:
        lib.nixosSystem {
          inherit system;
          specialArgs = { inherit inputs; };
          modules = [
            hostModule
            home-manager.nixosModules.home-manager
          ]
          ++ discoverModules "system"
          ++ [
            {
              nixpkgs = {
                config.allowUnfree = true;
                overlays = [ herdrOverlay ];
              };
              home-manager = {
                useGlobalPkgs = true;
                useUserPackages = true;
                extraSpecialArgs = {
                  inherit
                    yazi-plugins
                    tmux-tpm
                    inputs
                    ;
                };
                users.bryaneduarr.imports = [ homeModule ] ++ discoverModules "home";
              };
            }
          ];
        };

      wslTarget =
        system:
        nixosTarget {
          inherit system;
          hostModule = ./hosts/wsl/wsl.nix;
          homeModule = ./hosts/wsl/wsl.home.nix;
        };
    in
    {
      nixosConfigurations = {
        nixos = nixosTarget {
          system = "x86_64-linux";
          hostModule = ./hosts/desktop/desktop.nix;
          homeModule = ./hosts/desktop/desktop.home.nix;
        };
        wsl-x86_64 = wslTarget "x86_64-linux";
        wsl-aarch64 = wslTarget "aarch64-linux";
      };

      devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
        name = "nixos-system-brain";

        packages = with nixpkgs.legacyPackages.x86_64-linux; [
          pandoc
        ];

        shellHook = ''
          export BRAIN_ROOT="$HOME/knowledge/nixos-system"
          export PATH="$BRAIN_ROOT/bin:$PATH"
          echo "nixos-system brain devShell loaded"
          echo "  - pandoc: available"
          echo "  - Python deps (install if needed):"
          echo "    pip install sentence-transformers trafilatura"
          echo "  - Or use uv: uv pip install sentence-transformers trafilatura"
        '';
      };

      checks.x86_64-linux.pi =
        nixpkgs.legacyPackages.x86_64-linux.callPackage ./packages/pi/pi-check/pi-check.nix
          { };

      packages = {
        aarch64-linux.pi-tools =
          nixpkgs.legacyPackages.aarch64-linux.callPackage ./packages/pi/pi-tools/pi-tools.nix
            { };

        x86_64-linux =
          let
            pkgs = import nixpkgs {
              system = "x86_64-linux";
              config.allowUnfree = true;
            };
          in
          {
            default = pkgs.hello;

            pi-tools = pkgs.callPackage ./packages/pi/pi-tools/pi-tools.nix { };
          };
      };
    };
}
