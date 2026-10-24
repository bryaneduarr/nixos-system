let
  flake = builtins.getFlake ("path:" + toString ../..);
  pkgs = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem};

  piDefinition = "packages/pi/pi-tools/pi-tools.nix";
  updatedPiDefinition = "  npmDepsHash = \"sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=\";\n";
  wslLimits = [
    "--max-jobs"
    "1"
    "--cores"
    "2"
  ];
  wslKernel = {
    TEST_RELEASE = "6.6-microsoft";
  };

  update = env: expected: {
    inherit env expected;
    command = [
      "bash"
      "scripts/update-all-packages/update-all-packages.sh"
      "--show-trace"
    ];
  };

  commandsBeforeBun = target: system: limits: [
    [
      "nix"
      "test-update-pi"
    ]
    [
      "nix"
      "flake"
      "update"
      "--flake"
      "path:@repo@"
    ]
    (
      [
        "nix"
        "build"
        "--no-link"
        "--impure"
        "path:@repo@#packages.${system}.pi-tools"
      ]
      ++ limits
    )
    [
      "nix"
      "test-update-antigravity-cli"
    ]
    (
      [
        "sudo"
        "nixos-rebuild"
        "switch"
        "--flake"
        "path:@repo@#${target}"
      ]
      ++ limits
      ++ [ "--show-trace" ]
    )
  ];

  bunCommands = [
    [
      "bun"
      "update"
      "--global"
      "--latest"
      "--no-cache"
    ]
    [
      "bun"
      "pm"
      "--global"
      "cache"
      "rm"
    ]
  ];

  updates = target: system: limits: {
    status = 0;
    commands =
      commandsBeforeBun target system limits
      ++ bunCommands
      ++ [
        [
          "nix"
          "test-verify-pi"
        ]
      ];
    file = updatedPiDefinition;
  };

  stopsAfterBun = status: {
    inherit status;
    commands = commandsBeforeBun "nixos" "x86_64-linux" [ ] ++ bunCommands;
  };

  refused = {
    status = 1;
    commands = [ ];
  };
in
import ../system-target/stubbed-script-check.nix {
  inherit pkgs;
  inspectFile = piDefinition;
  prepare = ''
    printf 'update_pi_dependencies() { nix test-update-pi; }\n' > scripts/update-all-packages/modules/update-pi-dependencies.sh
    printf 'verify_pi() { nix test-verify-pi; }\n' > scripts/update-all-packages/modules/verify-pi.sh
    printf 'update_antigravity_cli() { nix test-update-antigravity-cli; }\n' > scripts/update-all-packages/modules/update-antigravity-cli.sh
    mkdir -p "$(dirname ${piDefinition})"
    printf '  npmDepsHash = "previous";\n' > ${piDefinition}
  '';
  cases = {
    nixos = update { } (updates "nixos" "x86_64-linux" [ ]);
    wsl-x86_64 = update wslKernel (updates "wsl-x86_64" "x86_64-linux" wslLimits);
    wsl-aarch64 = update (wslKernel // { TEST_ARCH = "aarch64"; }) (
      updates "wsl-aarch64" "aarch64-linux" wslLimits
    );
    bun-update-fails = update { TEST_BUN_UPDATE_STATUS = "7"; } (stopsAfterBun 7);
    bun-cleanup-fails = update { TEST_BUN_CLEANUP_STATUS = "8"; } (stopsAfterBun 8);
    native-aarch64 = update { TEST_ARCH = "aarch64"; } refused;
    unknown-architecture = update { TEST_ARCH = "unknown"; } refused;
    unsupported-host = update { TEST_HOST = "Darwin"; } refused;
    unknown-native-hostname = update { TEST_HOSTNAME = "unregistered-machine"; } refused;
  };
}
