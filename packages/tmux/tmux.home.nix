{
  config,
  lib,
  tmux-tpm,
  ...
}:
let
  cfg = config.custom.tmux;
in
{
  options.custom.tmux = {
    enable = lib.mkEnableOption "tmux with TPM plugins";
    systemClipboard.enable = lib.mkEnableOption "copying to the terminal clipboard through OSC 52";
  };

  config = lib.mkIf cfg.enable {
    programs.tmux = {
      enable = true;

      extraConfig = ''
        unbind r
        bind r source-file ~/.config/tmux/tmux.conf

        set-option -sa terminal-overrides ",xterm*:Tc"

        set -g default-terminal "tmux-256color"
        set -as terminal-features ",xterm-256color:RGB"

        set -g mouse on

        set -g escape-time 0

        bind-key h select-pane -L
        bind-key j select-pane -D
        bind-key k select-pane -U
        bind-key l select-pane -R

        set-window-option -g mode-keys vi

        bind-key -T copy-mode-vi v send-keys -X begin-selection
        bind-key -T copy-mode-vi C-v send-keys -X rectangle-toggle
        bind-key -T copy-mode-vi y send-keys -X copy-selection-and-cancel

        set -g mode-style "bg=#313244,fg=#cdd6f4"
        set -g message-style "bg=default,fg=#cdd6f4"
        set -g pane-active-border-style "fg=#89b4fa"
        set -g pane-border-style "fg=#585b70"



        set -g @plugin 'tmux-plugins/tmux-resurrect'
        set -g @plugin 'tmux-plugins/tmux-continuum'
        set -g @plugin 'vaaleyard/tmux-dotbar'

        set -g @tmux-dotbar-bg "default"

        set -g @tmux-dotbar-fg-prefix "#FAB387"

        set -g @tmux-dotbar-right true

        set -g @tmux-dotbar-status-right "%H:%M"

        set -g @tmux-dotbar-window-status-separator "|"
        set -g @tmux-dotbar-left true
        set -g @tmux-dotbar-justify "left"
        set -g window-status-separator ""

        set -g @continuum-restore 'on'

        # TPM must initialize after every other setting.
        run '~/.tmux/plugins/tpm/tpm'
      ''
      + lib.optionalString cfg.systemClipboard.enable ''
        set -s set-clipboard on
      '';
    };

    home.file.".tmux/plugins/tpm" = {
      source = tmux-tpm;
      recursive = true;
    };
  };
}
