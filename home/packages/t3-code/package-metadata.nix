{ lib }:
{
  description = "GUI for coding agents";
  homepage = "https://t3.codes";
  license = lib.licenses.mit;
  mainProgram = "t3code";
  platforms = [ "x86_64-linux" ];
  sourceProvenance = with lib.sourceTypes; [ binaryNativeCode ];
}
