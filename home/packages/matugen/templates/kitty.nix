_: {
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
}
