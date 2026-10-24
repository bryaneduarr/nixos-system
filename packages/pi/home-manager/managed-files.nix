{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.pi;
  agentConfiguration = ../agent-configuration;

  mkJsonFile = source: {
    text = builtins.toJSON (import source);
    force = true;
  };

  mkSourceFile = source: {
    inherit source;
    force = true;
  };

  withoutTests =
    directory:
    lib.fileset.toSource {
      root = directory;
      fileset = lib.fileset.fileFilter (
        file: !(lib.hasSuffix ".test.ts" file.name || lib.hasSuffix ".test-double.ts" file.name)
      ) directory;
    };
in
lib.mkIf cfg.enable {
  home.file = {
    ".pi/agent/keybindings.json" = {
      text = builtins.toJSON {
        "app.clipboard.pasteImage" = "ctrl+v";
      };
      force = true;
    };
    ".pi/agent/claude-bridge.json" = mkJsonFile (agentConfiguration + "/settings/claude-bridge.nix");
    ".pi/agent/lsp.json" = {
      text = builtins.toJSON (import (agentConfiguration + "/settings/lsp.nix") { inherit lib pkgs; });
      force = true;
    };
    ".pi/agent/pi-fff.json" = mkJsonFile (agentConfiguration + "/settings/pi-fff.nix");
    ".pi/agent/web-search.json" = {
      text = builtins.toJSON (import (agentConfiguration + "/settings/web-search.nix") { inherit pkgs; });
      force = true;
    };
    ".pi/agent/skills/web-research/SKILL.md" = mkSourceFile (
      agentConfiguration + "/skills/web-research/SKILL.md"
    );
    ".pi/agent/skills/efficient-repository-workflow/SKILL.md" = mkSourceFile (
      agentConfiguration + "/skills/efficient-tools/SKILL.md"
    );
    ".config/mcp/mcp.json" = mkJsonFile (agentConfiguration + "/settings/mcp-host-configuration.nix");
    ".pi/agent/extensions/codex-fast-mode" = {
      # Pi resolves extension imports from real file paths, so the sources must be copied beside node_modules, not symlinked.
      source = pkgs.runCommand "pi-codex-fast-mode" { } ''
        cp -r ${withoutTests (agentConfiguration + "/extensions/codex-fast-mode")} "$out"
        chmod u+w "$out"
        ln -s ${cfg.tools}/lib/pi-packages/node_modules "$out/node_modules"
      '';
      force = true;
    };
    ".pi/agent/extensions/clear.ts" = mkSourceFile (
      agentConfiguration + "/extensions/clear-session.extension.ts"
    );
    ".pi/agent/extensions/last-model" = {
      source = withoutTests (agentConfiguration + "/extensions/last-model");
      force = true;
    };
    ".pi/agent/extensions/quiet-tools.ts" = mkSourceFile (
      agentConfiguration + "/extensions/quiet-tool-output.extension.ts"
    );
    ".pi/agent/extensions/harness" = {
      source = withoutTests (agentConfiguration + "/harness");
      force = true;
    };
    ".pi/agent/extensions/powerline-footer/theme.json" = mkSourceFile (
      agentConfiguration + "/themes/powerline.json"
    );
    ".pi/agent/themes/catppuccin-mocha.json" = mkSourceFile (
      agentConfiguration + "/themes/catppuccin-mocha.json"
    );
    ".pi/agent/AGENTS.md" = mkSourceFile (agentConfiguration + "/harness/instructions.md");
    ".pi/agent/npm" = {
      source = "${cfg.tools}/lib/pi-packages";
      force = true;
    };
  };
}
