{
  config,
  lib,
  piTools,
  pkgs,
  ...
}:
let
  agentConfiguration = ../agent-configuration;
  mcpConfigurations = ../mcp-configurations;

  mkJsonFile = source: {
    text = builtins.toJSON (import source);
    force = true;
  };

  mkSourceFile = source: {
    inherit source;
    force = true;
  };
in
lib.mkIf config.custom.pi.enable {
  home.file = {
    ".pi/agent/keybindings.json" = {
      text = builtins.toJSON {
        "app.clipboard.pasteImage" = "ctrl+v";
      };
      force = true;
    };
    ".pi/agent/lsp.json" = mkJsonFile (agentConfiguration + "/settings/lsp.nix");
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
    ".pi/agent/mcp-adapter.json" = mkJsonFile (agentConfiguration + "/settings/mcp.nix");
    ".config/mcp/mcp.json" = mkJsonFile (mcpConfigurations + "/mcp-host-configuration.nix");
    ".pi/agent/extensions/codex-fast-mode" = {
      source = pkgs.linkFarm "pi-codex-fast-mode" [
        {
          name = "index.ts";
          path = agentConfiguration + "/extensions/codex-fast-mode/index.ts";
        }
        {
          name = "capabilities.ts";
          path = agentConfiguration + "/extensions/codex-fast-mode/capabilities.ts";
        }
        {
          name = "node_modules";
          path = "${piTools}/lib/pi-packages/node_modules";
        }
      ];
      force = true;
    };
    ".pi/agent/extensions/clear.ts" = mkSourceFile (
      agentConfiguration + "/extensions/clear-session.ts"
    );
    ".pi/agent/extensions/last-model.ts" = mkSourceFile (
      agentConfiguration + "/extensions/last-model.ts"
    );
    ".pi/agent/extensions/quiet-tools.ts" = mkSourceFile (
      agentConfiguration + "/extensions/quiet-tool-output.ts"
    );
    ".pi/agent/extensions/harness" = {
      source = agentConfiguration + "/harness";
      force = true;
    };
    ".pi/agent/extensions/powerline-footer/theme.json" = mkSourceFile (
      agentConfiguration + "/themes/powerline.json"
    );
    ".pi/agent/AGENTS.md" = mkSourceFile (agentConfiguration + "/harness/instructions.md");
    ".pi/agent/npm" = {
      source = "${piTools}/lib/pi-packages";
      force = true;
    };
  };
}
