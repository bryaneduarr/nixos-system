{
  bun,
  coreutils,
  findutils,
  git,
  gnugrep,
  gnused,
  iproute2,
  lib,
  writeShellScriptBin,
}:
let
  runtimePath = lib.makeBinPath [
    bun
    coreutils
    findutils
    git
    gnugrep
    gnused
    iproute2
  ];

  scriptFiles = [
    ./modules/worktree-root-and-server-paths.sh
    ./modules/allocate-development-ports.sh
    ./modules/discover-next-binary.sh
    ./modules/select-server-environment-source.sh
    ./modules/prepare-server-environment.sh
    ./modules/restore-worktree-state.sh
    ./modules/configure-next-launchers.sh
    ./worktree-dev.sh
  ];

  script = lib.concatMapStringsSep "\n" (file: builtins.readFile file) scriptFiles;
in
writeShellScriptBin "worktree-dev" ''
  set -Eeuo pipefail
  export PATH="${runtimePath}:$PATH"

  ${script}
''
