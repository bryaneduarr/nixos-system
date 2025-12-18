_: {
  boot.loader = {
    efi.canTouchEfiVariables = true;

    systemd-boot = {
      enable = true;

      windows = {
        "windows" =
          let
            boot-drive = "HD0b";
          in
          {
            title = "Windows 11";
            efiDeviceHandle = boot-drive; # EFI partition handle for Windows boot.
            sortKey = "y_windows";
          };
      };

      edk2-uefi-shell.enable = true;
      edk2-uefi-shell.sortKey = "z_edk2";
    };
  };
}
