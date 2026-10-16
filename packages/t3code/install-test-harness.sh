: "${installer:?}" "${out:?}"

payload='test AppImage payload'
payload_digest="$(printf '%s' "$payload" | sha256sum)"
payload_digest="${payload_digest%% *}"

# Exported functions take precedence over the runtimeInputs the packaged script puts on PATH.
curl() {
  local output='' url='' file
  while [ "$#" -gt 0 ]; do
    case "$1" in
      -o) output="$2"; shift 2 ;;
      https://*) url="$1"; shift ;;
      *) shift ;;
    esac
  done
  [ ! -e "$TEST_FIXTURES/offline" ] || return 22
  printf '%s\n' "$url" >> "$TEST_FIXTURES/requests"
  case "$url" in
    */releases\?*) file="$TEST_FIXTURES/releases" ;;
    *releases/tags/*) file="$TEST_FIXTURES/exact-release" ;;
    *.AppImage) file="$TEST_FIXTURES/AppImage" ;;
    https://t3.codes/install.sh) file="$TEST_FIXTURES/installer" ;;
    *) return 1 ;;
  esac
  if [ -n "$output" ]; then cp "$file" "$output"; else cat "$file"; fi
}
uname() { printf 'x86_64\n'; }
export -f curl uname

release() {
  local name="T3-Code-${1#v}-x86_64.AppImage"
  jq -nc --arg tag "$1" --arg name "$name" --arg digest "sha256:$payload_digest" '{
    tag_name: $tag, draft: false, published_at: "2026-10-02T00:00:00Z",
    assets: [{name: $name, digest: $digest,
      browser_download_url: "https://github.com/pingdotgg/t3code/releases/download/\($tag)/\($name)"}]
  }'
}

write_releases() {
  printf '%s\n' "$@" | jq -s . > "$fixtures/releases"
  printf '%s\n' "$1" > "$fixtures/exact-release"
}

start_case() {
  case_name="$1"
  root="$(mktemp -d)"
  home="$root/home" fixtures="$root/fixtures"
  appimage="$home/.local/share/t3code/T3-Code.AppImage" cli="$home/.local/bin/t3"
  nightly="$(release v1.0.0-nightly.20261002.1)"
  extra_env=()
  mkdir -p "$home" "$fixtures"
  printf '%s' "$payload" > "$fixtures/AppImage"
  cat > "$fixtures/installer" <<'EOF'
mkdir -p "$T3CODE_INSTALL_BIN_DIR"
printf '#!/bin/sh\nexit 0\n' > "$T3CODE_INSTALL_BIN_DIR/t3"
chmod 755 "$T3CODE_INSTALL_BIN_DIR/t3"
printf '%s' "$T3CODE_CHANNEL" > "$TEST_FIXTURES/cli-channel"
EOF
  write_releases "$nightly"
}

install_existing_binaries() {
  mkdir -p "${appimage%/*}" "${cli%/*}"
  printf 'existing desktop version' > "$appimage"
  printf '#!/bin/sh\nexit 0\n' > "$cli"
  chmod 755 "$cli"
}

run_installer() {
  status=0
  env HOME="$home" XDG_DATA_HOME="$home/.local/share" TEST_FIXTURES="$fixtures" PATH=/var/empty \
    "${extra_env[@]}" "$installer" "$@" > "$root/stdout" 2> "$root/stderr" || status=$?
}

fail() {
  printf 'FAIL %s: %s\n' "$case_name" "$1" >&2
  cat "$root/stderr" >&2
  exit 1
}
expect_success() { [ "$status" -eq 0 ] || fail "exited with $status"; }
expect_failure() { [ "$status" -ne 0 ] || fail "exited successfully"; }
expect_content() { [ -f "$1" ] && [ "$(< "$1")" = "$2" ] || fail "$1 does not contain '$2'"; }
expect_stderr() { grep -qF -- "$1" "$root/stderr" || fail "stderr lacks '$1'"; }
expect_requested() { grep -qF -- "$1" "$fixtures/requests" || fail "no request matched '$1'"; }
expect_no_requests() { [ ! -e "$fixtures/requests" ] || fail "the network was accessed"; }
expect_no_staging() { ! compgen -G "${appimage%/*}/.install-*" > /dev/null || fail "staging was left behind"; }
expect_existing_desktop() { expect_content "$appimage" 'existing desktop version'; }
