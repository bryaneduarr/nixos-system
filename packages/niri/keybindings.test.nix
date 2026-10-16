let
  flake = builtins.getFlake ("path:" + toString ../..);
  inherit (flake.inputs.nixpkgs) lib;
  config = flake.nixosConfigurations.nixos.config;
  configuredNiri = config.programs.niri.package;
  localNiri = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem}.niri;

  normalizedKey =
    key:
    let
      parts = lib.splitString "+" (lib.toLower key);
      modifiers = map (part: if part == "mod" then "super" else part) (lib.init parts);
    in
    lib.concatStringsSep "+" (lib.sort lib.lessThan modifiers ++ [ (lib.last parts) ]);

  parseProperties =
    line: text:
    let
      pieces = builtins.split "([^[:space:]=]+)=(\"[^\"]*\"|[^[:space:]]+)" text;
      separators = lib.filter builtins.isString pieces;
      properties = lib.filter builtins.isList pieces;
    in
    if lib.all (separator: builtins.match "[[:space:]]*" separator != null) separators then
      lib.listToAttrs (
        map (property: lib.nameValuePair (lib.head property) (lib.last property)) properties
      )
    else
      throw "Unsupported binding properties: ${line}";

  parseBinding =
    line:
    let
      match = builtins.match "([^[:space:]{}]+)[[:space:]]*([^{}]*)[{][[:space:]]*([^{}]*[^[:space:]{}])[[:space:]]*[}]" line;
      key = builtins.elemAt match 0;
    in
    if match == null then
      throw "Unsupported binding syntax: ${line}"
    else
      {
        inherit key;
        name = normalizedKey key;
        properties = parseProperties line (builtins.elemAt match 1);
        action = lib.concatStringsSep " " (
          lib.filter (word: word != "") (lib.splitString " " (builtins.elemAt match 2))
        );
      };

  parseBindings =
    text:
    let
      section = lib.head (
        lib.splitString "\n}\n" (builtins.elemAt (lib.splitString "\nbinds {\n" text) 1)
      );
      lines = lib.filter (line: line != "" && !(lib.hasPrefix "//" line)) (
        map lib.trim (lib.splitString "\n" section)
      );
    in
    lib.foldl' (
      bindings: line:
      let
        binding = parseBinding line;
      in
      if bindings ? ${binding.name} then
        throw "Duplicate binding: ${binding.key}"
      else
        bindings // { ${binding.name} = binding; }
    ) { } lines;

  upstream = parseBindings (builtins.readFile "${localNiri.src}/resources/default-config.kdl");
  configured =
    parseBindings
      config.home-manager.users.bryaneduarr.xdg.configFile."niri/config.kdl".source.configText;
  bindingFor = key: configured.${normalizedKey key};

  overrides = {
    ${normalizedKey "Super+T"} = ''spawn "kitty";'';
    ${normalizedKey "Super+D"} = ''spawn "rofi" "-show" "drun";'';
  };

  upstreamFailures = lib.concatLists (
    lib.mapAttrsToList (
      name: binding:
      if !(configured ? ${name}) then
        [ "Missing upstream binding: ${binding.key}" ]
      else
        lib.optional (
          configured.${name}.action != overrides.${name} or binding.action
        ) "Changed action: ${binding.key}"
        ++ lib.concatLists (
          lib.mapAttrsToList (
            property: value:
            lib.optional (
              property != "hotkey-overlay-title" && configured.${name}.properties.${property} or null != value
            ) "Changed ${property}: ${binding.key}"
          ) binding.properties
        )
    ) upstream
  );

  customActions = {
    "Super+B" = ''spawn "zen-twilight";'';
    "Super+Shift+D" = ''spawn "desktop-theme" "toggle";'';
    "Super+Shift+W" = ''spawn-sh "bash \"$HOME/.config/wallpapers/awww-wallpaper-switch.sh\"";'';
    "Super+P" = "switch-preset-column-width;";
    "Super+Alt+Page_Up" = "move-window-to-workspace-up;";
    "Super+Alt+Page_Down" = "move-window-to-workspace-down;";
  }
  // lib.genAttrs' (lib.range 1 5) (
    workspace:
    lib.nameValuePair "Super+Shift+${toString workspace}" ''move-window-to-workspace "${toString workspace}";''
  );

  overlayTitled = [
    "Super+T"
    "Super+D"
    "Super+B"
    "Super+Shift+D"
    "Super+Shift+W"
  ];

  collision = "\nbinds {\nSuper+Ctrl+Shift+H { quit; }\nSuper+Shift+Ctrl+H { quit; }\n}\n";
  collidingBindings = parseBindings collision;
in
assert configuredNiri.src.outPath == localNiri.src.outPath;
assert lib.length (lib.attrNames upstream) > 100;
assert lib.assertMsg (upstreamFailures == [ ]) (lib.concatStringsSep "\n" upstreamFailures);
assert lib.all (binding: !(lib.hasPrefix "Mod+" binding.key)) (lib.attrValues configured);
assert !(builtins.tryEval (builtins.deepSeq collidingBindings collidingBindings)).success;
assert lib.all (key: (bindingFor key).action == customActions.${key}) (lib.attrNames customActions);
assert lib.all (
  key: builtins.match "\"[^\"]+\"" ((bindingFor key).properties.hotkey-overlay-title or "") != null
) overlayTitled;
true
