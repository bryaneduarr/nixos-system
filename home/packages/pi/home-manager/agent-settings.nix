_:
let
  piPackageManifest = builtins.fromJSON (builtins.readFile ../package.json);
  piDependencies = piPackageManifest.dependencies;
  piExtensionNames = [
    "@ff-labs/pi-fff"
    "pi-lsp-adapter"
    "@juvio15/pi-ast-grep"
    "pi-tree-sitter"
    "pi-mcp-adapter"
    "pi-subagents"
  ];
  piPackages = map (name: "npm:${name}@${builtins.getAttr name piDependencies}") piExtensionNames;
in
{
  home.file.".pi/agent/settings.json" = {
    text = builtins.toJSON {
      defaultModel = "gpt-5.6-luna";
      defaultProvider = "openai-codex";
      defaultThinkingLevel = "high";
      hideThinkingBlock = true;
      lastChangelogVersion = builtins.getAttr "@earendil-works/pi-coding-agent" piDependencies;
      packages = piPackages;
      quietStartup = true;
      theme = "dark";
      tuiMode = "regular";
      terminal = {
        showTerminalProgress = true;
      };
    };
    force = true;
  };
}
