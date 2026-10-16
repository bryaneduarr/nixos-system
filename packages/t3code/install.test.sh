start_case 'fresh install defaults to nightly'
run_installer
expect_success
expect_content "$appimage" "$payload"
[ -x "$appimage" ] && [ -x "$cli" ] || fail 'binaries are not executable'
expect_content "$fixtures/cli-channel" nightly
expect_no_staging

start_case 'activation preserves existing versions without network'
install_existing_binaries
run_installer
expect_success
expect_existing_desktop
expect_no_requests

start_case 'explicit desktop update does not update the CLI'
install_existing_binaries
run_installer --update-desktop
expect_success
expect_content "$appimage" "$payload"
[ ! -e "$fixtures/cli-channel" ] || fail 'the CLI installer ran'

start_case 'bad checksum preserves the desktop app'
install_existing_binaries
printf 'corrupted download' > "$fixtures/AppImage"
run_installer --update-desktop
expect_failure
expect_stderr 'checksum mismatch'
expect_existing_desktop
expect_no_staging

start_case 'missing digest preserves the desktop app'
install_existing_binaries
write_releases "$(jq -c '.assets[0].digest = null' <<< "$nightly")"
run_installer --update-desktop
expect_failure
expect_existing_desktop

start_case 'missing CLI does not download the desktop app again'
install_existing_binaries
rm "$cli"
run_installer
expect_success
expect_existing_desktop
expect_content "$fixtures/requests" https://t3.codes/install.sh

start_case 'stable channel excludes nightly releases'
write_releases "$nightly" "$(release v1.0.0)"
extra_env=(T3CODE_CHANNEL=stable)
run_installer
expect_success
expect_requested /v1.0.0/
expect_content "$fixtures/cli-channel" stable

start_case 'exact version uses the tag endpoint'
extra_env=(T3CODE_VERSION=1.0.0-nightly.20261002.1)
run_installer
expect_success
expect_requested /releases/tags/v1.0.0-nightly.20261002.1

start_case 'no matching release installs nothing'
write_releases "$(release v1.0.0-preview.20261002.1)"
run_installer
expect_failure
[ ! -e "$appimage" ] || fail 'the AppImage was installed'

start_case 'bad arguments do not access the network'
run_installer --unknown
expect_failure
expect_no_requests

start_case 'network failure preserves the desktop app'
install_existing_binaries
touch "$fixtures/offline"
run_installer --update-desktop
expect_failure
expect_stderr 'Could not retrieve'
expect_existing_desktop

start_case 'invalid release index exits'
printf '{}' > "$fixtures/releases"
run_installer
expect_failure
expect_stderr 'not a JSON array'

start_case 'broken CLI symlink is repaired'
install_existing_binaries
ln -sf "$home/missing-cli" "$cli"
run_installer
expect_success
[ -x "$cli" ] || fail 'the CLI is not executable'

start_case 'foreign download URL is rejected'
write_releases "$(jq -c '.assets[0].browser_download_url = "https://example.invalid/foreign.AppImage"' <<< "$nightly")"
run_installer
expect_failure
expect_stderr 'not an upstream release'

printf 'passed\n' > "$out"
