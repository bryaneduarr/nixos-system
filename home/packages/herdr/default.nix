{ config, pkgs, ... }:
{
  home.file.".config/herdr/config.toml" = {
    onChange = ''
      herdr_socket="''${HERDR_SOCKET_PATH:-''${HERDR_API_SOCKET:-${config.xdg.configHome}/herdr/herdr.sock}}"
      if [ -S "$herdr_socket" ]; then
        HERDR_SOCKET_PATH="$herdr_socket" HERDR_API_SOCKET="$herdr_socket" ${pkgs.herdr}/bin/herdr server reload-config ||
          printf '%s\n' 'Herdr config reload failed. Run herdr server reload-config to apply notification settings.' >&2
      fi
    '';

    text = ''
      onboarding = false

      [experimental]
      pane_history = true

      [ui]
      sidebar_collapsed_mode = "hidden"
      tab_bar_start_hidden = true

      [ui.sound.agents]
      pi = "off"

      [keys]
      switch_workspace = "prefix+1..9"
      previous_workspace = "prefix+shift+k"
      next_workspace = "prefix+shift+j"
      switch_tab = "prefix+alt+1..9"
    '';
  };
}
