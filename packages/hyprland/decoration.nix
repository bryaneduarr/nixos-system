let
  appearance = import ../../system/desktop-session/appearance-constants.nix;
in
{
  decoration = {
    inherit (appearance) rounding;
    rounding_power = 2.5;

    blur = {
      enabled = true;
      inherit (appearance.blur) size passes;
      ignore_opacity = true;
      xray = false;
      new_optimizations = false;
    };

    dim_inactive = false;
  };
}
