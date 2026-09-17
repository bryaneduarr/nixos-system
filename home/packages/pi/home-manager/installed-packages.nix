{ pkgs, piTools, ... }:
{
  home.packages = with pkgs; [
    ast-grep
    piTools
    typescript
    vtsls
  ];
}
