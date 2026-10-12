_:
let
  piPackageManifest = builtins.fromJSON (builtins.readFile ../package.json);
  piDependencies = piPackageManifest.dependencies;
  piExtensionNames = [
    "@ff-labs/pi-fff"
    "pi-lsp-adapter"
    "@juvio15/pi-ast-grep"
    "pi-tree-sitter"
    "pi-web-access"
    "pi-mcp-adapter"
    "pi-powerline-footer"
  ];
  piPackages = map (name: "npm:${name}@${builtins.getAttr name piDependencies}") piExtensionNames;
in
{
  home.file.".pi/agent/settings.json" = {
    text = builtins.toJSON {
      defaultTools = [ ];
      extensions = [ "-builtin:mcp" ];
      hideThinkingBlock = false;
      showLastPrompt = false;
      lastChangelogVersion = builtins.getAttr "@earendil-works/pi-coding-agent" piDependencies;
      packages = piPackages;
      powerline = {
        preset = "ascii";
        placement = "below";
        welcome = false;
        separator = "ascii";
        customItems = [
          {
            id = "fast";
            statusKey = "codex-fast-mode";
            position = "left";
            selfColorize = true;
            hideWhenMissing = true;
          }
          {
            id = "session";
            statusKey = "harness-session";
            position = "right";
            selfColorize = true;
            hideWhenMissing = true;
          }
        ];
        layout = {
          left = [
            "model"
            "custom:fast"
            "thinking"
            "path"
            "git"
          ];
          right = [
            "context_pct"
            "custom:session"
          ];
          secondary = [ ];
        };
        model = {
          display = "name";
          showThinkingLevel = false;
        };
        path = {
          mode = "abbreviated";
          maxLength = 60;
        };
        git = {
          showBranch = true;
          showStaged = false;
          showUnstaged = true;
          showUntracked = false;
          polling = "full";
        };
      };
      quietStartup = true;
      theme = "dark";
      tuiMode = "fullscreen";
      terminal = {
        clearOnShrink = true;
        showTerminalProgress = true;
      };
      workingVibe = "off";
    };
    force = true;
  };
}
