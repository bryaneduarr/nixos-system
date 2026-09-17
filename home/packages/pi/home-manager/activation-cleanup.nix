{ lib, pkgs, ... }:
{
  home.activation.preparePiFiles = lib.hm.dag.entryBefore [ "linkGeneration" ] ''
    # Replace files created by the old mutable Pi installer. Keep sessions,
    # credentials, trust decisions, and other runtime state untouched.
    for path in \
      "$HOME/.pi/agent/settings.json" \
      "$HOME/.pi/agent/lsp.json" \
      "$HOME/.pi/agent/lsp/lsp.lock.json" \
      "$HOME/.pi/agent/extensions/clear.ts" \
      "$HOME/.pi/agent/extensions/quiet-tools.ts" \
      "$HOME/.pi/agent/AGENTS.md"; do
      if { [ -e "$path" ] || [ -L "$path" ]; } && [ ! -L "$path" ]; then
        rm -f "$path"
      fi
    done

    if [ -d "$HOME/.pi/agent/npm" ] && [ ! -L "$HOME/.pi/agent/npm" ]; then
      rm -rf "$HOME/.pi/agent/npm"
    fi

    # Pi itself used to be installed through the mutable Bun global tree.
    # Remove that entry so the Nix-provided binary is the only Pi binary.
    if [ -e "$HOME/.bun/bin/pi" ] || [ -L "$HOME/.bun/bin/pi" ]; then
      ${pkgs.bun}/bin/bun remove --global @earendil-works/pi-coding-agent >/dev/null 2>&1 || true
      rm -f "$HOME/.bun/bin/pi"
    fi
  '';
}
