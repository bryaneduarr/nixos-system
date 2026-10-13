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
      wslSystem =
        system:
        nixpkgs.lib.nixosSystem {
          inherit system;
          specialArgs = { inherit inputs; };
          modules = [
            inputs.nixos-wsl.nixosModules.default
            ./hosts/wsl.nix
            home-manager.nixosModules.home-manager
            {
              nixpkgs.config.allowUnfree = true;
              home-manager = {
                useGlobalPkgs = true;
                useUserPackages = true;
                extraSpecialArgs = {
                  inherit yazi-plugins tmux-tpm inputs;
                  desktopTools = false;
                };
                users.bryaneduarr = import ./home/wsl.nix;
              };
            }
          ];
        };
    in
    {
      # This configuration is named 'nixos' and follows the standard 'nixpkgs' library to build the NixOS system.
      nixosConfigurations = {
        wsl-x86_64 = wslSystem "x86_64-linux";
        wsl-aarch64 = wslSystem "aarch64-linux";

        nixos = nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";

          specialArgs = {
            inherit inputs;
          };

          modules = [
            {
              nixpkgs = {
                config.allowUnfree = true;
              };
            }

            ./hosts/configuration.nix # General system configuration for NixOS.

            home-manager.nixosModules.home-manager # Import the home-manager configuration to manage user-specific configurations.

            {
              home-manager = {
                useGlobalPkgs = true; # Tell home-manager to use the global Nix packages that are available in the system.

                useUserPackages = true; # Enable using user-specific packages with home-manager.

                extraSpecialArgs = {
                  inherit yazi-plugins tmux-tpm inputs; # Pass to the home-manager custom plugins and configurations.
                  desktopTools = true;
                };

                users.bryaneduarr = import ./home/default.nix; # Enable the configuration we have in our system to be used with home-manager.
              };

              # Enables the nix-ld program, which allows running dynamically linked binaries that are
              # not built with Nix by providing a compatible dynamic linker and libraries. This was
              # used for Visual Studio Code to open correctly while on SSH.
              programs.nix-ld.enable = true;
            }
          ];
        };

      };

      # Development shell for brain documentation pipeline tools, for opencode ignore/remove if not needed.
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

      packages = {
        aarch64-linux.pi-tools =
          nixpkgs.legacyPackages.aarch64-linux.callPackage ./home/packages/pi/pi-tools
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

            pi-tools = pkgs.callPackage ./home/packages/pi/pi-tools { };
          };
      };
    };
}
