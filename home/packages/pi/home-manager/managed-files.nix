{ lib, piTools, pkgs, ... }:
let
  agentConfiguration = ../agent-configuration;
  mcpConfigurations = ../mcp-configurations;
  upstreamSkillSources = lib.filter (line: line != "" && !(lib.hasPrefix "#" line)) (
    lib.splitString "\n" (builtins.readFile (agentConfiguration + "/skills/upstream-sources.tsv"))
  );
  upstreamSkillNames = map (
    line: lib.last (lib.splitString "/" (builtins.elemAt (lib.splitString "\t" line) 2))
  ) upstreamSkillSources;

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
    ".pi/agent/lsp.json" = mkJsonFile (agentConfiguration + "/settings/lsp.nix");
    ".pi/agent/pi-fff.json" = mkJsonFile (agentConfiguration + "/settings/pi-fff.nix");
    ".pi/agent/web-search.json" = {
      text = builtins.toJSON (import (agentConfiguration + "/settings/web-search.nix") { inherit pkgs; });
      force = true;
    };
    ".agents/skills/web-research/SKILL.md" = mkSourceFile (
      agentConfiguration + "/skills/web-research/SKILL.md"
    );
    ".agents/skills/efficient-repository-workflow/SKILL.md" = mkSourceFile (
      agentConfiguration + "/skills/efficient-tools/SKILL.md"
    );
    ".agents/skills/code-modularization/SKILL.md" = mkSourceFile (
      agentConfiguration + "/skills/code-modularization/SKILL.md"
    );
    ".agents/skills/code-clarity/SKILL.md" = mkSourceFile (
      agentConfiguration + "/skills/code-clarity/SKILL.md"
    );
    ".agents/skills/commit-workflow/SKILL.md" = mkSourceFile (
      agentConfiguration + "/skills/commit-workflow/SKILL.md"
    );
    ".pi/agent/mcp.json" = mkJsonFile (agentConfiguration + "/settings/mcp.nix");
    ".config/mcp/mcp.json" = mkJsonFile (mcpConfigurations + "/mcp-host-configuration.nix");
    ".pi/agent/extensions/clear.ts" = mkSourceFile (agentConfiguration + "/extensions/clear-session.ts");
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
  } // builtins.listToAttrs (map (name: {
    name = ".agents/skills/${name}";
    value = mkSourceFile (agentConfiguration + "/skills/upstream/${name}");
  }) upstreamSkillNames);
}
