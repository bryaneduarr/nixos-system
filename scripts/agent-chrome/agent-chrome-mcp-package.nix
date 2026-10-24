{
  agentChrome,
  chromeDevtoolsMcp,
  coreutils,
  nodejs,
  util-linux,
  writeShellApplication,
}:
writeShellApplication {
  name = "agent-chrome-mcp";
  runtimeInputs = [
    agentChrome
    coreutils
    nodejs
    util-linux
  ];
  runtimeEnv.AGENT_CHROME_MCP_ENTRY = "${chromeDevtoolsMcp}/lib/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js";
  text = builtins.readFile ./agent-chrome-mcp.sh;
}
