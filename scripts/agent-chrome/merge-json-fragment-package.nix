{
  coreutils,
  jq,
  writeShellApplication,
}:
writeShellApplication {
  name = "merge-json-fragment";
  runtimeInputs = [
    coreutils
    jq
  ];
  text = builtins.readFile ./merge-json-fragment.sh;
}
