# Prints the evaluated settings of the desktop target in hosts/configuration.nix.
# It asserts nothing; compare its output before and after a refactor.
let
  flake = builtins.getFlake ("path:" + toString ../.);
  c = flake.nixosConfigurations.nixos.config;
  h = c.home-manager.users.bryaneduarr;
in
{
  boot = {
    inherit (c.boot) kernelParams kernelModules extraModulePackages;
    kernel = toString c.boot.kernelPackages.kernel;
    initrd = { inherit (c.boot.initrd) availableKernelModules kernelModules; };
    loader = { inherit (c.boot.loader) systemd-boot efi; };
  };
  hardware = {
    bluetooth = { inherit (c.hardware.bluetooth) enable settings; };
    graphics = {
      inherit (c.hardware.graphics)
        enable
        enable32Bit
        extraPackages
        extraPackages32
        ;
    };
  };
  inherit (c) fileSystems desktop time;
  swapDevices = map (s: { inherit (s) device priority; }) c.swapDevices;
  fonts = {
    inherit (c.fonts) packages fontDir;
    defaults = c.fonts.fontconfig.defaultFonts;
  };
  networking = {
    inherit (c.networking) hostName;
    networkmanager = { inherit (c.networking.networkmanager) enable settings; };
  };
  services = builtins.listToAttrs (
    map
      (name: {
        inherit name;
        value = c.services.${name}.enable;
      })
      [
        "openssh"
        "postgresql"
        "tailscale"
        "pipewire"
        "libinput"
        "keyd"
        "displayManager"
      ]
  );
  docker = c.virtualisation.docker.enable;
  systemState = c.system.stateVersion;
  systemPackages = map toString c.environment.systemPackages;
  users = c.users.users.bryaneduarr;
  homeState = h.home.stateVersion;
  homePackages = map toString h.home.packages;
  pointerCursor = h.home.pointerCursor;
  tmux = h.programs.tmux.extraConfig;
  git = h.programs.git.settings;
  yazi = h.programs.yazi.settings;
  activation = builtins.mapAttrs (_: v: v.data) h.home.activation;
}
