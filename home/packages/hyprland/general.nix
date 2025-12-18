{
  general = {
    gaps_in = 2;
    gaps_out = 10;
    border_size = 2;
    "col.active_border" = "rgba(33ccffee) rgba(00ff99ee) 45deg";
    "col.inactive_border" = "rgba(595959aa)";
    layout = "dwindle";

    # Monitor
    allow_tearing = true; # Allows gpu to send a new frame to the monitor immediately, even if the monitor isn't ready for a full refresh cycle.
  };
}
