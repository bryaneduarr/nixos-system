let
  flake = builtins.getFlake ("path:" + toString ../..);
  pkgs = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem};

  select = env: expectedOutput: {
    inherit env;
    command = [
      "bash"
      "-c"
      ''source "$1"; select_system_target || exit; printf "%s %s" "$rebuild_target" "$rebuild_system_architecture"''
      "select"
      "scripts/system-target/select-target.sh"
    ];
    expected =
      if expectedOutput == null then
        {
          status = 1;
          stdout = "";
        }
      else
        {
          status = 0;
          stdout = expectedOutput;
        };
  };
in
import ./stubbed-script-check.nix {
  inherit pkgs;
  cases = {
    native-x86_64 = select { } "nixos x86_64-linux";
    wsl-kernel-x86_64 = select {
      TEST_RELEASE = "6.6-microsoft-standard-WSL2";
    } "wsl-x86_64 x86_64-linux";
    wsl-kernel-aarch64 = select {
      TEST_ARCH = "aarch64";
      TEST_RELEASE = "6.6-Microsoft-standard-WSL2";
    } "wsl-aarch64 aarch64-linux";
    wsl-distro-arm64 = select {
      TEST_ARCH = "arm64";
      WSL_DISTRO_NAME = "NixOS";
    } "wsl-aarch64 aarch64-linux";
    wsl-interop-x86_64 = select { WSL_INTEROP = "/run/WSL/interop"; } "wsl-x86_64 x86_64-linux";
    native-aarch64 = select { TEST_ARCH = "aarch64"; } null;
    unsupported-architecture = select {
      TEST_ARCH = "riscv64";
      TEST_RELEASE = "6.6-microsoft";
    } null;
    unsupported-host = select { TEST_HOST = "Darwin"; } null;
    unknown-native-hostname = select { TEST_HOSTNAME = "unregistered-machine"; } null;
    override-nixos = select {
      TEST_HOST = "Unknown";
      TEST_ARCH = "unknown";
      NIXOS_REBUILD_TARGET = "nixos";
    } "nixos x86_64-linux";
    override-wsl-x86_64 = select {
      TEST_HOST = "Unknown";
      TEST_ARCH = "unknown";
      NIXOS_REBUILD_TARGET = "wsl-x86_64";
    } "wsl-x86_64 x86_64-linux";
    override-wsl-aarch64 = select {
      TEST_HOST = "Unknown";
      TEST_ARCH = "unknown";
      NIXOS_REBUILD_TARGET = "wsl-aarch64";
    } "wsl-aarch64 aarch64-linux";
    override-unlisted = select { NIXOS_REBUILD_TARGET = "unlisted"; } null;
  };
}
