{ lib, ... }:
{
  home.activation.copyNvim = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
    echo "Copying nvim configuration..."
    rm -rf "$HOME/.config/nvim"

    # Ensure ~/.config exists before copying
    if [ ! -d "$HOME/.config" ]; then
      mkdir -p "$HOME/.config"
    fi

    # Only copy if the nvim directory exists and has content
    if [ -d ${toString ../../nvim} ] && [ "$(ls -A ${toString ../../nvim})" ]; then
      cp -r ${toString ../../nvim} "$HOME/.config/nvim"
      chmod -R u+w "$HOME/.config/nvim"
    else
      # Create an empty nvim config directory if source is empty
      mkdir -p "$HOME/.config/nvim"
      echo "-- Empty Neovim configuration" > "$HOME/.config/nvim/init.lua"
    fi
  '';
}

