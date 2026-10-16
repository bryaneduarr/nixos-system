set -euo pipefail

channel="${T3CODE_CHANNEL:-nightly}"
version="${T3CODE_VERSION:-}"
app_directory="${XDG_DATA_HOME:-$HOME/.local/share}/t3code"
appimage="$app_directory/T3-Code.AppImage"
cli_directory="${T3CODE_INSTALL_BIN_DIR:-$HOME/.local/bin}"
update_desktop=false
staging_directory=

fail() {
  printf 't3code-install: %s\n' "$1" >&2
  exit 1
}

cleanup() {
  if [ -n "$staging_directory" ]; then
    rm -rf "$staging_directory"
  fi
}

find_release() {
  local page=1 releases release

  if [ -n "$version" ]; then
    curl --fail --silent --show-error --location \
      "https://api.github.com/repos/pingdotgg/t3code/releases/tags/v$version" \
      || fail "Could not retrieve release v$version."
    return
  fi

  while true; do
    releases="$(curl --fail --silent --show-error --location \
      "https://api.github.com/repos/pingdotgg/t3code/releases?per_page=100&page=$page")" \
      || fail "Could not retrieve the release index."
    jq -e 'type == "array"' >/dev/null <<< "$releases" \
      || fail "The release index is not a JSON array."
    release="$(jq -c --arg channel "$channel" '
      [.[] | select(.draft == false) | select(
        if $channel == "stable" then
          (.tag_name | test("^v[0-9]+\\.[0-9]+\\.[0-9]+$"))
        else
          (.tag_name | test("^v[0-9]+\\.[0-9]+\\.[0-9]+-nightly\\.[0-9]{8}\\.[0-9]+$"))
        end
      )] | sort_by(.published_at) | last // empty
    ' <<< "$releases")" || fail "Could not select a release."

    if [ -n "$release" ]; then
      printf '%s\n' "$release"
      return
    fi

    if [ "$(jq 'length' <<< "$releases")" -lt 100 ]; then
      fail "No $channel release was found."
    fi

    page=$((page + 1))
  done
}

install_desktop() {
  local architecture release asset url digest expected actual

  if [ -s "$appimage" ] && [ "$update_desktop" = false ]; then
    return
  fi

  case "$(uname -m)" in
    x86_64) architecture=x86_64 ;;
    aarch64) architecture=arm64 ;;
    *) fail "Unsupported desktop architecture: $(uname -m)" ;;
  esac

  release="$(find_release)"
  asset="$(jq -ce --arg suffix "-$architecture.AppImage" '
    .assets[] | select(.name | startswith("T3-Code-") and endswith($suffix))
  ' <<< "$release")" || fail "The release has no AppImage for $architecture."
  url="$(jq -er '.browser_download_url' <<< "$asset")"
  digest="$(jq -er '.digest' <<< "$asset")" \
    || fail "The release does not provide an AppImage SHA-256 digest."

  [[ "$url" == https://github.com/pingdotgg/t3code/releases/download/* ]] \
    || fail "The AppImage download URL is not an upstream release."
  [[ "$digest" =~ ^sha256:[0-9a-f]{64}$ ]] \
    || fail "The release does not provide an AppImage SHA-256 digest."

  printf 'Downloading T3 Code %s...\n' "$(jq -r '.tag_name' <<< "$release")"
  curl --fail --show-error --location "$url" -o "$staging_directory/T3-Code.AppImage"
  expected="${digest#sha256:}"
  actual="$(sha256sum "$staging_directory/T3-Code.AppImage")"
  actual="${actual%% *}"
  [ "$actual" = "$expected" ] || fail "AppImage checksum mismatch; the existing installation is unchanged."

  chmod 755 "$staging_directory/T3-Code.AppImage"
  mv -f "$staging_directory/T3-Code.AppImage" "$appimage"
  printf 'Installed desktop app at %s.\n' "$appimage"
}

install_cli() {
  if [ -x "$cli_directory/t3" ]; then
    return
  fi

  curl --fail --silent --show-error --location \
    https://t3.codes/install.sh -o "$staging_directory/install-cli.sh"
  T3CODE_CHANNEL="$channel" T3CODE_INSTALL_BIN_DIR="$cli_directory" \
    sh "$staging_directory/install-cli.sh"
}

for argument in "$@"; do
  case "$argument" in
    --update-desktop) update_desktop=true ;;
    --help)
      printf 'Usage: t3code-install [--update-desktop]\nInstalls missing T3 desktop and CLI binaries. Existing versions are preserved.\n'
      exit 0
      ;;
    *) fail "Unknown argument: $argument" ;;
  esac
done

case "$channel" in
  stable|nightly) ;;
  *) fail "T3CODE_CHANNEL must be stable or nightly." ;;
esac

if [ -n "$version" ] && [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-nightly\.[0-9]{8}\.[0-9]+)?$ ]]; then
  fail "T3CODE_VERSION must be a stable or nightly release version."
fi

install -d "$app_directory"
exec 9>"$app_directory/.install.lock"
flock 9

if [ -s "$appimage" ] && [ -x "$cli_directory/t3" ] && [ "$update_desktop" = false ]; then
  exit 0
fi

staging_directory="$(mktemp -d "$app_directory/.install-XXXXXX")"
trap cleanup EXIT

install_desktop
install_cli
