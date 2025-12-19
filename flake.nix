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
    };
}
