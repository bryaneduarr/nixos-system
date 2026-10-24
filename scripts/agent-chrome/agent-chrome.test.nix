let
  flake = builtins.getFlake ("path:" + toString ../../.);
  desktop = flake.nixosConfigurations.nixos.config.home-manager.users.bryaneduarr;
  wsl = flake.nixosConfigurations.wsl-x86_64.config.home-manager.users.bryaneduarr;
  installedPaths = [
    ".local/bin/agent-chrome"
    ".local/bin/agent-chrome-mcp"
    ".agents/skills/agent-chrome/SKILL.md"
    ".claude/skills/agent-chrome/SKILL.md"
  ];
in
{
  desktopEnabled = desktop.custom.agent-chrome.enable;
  wslDisabled = !wsl.custom.agent-chrome.enable;
  desktopInstallsEverything = builtins.all (path: desktop.home.file ? ${path}) installedPaths;
  wslInstallsNothing = !(wsl.home.file ? ".local/bin/agent-chrome");
  registersMcpServers = desktop.home.activation ? registerAgentChromeMcpServers;
}
