_: {
  boot.loader = {
    efi.canTouchEfiVariables = true;

    systemd-boot = {
      enable = true;

      windows.windows = {
        title = "Windows 11";
        efiDeviceHandle = "HD0b";
        sortKey = "y_windows";
      };

      edk2-uefi-shell = {
        enable = true;
        sortKey = "z_edk2";
      };
    };
  };
}
