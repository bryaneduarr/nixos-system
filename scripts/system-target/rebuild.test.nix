let
  flake = builtins.getFlake ("path:" + toString ../..);
  pkgs = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem};

  wslLimits = [
    "--max-jobs"
    "1"
    "--cores"
    "2"
  ];

  rebuild = env: arguments: expected: {
    inherit env expected;
    command = [
      "bash"
      "scripts/system-target/rebuild.sh"
    ]
    ++ arguments;
  };

  rebuilds = target: system: limits: action: arguments: {
    status = 0;
    stdout = "NixOS target: path:@repo@#${target} (${system})";
    commands = [
      (
        [
          "sudo"
          "nixos-rebuild"
          action
          "--flake"
          "path:@repo@#${target}"
        ]
        ++ limits
        ++ arguments
      )
    ];
  };

  refused = {
    status = 1;
    commands = [ ];
  };

  wslKernel = {
    TEST_RELEASE = "6.6-microsoft";
  };
  extraArguments = [
    "--show-trace"
    "two words"
  ];
in
import ./stubbed-script-check.nix {
  inherit pkgs;
  cases = {
    switch-nixos = rebuild { } extraArguments (
      rebuilds "nixos" "x86_64-linux" [ ] "switch" extraArguments
    );
    switch-wsl-x86_64 = rebuild wslKernel extraArguments (
      rebuilds "wsl-x86_64" "x86_64-linux" wslLimits "switch" extraArguments
    );
    switch-wsl-aarch64 = rebuild (wslKernel // { TEST_ARCH = "aarch64"; }) extraArguments (
      rebuilds "wsl-aarch64" "aarch64-linux" wslLimits "switch" extraArguments
    );
    build = rebuild wslKernel [ "build" "--show-trace" ] (
      rebuilds "wsl-x86_64" "x86_64-linux" wslLimits "build" [ "--show-trace" ]
    );
    dry-build = rebuild wslKernel [ "dry-build" "--show-trace" ] (
      rebuilds "wsl-x86_64" "x86_64-linux" wslLimits "dry-build" [ "--show-trace" ]
    );
    native-aarch64 = rebuild { TEST_ARCH = "aarch64"; } [ ] refused;
    unknown-architecture = rebuild { TEST_ARCH = "unknown"; } [ ] refused;
    unsupported-host = rebuild { TEST_HOST = "Darwin"; } [ ] refused;
    unknown-native-hostname = rebuild { TEST_HOSTNAME = "unregistered-machine"; } [ ] refused;
  };
}
