{ fetchurl }:
let
  version = "0.0.43-nightly.20260916.1811";
in
{
  inherit version;

  src = fetchurl {
    url = "https://github.com/pingdotgg/t3code/releases/download/v0.0.43-nightly.20260916.1811/T3-Code-0.0.43-nightly.20260916.1811-x86_64.AppImage";
    hash = "sha256-PPwR+l3W4aHSs1hWXppiybhNscnnuCoa9t15dD5kC7c=";
  };
}
