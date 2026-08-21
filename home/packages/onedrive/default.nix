{ ... }:
{
  imports = [
    ./enable.nix
    ./package.nix
    ./remote.nix
    ./paths.nix
    ./cache.nix
    ./flags.nix
    ./cli
    ./service.nix
    ./mount.nix
  ];

  # rclone remote name must match the section in ~/.config/rclone/rclone.conf
  # (created as [OneDrive]). Remote names are case-sensitive; the option
  # default is lowercased `onedrive`, so align it here.
  my.onedrive.enable = true;
  my.onedrive.remote = "OneDrive";
}
