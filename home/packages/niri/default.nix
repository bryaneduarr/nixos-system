{ pkgs, osConfig, ... }:
{
  xdg.configFile."niri/config.kdl".source =
    pkgs.runCommand "niri-config.kdl"
      {
        nativeBuildInputs = [ osConfig.programs.niri.package ];
      }
      ''
        niri validate --config ${./config.kdl}
        cp ${./config.kdl} $out
      '';
}
