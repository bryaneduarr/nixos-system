{ lib, ... }:
let
  nvimSrc = builtins.path {
    path = ./../../nvim;
    name = "nvim-config";
  };
in
{
  home.activation.copyNvim = lib.hm.dag.entryBefore [ "linkGeneration" ] ''
    echo "Copying nvim configuration..."
    rm -rf "$HOME/.config/nvim"
    mkdir -p "$HOME/.config"
    cp -r ${nvimSrc} "$HOME/.config/nvim"
    chmod -R u+w "$HOME/.config/nvim"
  '';
}
