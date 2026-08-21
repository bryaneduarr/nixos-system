_: {
  home.file.".config/herdr/config.toml".text = ''
    onboarding = false

    [experimental]
    pane_history = true

    [ui]
    sidebar_collapsed_mode = "hidden"

    [keys]
    switch_workspace = "prefix+1..9"
    previous_workspace = "prefix+shift+k"
    next_workspace = "prefix+shift+j"
    switch_tab = "prefix+alt+1..9"
  '';
}
