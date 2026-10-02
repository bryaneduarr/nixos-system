{ pkgs, osConfig, ... }:
let
  appearance = import ../../desktop/appearance-constants.nix;
  windowGap = appearance.gaps.inner * 2;
  outerStrut = appearance.gaps.outer - windowGap;

  substitutions = {
    "@windowGap@" = toString windowGap;
    "@outerStrut@" = toString outerStrut;
    "@blurPasses@" = toString appearance.blur.passes;
    "@blurOffset@" = toString appearance.blur.size;
    "@rounding@" = toString appearance.rounding;
  };

  configText =
    builtins.replaceStrings (builtins.attrNames substitutions) (builtins.attrValues substitutions)
      (builtins.readFile ./config.kdl);

  configFile = pkgs.writeText "niri-config.kdl" configText;
in
{
  xdg.configFile."niri/config.kdl".source =
    pkgs.runCommand "niri-config.kdl"
      {
        nativeBuildInputs = [ osConfig.programs.niri.package ];
        passthru = {
          inherit configText;
        };
      }
      ''
        niri validate --config ${configFile}
        cp ${configFile} $out
      '';
}
