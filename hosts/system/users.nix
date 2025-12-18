{
  pkgs,
  ...
}:
{
  users = {
    users = {
      bryaneduarr = {
        isNormalUser = true;
        description = "Bryan Eduardo";

        extraGroups = [
          "wheel"
          "networkmanager"
        ];

        group = "bryaneduarr";
        home = "/home/bryaneduarr";

        createHome = true; # Create a home directory if it doesn't exist.
        shell = pkgs.zsh;
      };
    };

    groups = {
      bryaneduarr = { };
    };
  };
}
