let
  appearance = import ../../desktop/appearance-constants.nix;
in
{
  general = {
    gaps_in = appearance.gaps.inner;
    gaps_out = appearance.gaps.outer;
    gaps_workspaces = 50;
    border_size = 0;
    "col.active_border" = "rgba(33ccffee) rgba(00ff99ee) 45deg";
    "col.inactive_border" = "rgba(595959aa)";
    layout = "dwindle";

    # Monitor
    allow_tearing = true; # Allows gpu to send a new frame to the monitor immediately, even if the monitor isn't ready for a full refresh cycle.
  };
}
