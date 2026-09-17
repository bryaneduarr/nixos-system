{ piTools, ... }:
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
{
  home.file = {
    ".pi/agent/lsp.json" = mkJsonFile (agentConfiguration + "/lsp-configuration.nix");
    ".pi/agent/pi-fff.json" = mkJsonFile (agentConfiguration + "/pi-fff-configuration.nix");
    ".pi/agent/extensions/subagent/config.json" = mkJsonFile (
      agentConfiguration + "/subagent-configuration.nix"
    );
    ".pi/agent/mcp.json" = mkJsonFile (agentConfiguration + "/mcp-configuration.nix");
    ".config/mcp/mcp.json" = mkJsonFile (mcpConfigurations + "/mcp-host-configuration.nix");
    ".pi/agent/extensions/clear.ts" = mkSourceFile (agentConfiguration + "/clear-session-extension.ts");
    ".pi/agent/extensions/quiet-tools.ts" = mkSourceFile (
      agentConfiguration + "/quiet-tool-output-extension.ts"
    );
    ".pi/agent/AGENTS.md" = mkSourceFile (agentConfiguration + "/agent-instructions.md");
    ".pi/agent/npm" = {
      source = "${piTools}/lib/pi-packages";
      force = true;
    };
  };
}
