{
  xdg.configFile."matugen/config.toml".text = ''
    [config]
    timeout = 10
    reload_apps = false

    [templates.kitty]
    input_path = "~/.config/matugen/templates/kitty.conf"
    output_path = "~/.config/kitty/matugen.conf"
    post_hook = "killall -SIGUSR1 kitty"

    [templates.zsh]
    input_path = "~/.config/matugen/templates/zsh-syntax-highlighting.zsh"
    output_path = "~/.config/zsh/matugen-colors.zsh"
  '';

  xdg.configFile."matugen/templates/kitty.conf".text = ''
    # Basic colors
    foreground              {{colors.on_surface.default.hex}}
    background              {{colors.surface.default.hex}}
    selection_foreground    {{colors.on_primary_container.default.hex}}
    selection_background    {{colors.primary_container.default.hex}}

    # Cursor
    cursor                  {{colors.primary.default.hex}}
    cursor_text_color       {{colors.surface.default.hex}}

    # URL
    url_color               {{colors.tertiary.default.hex}}

    # 16 ANSI colors for syntax highlighting
    color0                  {{colors.surface.default.hex}}
    color1                  {{colors.error.default.hex}}
    color2                  {{colors.tertiary.default.hex}}
    color3                  {{colors.secondary.default.hex}}
    color4                  {{colors.primary.default.hex}}
    color5                  {{colors.primary_container.default.hex}}
    color6                  {{colors.tertiary_container.default.hex}}
    color7                  {{colors.on_surface.default.hex}}
    color8                  {{colors.surface_variant.default.hex}}
    color9                  {{colors.error.default.hex}}
    color10                 {{colors.tertiary.default.hex}}
    color11                 {{colors.secondary.default.hex}}
    color12                 {{colors.primary.default.hex}}
    color13                 {{colors.primary_container.default.hex}}
    color14                 {{colors.tertiary_container.default.hex}}
    color15                 {{colors.on_surface.default.hex}}

    # Tab bar
    active_tab_foreground   {{colors.on_primary.default.hex}}
    active_tab_background   {{colors.primary.default.hex}}
    inactive_tab_foreground {{colors.on_surface_variant.default.hex}}
    inactive_tab_background {{colors.surface_variant.default.hex}}
    tab_bar_background      {{colors.surface.default.hex}}

    # Borders
    active_border_color     {{colors.primary.default.hex}}
    inactive_border_color   {{colors.surface_variant.default.hex}}
  '';

  xdg.configFile."matugen/templates/zsh-syntax-highlighting.zsh".text = ''
    # Matugen-generated zsh-syntax-highlighting colors

    # Commands and builtins
    ZSH_HIGHLIGHT_STYLES[command]='fg={{colors.primary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[alias]='fg={{colors.primary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[builtin]='fg={{colors.tertiary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[function]='fg={{colors.secondary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[precommand]='fg={{colors.primary.default.hex}},italic'

    # Paths and arguments
    ZSH_HIGHLIGHT_STYLES[path]='fg={{colors.on_surface.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[path_prefix]='fg={{colors.on_surface_variant.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[single-quoted-argument]='fg={{colors.tertiary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[double-quoted-argument]='fg={{colors.tertiary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[back-quoted-argument]='fg={{colors.secondary.default.hex}}'

    # Options and flags
    ZSH_HIGHLIGHT_STYLES[single-hyphen-option]='fg={{colors.secondary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[double-hyphen-option]='fg={{colors.secondary.default.hex}}'

    # Errors and warnings
    ZSH_HIGHLIGHT_STYLES[unknown-token]='fg={{colors.error.default.hex}},bold'
    ZSH_HIGHLIGHT_STYLES[reserved-word]='fg={{colors.primary.default.hex}},bold'

    # Comments and globbing
    ZSH_HIGHLIGHT_STYLES[comment]='fg={{colors.on_surface_variant.default.hex}},italic'
    ZSH_HIGHLIGHT_STYLES[globbing]='fg={{colors.tertiary_container.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[history-expansion]='fg={{colors.secondary.default.hex}},bold'

    # Separators
    ZSH_HIGHLIGHT_STYLES[commandseparator]='fg={{colors.on_surface_variant.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[redirection]='fg={{colors.secondary.default.hex}}'
  '';
}
