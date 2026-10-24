{ command }:
let
  isolatedEnvironment.AGENT_CHROME_INSTANCE = "ephemeral";
in
{
  claude-code.mcpServers = {
    chrome = {
      type = "stdio";
      inherit command;
      args = [ ];
      env = { };
    };
    chrome-isolated = {
      type = "stdio";
      inherit command;
      args = [ ];
      env = isolatedEnvironment;
    };
  };

  opencode.mcp.servers = {
    chrome = {
      type = "local";
      command = [ command ];
    };
    chrome-isolated = {
      type = "local";
      command = [ command ];
      environment = isolatedEnvironment;
    };
  };

  pi.mcpServers = {
    chrome = {
      inherit command;
    };
    chrome-isolated = {
      inherit command;
      env = isolatedEnvironment;
    };
  };
}
