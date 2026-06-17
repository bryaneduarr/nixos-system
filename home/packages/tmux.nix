{ tmux-tpm, ... }:
{
  programs.tmux = {
    enable = true; # Enable tmux program.

    # My custom tmux configuration, similar to a .tmux.conf file.
    extraConfig = ''
      unbind r
      bind r source-file ~/.config/tmux/tmux.conf

      # Enhanced terminal overrides for true color support
      set-option -sa terminal-overrides ",xterm*:Tc"

      # Enable true color support
      set -g default-terminal "tmux-256color"
      set -as terminal-features ",xterm-256color:RGB"

      # Enable mouse.
      set -g mouse on

      # Escape time.
      set -g escape-time 0

      # Pane navigation with vim keys.
      bind-key h select-pane -L
      bind-key j select-pane -D
      bind-key k select-pane -U
      bind-key l select-pane -R

      # set vi-mode
      set-window-option -g mode-keys vi

      # Terminal ouput selection
      bind-key -T copy-mode-vi v send-keys -X begin-selection
      bind-key -T copy-mode-vi C-v send-keys -X rectangle-toggle
      bind-key -T copy-mode-vi y send-keys -X copy-selection-and-cancel

      # Better copy-mode appearance
      set -g mode-style "bg=#313244,fg=#cdd6f4"
      set -g message-style "bg=default,fg=#cdd6f4"
      set -g pane-active-border-style "fg=#89b4fa"
      set -g pane-border-style "fg=#585b70"

      # Optional: hide the status bar entirely while scrolling feels cleaner
      # set -g status off

      # Status bar right side only show hour.
      # set-option -g status-right "%H:%M %d-%b-%y"

      # TPM plugins, these will be managed by TPM
      set -g @plugin 'tmux-plugins/tmux-resurrect'
      set -g @plugin 'tmux-plugins/tmux-continuum'
      set -g @plugin 'vaaleyard/tmux-dotbar'

      # Tmux dotbar background colorscheme style of the custom tmux bar theme.
      set -g @tmux-dotbar-bg "default"

      # Tmux dotbar prefix highlight in orange pastel
      set -g @tmux-dotbar-fg-prefix "#FAB387"

      # Tmux dotbar activate right side.
      set -g @tmux-dotbar-right true

      # Tmux dotbar time, this is why the initial is commented.
      set -g @tmux-dotbar-status-right "%H:%M"

      # Windows next to session with | separator
      set -g @tmux-dotbar-window-status-separator "|"
      set -g @tmux-dotbar-left true
      set -g @tmux-dotbar-justify "left"
      set -g window-status-separator ""

      # Resurrect settings.
      set -g @continuum-restore 'on'

      # Initialize TPM (Tmux Plugin Manager)
      # This line should be at the very bottom of the config
      run '~/.tmux/plugins/tpm/tpm'
    '';
  };

  # Ensure TPM is installed using the flake input.
  home.file.".tmux/plugins/tpm" = {
    source = tmux-tpm;
    recursive = true;
  };
}
