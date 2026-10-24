{ fetchurl, stdenvNoCC }:
stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "chrome-devtools-mcp";
  version = "1.11.0";

  src = fetchurl {
    url = "https://registry.npmjs.org/chrome-devtools-mcp/-/chrome-devtools-mcp-${finalAttrs.version}.tgz";
    hash = "sha512-CytJ/5tnzrS+J/74be2P5aCOsS/mmGRHys/Si+IYC4ucrbnWAmES/dYdxGJjeUCECRcoFUilZAysdjlwqUjXIA==";
  };

  installPhase = ''
    runHook preInstall
    mkdir -p $out/lib/chrome-devtools-mcp
    cp -r . $out/lib/chrome-devtools-mcp
    runHook postInstall
  '';
})
