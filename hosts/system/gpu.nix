{ config, ... }:
{
  hardware.graphics = {
    enable = true;
    enable32Bit = true; # 32 bit graphic support for steam/proton.
  };

  services.xserver.videoDrivers = [ "nvidia" ]; # Tell x11 to use nvidia driver.

  hardware.nvidia = {
    modesetting.enable = true; # Enable kernel mode setting.

    powerManagement.enable = false;
    powerManagement.finegrained = false;

    open = true; # Enable nvidia open kernel modules for stability, better performance and getting the latest.

    nvidiaSettings = true; # The gui settings for nvidia.

    package = config.boot.kernelPackages.nvidiaPackages.stable; # Use the stable nvidia diver that matches the current kernel.
  };
}
