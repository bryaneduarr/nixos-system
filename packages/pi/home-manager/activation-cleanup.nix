{
  config,
  lib,
  pkgs,
  ...
}:
lib.mkIf config.custom.pi.enable {
  home.activation.preparePiFiles = lib.hm.dag.entryBefore [ "linkGeneration" ] ''
    # Replace unmanaged copies of managed files. Keep sessions,
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

    # Keep the Nix-provided Pi as the only Pi binary.
    if [ -e "$HOME/.bun/bin/pi" ] || [ -L "$HOME/.bun/bin/pi" ]; then
      ${lib.getExe pkgs.bun} remove --global @earendil-works/pi-coding-agent >/dev/null 2>&1 || true
      rm -f "$HOME/.bun/bin/pi"
    fi
  '';
}
