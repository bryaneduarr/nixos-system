{
  config,
  lib,
  ...
}:
lib.mkIf config.custom.matugen.enable {
  xdg.configFile."matugen/templates/zsh-syntax-highlighting.zsh".text = ''

    ZSH_HIGHLIGHT_STYLES[command]='fg={{colors.primary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[alias]='fg={{colors.primary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[builtin]='fg={{colors.tertiary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[function]='fg={{colors.secondary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[precommand]='fg={{colors.primary.default.hex}},italic'

    ZSH_HIGHLIGHT_STYLES[path]='fg={{colors.on_surface.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[path_prefix]='fg={{colors.on_surface_variant.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[single-quoted-argument]='fg={{colors.tertiary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[double-quoted-argument]='fg={{colors.tertiary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[back-quoted-argument]='fg={{colors.secondary.default.hex}}'

    ZSH_HIGHLIGHT_STYLES[single-hyphen-option]='fg={{colors.secondary.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[double-hyphen-option]='fg={{colors.secondary.default.hex}}'

    ZSH_HIGHLIGHT_STYLES[unknown-token]='fg={{colors.error.default.hex}},bold'
    ZSH_HIGHLIGHT_STYLES[reserved-word]='fg={{colors.primary.default.hex}},bold'

    ZSH_HIGHLIGHT_STYLES[comment]='fg={{colors.on_surface_variant.default.hex}},italic'
    ZSH_HIGHLIGHT_STYLES[globbing]='fg={{colors.tertiary_container.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[history-expansion]='fg={{colors.secondary.default.hex}},bold'

    ZSH_HIGHLIGHT_STYLES[commandseparator]='fg={{colors.on_surface_variant.default.hex}}'
    ZSH_HIGHLIGHT_STYLES[redirection]='fg={{colors.secondary.default.hex}}'
  '';
}
