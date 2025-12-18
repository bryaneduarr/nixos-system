{ pkgs, ... }:
{
  environment.systemPackages = with pkgs; [
    postgresql
  ];

  services.postgresql = {
    enable = true;
    package = pkgs.postgresql;
  };
}
