{
  description = "Main Flake Configuration";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

    home-manager = {
      url = "github:nix-community/home-manager?ref=master";
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
    {
      # This configuration is named 'nixos' and follows the standard 'nixpkgs' library to build the NixOS system.
      nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";

        specialArgs = {
          inherit inputs;
        };

        modules = [
          {
            nixpkgs = {
              config.allowUnfree = true;
              overlays = [
                (_: prev: {
                  ly = prev.ly.overrideAttrs (oldAttrs: {
                    # Remove postPatch since ZIG_GLOBAL_CACHE_DIR isn't available yet.
                    postPatch = "";
                    # Move the zig-packages symlink to preBuild where ZIG_GLOBAL_CACHE_DIR is set.
                    preBuild = ''
                      # Create the zig cache directory
                      mkdir -p $ZIG_GLOBAL_CACHE_DIR
                      # Link the zig packages - recompute the deps path at build time
                      ln -s ${prev.callPackage (prev.path + "/pkgs/by-name/ly/ly/deps.nix") { }} $ZIG_GLOBAL_CACHE_DIR/p
                    ''
                    + (oldAttrs.preBuild or "");
                  });
                })
              ];
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

      packages.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.hello;
    };
  }
