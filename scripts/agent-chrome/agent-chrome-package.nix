{
  coreutils,
  curl,
  findutils,
  google-chrome,
  iproute2,
  jq,
  lib,
  rsync,
  util-linux,
  writeShellApplication,
}:
let
  scriptFiles = [
    ./modules/instance-registry.sh
    ./modules/display-environment.sh
    ./modules/clone-profile.sh
    ./modules/start-instance.sh
    ./modules/stop-instance.sh
    ./modules/inspect-instance.sh
    ./agent-chrome.sh
  ];
in
writeShellApplication {
  name = "agent-chrome";
  runtimeInputs = [
    coreutils
    curl
    findutils
    iproute2
    jq
    rsync
    util-linux
  ];
  runtimeEnv.AGENT_CHROME_BIN = lib.getExe google-chrome;
  text = lib.concatMapStringsSep "\n" builtins.readFile scriptFiles;
}
