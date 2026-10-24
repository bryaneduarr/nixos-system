{
  config,
  lib,
  ...
}:
let
  piPackageManifest = builtins.fromJSON (builtins.readFile ../package.json);
  piDependencies = piPackageManifest.dependencies;
  piExtensionNames = [
    "@ff-labs/pi-fff"
    "pi-lsp-adapter"
    "pi-tree-sitter"
    "pi-web-access"
    "pi-powerline-footer"
    "pi-claude-bridge"
  ];
  piPackages = map (name: "npm:${name}@${builtins.getAttr name piDependencies}") piExtensionNames;
in
lib.mkIf config.custom.pi.enable {
  home.file.".pi/agent/settings.json" = {
    text = builtins.toJSON {
      compaction = import ../agent-configuration/settings/compaction.nix { inherit lib; };
      defaultTools = [ ];
      hideThinkingBlock = false;
      showLastPrompt = false;
      lastChangelogVersion = builtins.getAttr "@earendil-works/pi-coding-agent" piDependencies;
      packages = piPackages;
      powerline = {
        preset = "ascii";
        placement = "below";
        welcome = false;
        separator = "ascii";
        workingIndicatorPlacement = "above-powerline";
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
      theme = "catppuccin-mocha";
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
