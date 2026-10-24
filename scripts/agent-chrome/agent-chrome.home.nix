{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.agent-chrome;

  agentChrome = pkgs.callPackage ./agent-chrome-package.nix { };
  chromeDevtoolsMcp = pkgs.callPackage ./chrome-devtools-mcp-package.nix { };
  agentChromeMcp = pkgs.callPackage ./agent-chrome-mcp-package.nix {
    inherit agentChrome chromeDevtoolsMcp;
  };
  mergeJsonFragment = pkgs.callPackage ./merge-json-fragment-package.nix { };

  json = pkgs.formats.json { };
  serverDefinitions = import ./mcp-server-definitions.nix {
    command = "${config.home.homeDirectory}/.local/bin/agent-chrome-mcp";
  };
  fragmentFor =
    harness: json.generate "${harness}-chrome-mcp-servers.json" serverDefinitions.${harness};
  registerServers = target: harness: ''
    run ${lib.getExe mergeJsonFragment} ${target} ${fragmentFor harness}
  '';

  skillFiles =
    lib.genAttrs
      [
        ".agents/skills/agent-chrome/SKILL.md"
        ".claude/skills/agent-chrome/SKILL.md"
      ]
      (_: {
        source = ./skill/SKILL.md;
        force = true;
      });
in
{
  options.custom.agent-chrome.enable = lib.mkEnableOption "real headed Chrome instances and their MCP servers for AI agents";

  config = lib.mkIf cfg.enable {
    home = {
      file = skillFiles // {
        ".local/bin/agent-chrome" = {
          source = lib.getExe agentChrome;
          force = true;
        };
        ".local/bin/agent-chrome-mcp" = {
          source = lib.getExe agentChromeMcp;
          force = true;
        };
      };

      # Claude Code, OpenCode, and Pi rewrite these files themselves, so the servers are merged in instead of owning the files.
      activation.registerAgentChromeMcpServers = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
        ${registerServers "${config.home.homeDirectory}/.claude.json" "claude-code"}
        ${registerServers "${config.home.homeDirectory}/.config/opencode/opencode.jsonc" "opencode"}
        ${registerServers "${config.home.homeDirectory}/.pi/agent/mcp.json" "pi"}
      '';
    };
  };
}
